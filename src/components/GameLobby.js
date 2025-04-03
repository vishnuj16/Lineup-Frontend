import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Material UI imports
import { 
  AppBar, Avatar, Badge, Box, Button, Card, CardContent, 
  CircularProgress, Container, Divider, Fade, Grid, 
  IconButton, List, ListItem, ListItemAvatar, ListItemText, 
  Paper, Snackbar, Stack, Toolbar, Tooltip, Typography, Zoom, Chip
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Casino as CasinoIcon,
  ExitToApp as ExitIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  SportsEsports as GameIcon,
  VideogameAsset as ControllerIcon,
  Visibility as EyeIcon,
  ErrorOutline as ErrorIcon,
  CheckCircleOutline as SuccessIcon,
  Info as InfoIcon,
  EmojiEmotions as EmojiIcon,
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Create a fun, quirky theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea', // Vibrant purple
    },
    secondary: {
      main: '#00e676', // Bright green
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    error: {
      main: '#ff3d00',
    },
    success: {
      main: '#00c853',
    },
    info: {
      main: '#00b0ff',
    },
    warning: {
      main: '#ffab00',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
        },
        containedPrimary: {
          boxShadow: '0 4px 10px rgba(98, 0, 234, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(98, 0, 234, 0.4)',
          },
        },
        containedSecondary: {
          boxShadow: '0 4px 10px rgba(0, 230, 118, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(0, 230, 118, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Animation keyframes
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

function GameLobby({ user, roomData, onLogout, onLeaveLobby }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState(roomData?.current_players || []);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState({});
  const [showCopiedSnackbar, setShowCopiedSnackbar] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  useEffect(() => {
    setIsHost(roomInfo.host == user.username);
  }, [roomInfo, user.username]);

  const getRoomData = async() => {
    try {
      const response = await axios.get(`http://localhost:8000/api/game/get-room-details/?room_code=${roomCode}`);
      setRoomInfo(response.data);
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  }
  
  // Establish the WebSocket connection with reconnection logic
  const connectWebSocket = useCallback(() => {
    if (!roomCode || !user?.username) return;
    
    const token = localStorage.getItem('access_token');
    const wsURL = `ws://localhost:8000/ws/lobby/${roomCode}/?token=${token}`;
    
    // Clean up any existing connection
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
      return;
    }
    
    const socket = new WebSocket(wsURL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setWsConnected(true);
      reconnectAttemptsRef.current = 0;
      setMessages(prev => [...prev, { type: 'system', content: 'Connected to game lobby' }]);
      
      // Send player_joined message when connection is established
      socket.send(JSON.stringify({ 
        type: 'player_joined', 
        player: user.id 
      }));

      getRoomData();
      setIsHost(roomInfo.host == user.username);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        switch (data.type) {
          case 'player_joined':
            handlePlayerJoined(data.player);
            break;
          case 'player_left':
            handlePlayerLeft(data.player);
            break;
          case 'game_start':
            handleGameStart(data);
            break;
          case 'error':
            setError(data.message || 'An error occurred');
            break;
          default:
            console.log('Unknown message type:', data.type);
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed', event);
      setWsConnected(false);
      setMessages(prev => [...prev, { type: 'system', content: 'Disconnected from game lobby' }]);
      
      // Attempt to reconnect if not closed intentionally (code 1000) and not redirecting to game
      if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        setMessages(prev => [...prev, { 
          type: 'system', 
          content: `Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})...` 
        }]);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connectWebSocket();
        }, RECONNECT_DELAY);
      } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setError('Failed to connect after multiple attempts. Please refresh the page to try again.');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setMessages(prev => [...prev, { type: 'error', content: 'Error connecting to game lobby' }]);
    };
  }, [roomCode, user?.username]);

  // WebSocket message handlers
  const handlePlayerJoined = useCallback((playerName) => {
    setPlayers(prevPlayers => {
        const playerExists = prevPlayers.some(p => p.user__username === playerName);
        if (!playerExists) {
            setMessages(prev => [...prev, { 
                type: 'player_joined', 
                content: `${playerName} has joined the game` 
              }]);
          return [...prevPlayers, { user__username: playerName }];
        }
        return prevPlayers;
      });
  }, []);

  const handlePlayerLeft = useCallback((playerName) => {
    setMessages(prev => [...prev, { 
      type: 'player_left', 
      content: `${playerName} has left the game` 
    }]);
    
    setPlayers(prevPlayers => prevPlayers.filter(p => p.user__username !== playerName));
  }, []);

  const handleGameStart = useCallback((data) => {
    setMessages(prev => [...prev, { 
      type: 'game_start', 
      content: data.message || 'Game is starting!' 
    }]);
    
    // Close the current WebSocket connection with normal closure code
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close(1000);
    }
    
    // Navigate to game screen
    navigate(`/game/${roomCode}`);
  }, [navigate, roomCode]);

  // Setup and cleanup
  useEffect(() => {
    if (!roomData && roomCode) {
      // If we don't have room data but have a room code, navigate back to start
      navigate('/start');
      return;
    }

    // Check if current user is the host
    if (roomData) {
      setIsHost(roomInfo.host == user.username);
      console.log('Is Host:', isHost, roomInfo.host, user.username);
      
      // Initialize players from roomData if available
      if (roomData.current_players) {
        setPlayers(roomData.current_players);
      }
    }

    // Connect to WebSocket
    connectWebSocket();

    // Ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds

    // Cleanup function
    return () => {
      clearInterval(pingInterval);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        // Send player_left message before closing
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ 
            type: 'player_left', 
            player: user.username 
          }));
          
          // Close with normal closure code
          socketRef.current.close(1000);
        }
      }
    };
  }, [roomData, roomCode, navigate, user, connectWebSocket]);

  const handleStartGame = async () => {
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/api/game/start-game/', { room_code: roomCode });
      
      // Send WebSocket message to notify all clients
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ 
          type: 'game_start',
          message: 'The host has started the game!'
        }));
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    setLoading(true);

    try {
      // Send WebSocket message before API call
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ 
          type: 'player_left', 
          player: user.username 
        }));
      }
      
      await axios.post('http://localhost:8000/api/game/leave-room/', { room_code: roomCode });
      onLeaveLobby();
      navigate('/start');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to leave room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setShowCopiedSnackbar(true);
  };

  const getRandomAvatarColor = (username) => {
    // Generate a consistent color based on username
    const colors = [
      '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', 
      '#4caf50', '#8bc34a', '#cddc39', '#ffc107'
    ];
    
    const charSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const getMessageIcon = (type) => {
    switch(type) {
      case 'player_joined':
        return <SuccessIcon sx={{ color: 'success.main' }} />;
      case 'player_left':
        return <ExitIcon sx={{ color: 'warning.main' }} />;
      case 'game_start':
        return <GameIcon sx={{ color: 'info.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <InfoIcon sx={{ color: 'primary.main' }} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(98,0,234,0.05) 0%, rgba(0,230,118,0.05) 100%)',
          pt: 8, // To account for the AppBar
        }}
      >
        {/* AppBar */}
        <AppBar position="fixed" color="primary" elevation={3}>
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <CasinoIcon sx={{ fontSize: 28 }} />
            </IconButton>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                {roomData?.room_name || 'Game Lobby'}
                <Chip 
                  label={`Code: ${roomCode}`} 
                  size="small" 
                  variant="outlined" 
                  onClick={copyRoomCode} 
                  sx={{ 
                    ml: 1, 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }} 
                />
              </Box>
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Zoom in={wsConnected}>
                <Badge 
                  variant="dot" 
                  color="secondary" 
                  overlap="circular" 
                  sx={{ mr: 2, animation: wsConnected ? `${pulse} 2s infinite` : 'none' }}
                >
                  <EyeIcon />
                </Badge>
              </Zoom>
              
              <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<ExitIcon />} 
                onClick={handleLeaveRoom}
                disabled={loading}
                sx={{ mr: 1, borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Leave
              </Button>
              
              <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<LogoutIcon />}
                onClick={onLogout}
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        
        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {/* Error Message */}
          {error && (
            <Paper 
              sx={{ 
                p: 2, 
                mb: 3, 
                border: '1px solid', 
                borderColor: 'error.main',
                bgcolor: 'error.light',
                color: 'error.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorIcon sx={{ mr: 1 }} />
                <Typography variant="body1">{error}</Typography>
              </Box>
              {!wsConnected && (
                <Button 
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    reconnectAttemptsRef.current = 0;
                    setError('');
                    connectWebSocket();
                  }}
                >
                  Reconnect
                </Button>
              )}
            </Paper>
          )}

          {/* Main Grid Layout */}
          <Grid container spacing={3}>
            {/* Left Panel - Player List */}
            <Grid item xs={12} md={4}>
              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" component="h3">
                        Players ({players.length}/{roomData?.max_players || 10})
                      </Typography>
                    </Box>
                    
                    <List sx={{ p: 0 }}>
                      {players.map((player, index) => (
                        <Fade 
                          key={index} 
                          in={true} 
                          style={{ 
                            transitionDelay: `${index * 100}ms`,
                          }}
                        >
                          <ListItem 
                            sx={{ 
                              borderRadius: 2,
                              mb: 1,
                              bgcolor: player.user__username === user.username ? 'rgba(98, 0, 234, 0.08)' : 'transparent',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: 'rgba(98, 0, 234, 0.15)',
                              }
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                sx={{ 
                                  bgcolor: getRandomAvatarColor(player.user__username),
                                  animation: player.user__username === user.username ? `${bounce} 2s infinite` : 'none'
                                }}
                              >
                                {player.user__username?.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Typography sx={{ fontWeight: player.user__username === user.username ? 600 : 400 }}>
                                  {player.user__username}
                                  {player.user__username === user.username && " (You)"}
                                </Typography>
                              }
                              secondary={
                                isHost && player.user__username === user.username ? 
                                <Box component="span" sx={{ 
                                  color: 'secondary.main', 
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  <CasinoIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  Host
                                </Box> : null
                              }
                            />
                          </ListItem>
                        </Fade>
                      ))}
                      
                      {players.length === 0 && (
                        <Box sx={{ 
                          py: 4, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          color: 'text.secondary' 
                        }}>
                          <EmojiIcon sx={{ fontSize: 40, mb: 2, opacity: 0.6 }} />
                          <Typography>Waiting for players to join...</Typography>
                        </Box>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Right Panel - Activity Feed & Controls */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {/* Activity Feed */}
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        pb: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="h6" component="h3">
                          Lobby Activity
                        </Typography>
                      </Box>
                      
                      <Box sx={{ maxHeight: 200, overflowY: 'auto', p: 1 }}>
                        {messages.map((msg, index) => (
                          <Fade key={index} in={true}>
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              mb: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'background.default',
                            }}>
                              {getMessageIcon(msg.type)}
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  ml: 1,
                                  color: msg.type === 'error' ? 'error.main' : 
                                        msg.type === 'player_joined' ? 'success.main' : 
                                        msg.type === 'player_left' ? 'warning.main' : 
                                        msg.type === 'game_start' ? 'info.main' : 'text.primary'
                                }}
                              >
                                {msg.content}
                              </Typography>
                            </Box>
                          </Fade>
                        ))}
                        
                        {messages.length === 0 && (
                          <Box sx={{ 
                            py: 4, 
                            display: 'flex', 
                            justifyContent: 'center',
                            color: 'text.secondary' 
                          }}>
                            <Typography>Waiting for activity...</Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>

                {/* Game Controls */}
                <Zoom in={true} style={{ transitionDelay: '300ms' }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        pb: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <ControllerIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="h6" component="h3">
                          Game Controls
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        p: 2
                      }}>
                        {isHost ? (
                          <>
                            <Typography sx={{ mb: 2, textAlign: 'center' }}>
                              As the host, you can start the game when all players are ready.
                            </Typography>
                            
                            <Button
                              variant="contained"
                              color="secondary"
                              size="large"
                              startIcon={<GameIcon sx={{ 
                                animation: (!loading && players.length >= 2 && wsConnected) ? 
                                  `${spin} 4s infinite linear` : 'none' 
                              }} />}
                              onClick={handleStartGame}
                              disabled={loading || players.length < 2 || !wsConnected}
                              sx={{ 
                                minWidth: 200,
                                py: 1.5,
                                animation: (!loading && players.length >= 2 && wsConnected) ? 
                                  `${pulse} 2s infinite` : 'none'
                              }}
                            >
                              {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                  Starting Game...
                                </Box>
                              ) : 'Start Game'}
                            </Button>
                            
                            {players.length < 2 && (
                              <Typography 
                                variant="body2" 
                                color="error" 
                                sx={{ mt: 2 }}
                              >
                                At least 2 players are required to start the game
                              </Typography>
                            )}
                            
                            {!wsConnected && (
                              <Typography 
                                variant="body2" 
                                color="error"
                                sx={{ mt: 2 }}
                              >
                                Cannot start game while disconnected
                              </Typography>
                            )}
                          </>
                        ) : (
                          <Box sx={{ 
                            p: 3, 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                          }}>
                            <CircularProgress 
                              color="secondary" 
                              size={40} 
                              thickness={4}
                              sx={{ mb: 2 }}
                            />
                            <Typography>
                              Waiting for the host to start the game...
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>

                {/* Room Info */}
                <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        pb: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <CasinoIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="h3">
                          Room Information
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'background.default',
                              height: '100%'
                            }}
                          >
                            <Typography variant="subtitle2" color="text.secondary">Room Name</Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>{roomData?.room_name}</Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'background.default',
                              height: '100%'
                            }}
                          >
                            <Typography variant="subtitle2" color="text.secondary">Max Players</Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {roomData?.max_players || 10}
                            </Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              border: 'none'
                            }}
                          >
                            <Typography variant="subtitle2">Share this code with friends:</Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              mt: 1 
                            }}>
                              <Typography 
                                variant="h4" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  letterSpacing: 2,
                                  fontFamily: 'monospace'
                                }}
                              >
                                {roomCode}
                              </Typography>
                              
                              <Tooltip title="Copy to clipboard">
                                <IconButton 
                                  onClick={copyRoomCode}
                                  color="inherit"
                                  sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,255,255,0.3)',
                                    }
                                  }}
                                >
                                  <ContentCopyIcon />
                                </IconButton>
                                </Tooltip>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Zoom>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Snackbar for copy notification */}
      <Snackbar
        open={showCopiedSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowCopiedSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Room code copied to clipboard!"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setShowCopiedSnackbar(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </ThemeProvider>
  );
}

export default GameLobby;