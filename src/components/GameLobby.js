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
  Pets as PetsIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Create a wolf-themed, fun, quirky theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4A2545', // Deep purple (wolf night sky)
      light: '#6e3b68',
      dark: '#301731',
    },
    secondary: {
      main: '#F6C026', // Amber yellow (wolf eyes)
      light: '#FFD54F',
      dark: '#C79A00',
    },
    background: {
      default: '#141D26', // Dark blue-grey
      paper: '#243447', // Darker blue-grey
    },
    error: {
      main: '#FF5252',
    },
    success: {
      main: '#66BB6A',
    },
    info: {
      main: '#29B6F6',
    },
    warning: {
      main: '#FFA726',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#AAAAAA',
    },
  },
  typography: {
    fontFamily: '"Quicksand", "Poppins", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4A2545 0%, #6e3b68 100%)',
          boxShadow: '0 6px 12px rgba(74, 37, 69, 0.4)',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(74, 37, 69, 0.6)',
            transform: 'translateY(-2px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #F6C026 0%, #FFD54F 100%)',
          boxShadow: '0 6px 12px rgba(246, 192, 38, 0.4)',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(246, 192, 38, 0.6)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(5px)',
          background: 'linear-gradient(145deg, rgba(36, 52, 71, 0.9) 0%, rgba(20, 29, 38, 0.8) 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'rgba(36, 52, 71, 0.9)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #4A2545 0%, #301731 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid #F6C026',
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

const howl = keyframes`
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1) rotate(5deg);
  }
  50% {
    transform: scale(1.15) rotate(-3deg);
  }
  75% {
    transform: scale(1.1) rotate(2deg);
  }
  100% {
    transform: scale(1);
  }
`;

// Wolf paw print SVG for background
const WolfPawBackground = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      opacity: 0.05,
      pointerEvents: 'none',
      background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%23FFFFFF' d='M30,20 C35,15 40,15 45,20 C50,25 50,30 45,35 C40,40 35,40 30,35 C25,30 25,25 30,20 Z M20,30 C25,25 30,25 35,30 C40,35 40,40 35,45 C30,50 25,50 20,45 C15,40 15,35 20,30 Z M40,30 C45,25 50,25 55,30 C60,35 60,40 55,45 C50,50 45,50 40,45 C35,40 35,35 40,30 Z M30,40 C35,35 40,35 45,40 C50,45 50,50 45,55 C40,60 35,60 30,55 C25,50 25,45 30,40 Z'/%3E%3C/svg%3E") repeat`,
    }}
  />
);

// Moon image for background
const MoonBackground = () => (
  <Box
    sx={{
      position: 'fixed',
      top: '5%',
      right: '5%',
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,235,170,0.7) 0%, rgba(255,235,170,0) 70%)',
      boxShadow: '0 0 60px 30px rgba(255,235,170,0.3)',
      zIndex: -1,
      opacity: 0.8,
      pointerEvents: 'none',
    }}
  />
);

function GameLobby({ user, roomData, onLogout, onLeaveLobby }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState(roomData?.current_players || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState({});
  const [showCopiedSnackbar, setShowCopiedSnackbar] = useState(false);
  const [showHowl, setShowHowl] = useState(false);
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
      
      // Attempt to reconnect if not closed intentionally (code 1000) and not redirecting to game
      if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
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
    };
  }, [roomCode, user?.username]);

  // WebSocket message handlers
  const handlePlayerJoined = useCallback((playerName) => {
    setPlayers(prevPlayers => {
        const playerExists = prevPlayers.some(p => p.user__username === playerName);
        if (!playerExists) {
          return [...prevPlayers, { user__username: playerName }];
        }
        return prevPlayers;
      });
  }, []);

  const handlePlayerLeft = useCallback((playerName) => {
    setPlayers(prevPlayers => prevPlayers.filter(p => p.user__username !== playerName));
  }, []);

  const handleGameStart = useCallback((data) => {
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

    // Howl animation at random intervals
    const howlInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of showing the howl
        setShowHowl(true);
        setTimeout(() => setShowHowl(false), 2000);
      }
    }, 10000);

    // Cleanup function
    return () => {
      clearInterval(pingInterval);
      clearInterval(howlInterval);
      
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
          message: 'The pack leader has started the hunt!'
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
    // Generate wolf-themed avatar colors
    const colors = [
      '#4A2545', // Deep purple
      '#614051', // Muted purple
      '#301731', // Dark purple
      '#594157', // Mauve
      '#433545', // Slate purple
      '#5D4361', // Medium purple
      '#382436', // Eggplant
      '#503A4B', // Plum
      '#6e3b68', // Lighter purple
      '#3F2E4B'  // Dark violet
    ];
    
    const charSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #141D26 0%, #1D2B3A 100%)',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          pt: 8, // To account for the AppBar
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative backgrounds */}
        <WolfPawBackground />
        <MoonBackground />
        
        {/* Howling wolf animation */}
        {showHowl && (
          <Box
            sx={{
              position: 'fixed',
              bottom: '5%',
              left: '2%',
              width: '100px',
              height: '100px',
              zIndex: 10,
              opacity: 0.8,
              animation: `${howl} 2s ease-in-out`,
            }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50,20 C60,15 70,25 75,40 C80,55 85,60 90,65 L80,75 C70,65 65,60 60,50 C55,40 55,35 50,30 C45,35 45,40 40,50 C35,60 30,65 20,75 L10,65 C15,60 20,55 25,40 C30,25 40,15 50,20 Z"
                fill="#F6C026"
                opacity="0.8"
              />
              <circle cx="40" cy="35" r="2" fill="#000" />
              <circle cx="60" cy="35" r="2" fill="#000" />
            </svg>
          </Box>
        )}

        {/* AppBar with Wolf Theme */}
        <AppBar position="fixed" elevation={3}>
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <PetsIcon sx={{ fontSize: 28 }} />
            </IconButton>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                {roomData?.room_name || "Wolf's Den"}
                <Chip 
                  label={`Pack Code: ${roomCode}`} 
                  size="small" 
                  variant="outlined" 
                  onClick={copyRoomCode} 
                  sx={{ 
                    ml: 1, 
                    color: 'white', 
                    borderColor: 'rgba(246, 192, 38, 0.7)',
                    '&:hover': { backgroundColor: 'rgba(246, 192, 38, 0.1)' }
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
                variant="contained" 
                color="secondary" 
                startIcon={<ExitIcon />} 
                onClick={handleLeaveRoom}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Leave Pack
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
        <Container maxWidth="xl" sx={{ mt: 4, pb: 4 }}>
          {/* Error Message */}
          {error && (
            <Fade in={Boolean(error)}>
              <Paper 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  border: '1px solid', 
                  borderColor: 'error.main',
                  bgcolor: 'rgba(255, 82, 82, 0.15)',
                  color: 'error.light',
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
            </Fade>
          )}

          {/* Main Content Cards in a Full-Width Layout */}
          <Grid container spacing={3}>
            {/* Left Section - Pack Members (Players) */}
            <Grid item xs={12} md={4}>
              <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                <Card>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      pb: 2,
                      borderBottom: '2px solid',
                      borderColor: 'rgba(246, 192, 38, 0.3)'
                    }}>
                      <PetsIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="h6" component="h3">
                        Wolf Pack ({players.length}/{roomData?.max_players || 10})
                      </Typography>
                    </Box>
                    
                    <List sx={{ p: 1 }}>
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
                              mb: 1.5,
                              bgcolor: player.user__username === user.username ? 'rgba(246, 192, 38, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: 'rgba(246, 192, 38, 0.2)',
                                transform: 'translateX(5px)',
                              },
                              borderLeft: player.user__username === user.username ? 
                                '3px solid #F6C026' : '1px solid rgba(255, 255, 255, 0.1)',
                              px: 2
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar 
                                sx={{ 
                                  bgcolor: getRandomAvatarColor(player.user__username),
                                  animation: player.user__username === user.username ? `${bounce} 3s infinite` : 'none',
                                  boxShadow: player.user__username === user.username ? 
                                    '0 0 10px rgba(246, 192, 38, 0.5)' : 'none',
                                }}
                              >
                                {player.user__username?.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Typography sx={{ 
                                  fontWeight: player.user__username === user.username ? 600 : 400,
                                  fontSize: player.user__username === user.username ? '1.1rem' : '1rem',
                                }}>
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
                                  <PetsIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  Alpha Wolf
                                </Box> : null
                              }
                            />
                          </ListItem>
                        </Fade>
                      ))}
                      
                      {players.length === 0 && (
                        <Box sx={{ 
                          py: 6, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          color: 'text.secondary' 
                        }}>
                          <EmojiIcon sx={{ fontSize: 60, mb: 2, opacity: 0.4 }} />
                          <Typography>Waiting for wolves to join the pack...</Typography>
                        </Box>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Middle Section - Game Controls & Pack Information */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {/* Game Controls */}
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <Card sx={{ 
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Wolf silhouette background */}
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: '-10%',
                        right: '-5%',
                        width: '200px',
                        height: '200px',
                        opacity: 0.07,
                        zIndex: 0,
                        transform: 'rotate(10deg)',
                      }}
                    >
                      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M50,20 C60,15 70,25 75,40 C80,55 85,60 90,65 L80,75 C70,65 65,60 60,50 C55,40 55,35 50,30 C45,35 45,40 40,50 C35,60 30,65 20,75 L10,65 C15,60 20,55 25,40 C30,25 40,15 50,20 Z"
                          fill="#FFFFFF"
                        />
                      </svg>
                    </Box>
                    
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 3,
                        pb: 2,
                        borderBottom: '2px solid',
                        borderColor: 'rgba(246, 192, 38, 0.3)'
                      }}>
                        <ControllerIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="h6" component="h3">
                          Wolf Hunt Controls
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        p: 4,
                        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)',
                      }}>
                        {isHost ? (
                          <>
                            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}>
                              As the Alpha Wolf, it's your call to begin the hunt!
                            </Typography>
                            
                            <Button
                              variant="contained"
                              color="secondary"
                              size="large"
                              startIcon={<GameIcon sx={{ 
                                animation: (!loading && players.length >= 2 && wsConnected)
                                ? `${spin} 4s infinite linear` : 'none' 
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
                                  Starting Hunt...
                                </Box>
                              ) : 'Begin the Hunt'}
                            </Button>
                            
                            {players.length < 2 && (
                              <Typography 
                                variant="body2" 
                                color="error" 
                                sx={{ mt: 2 }}
                              >
                                At least 2 wolves are needed for the hunt
                              </Typography>
                            )}
                            
                            {!wsConnected && (
                              <Typography 
                                variant="body2" 
                                color="error"
                                sx={{ mt: 2 }}
                              >
                                Cannot start while disconnected from the pack
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
                              Awaiting the Alpha's call to begin the hunt...
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>

                {/* Pack Information */}
                <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        pb: 2,
                        borderBottom: '2px solid',
                        borderColor: 'rgba(246, 192, 38, 0.3)'
                      }}>
                        <InfoIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="h6" component="h3">
                          Wolf Pack Information
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'background.default',
                              height: '100%',
                              borderRadius: 4,
                            }}
                          >
                            <Typography variant="subtitle2" color="text.secondary">Pack Name</Typography>
                            <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>{roomInfo?.room_name || roomData?.room_name}</Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'background.default',
                              height: '100%',
                              borderRadius: 3
                            }}
                          >
                            <Typography variant="subtitle2" color="text.secondary">Pack Size Limit</Typography>
                            <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
                              {roomData?.max_players || roomInfo?.max_players || 10} wolves
                            </Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Paper 
                            sx={{ 
                              p: 3, 
                              bgcolor: 'primary.dark',
                              color: 'primary.contrastText',
                              border: 'none',
                              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                              borderRadius: 3
                            }}
                            elevation={3}
                          >
                            <Typography variant="subtitle2">Share this code with your pack:</Typography>
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
                                  letterSpacing: 3,
                                  fontFamily: 'monospace',
                                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                }}
                              >
                                {roomCode}
                              </Typography>
                              
                              <Tooltip title="Copy to clipboard">
                                <IconButton 
                                  onClick={copyRoomCode}
                                  color="inherit"
                                  sx={{ 
                                    bgcolor: 'rgba(246, 192, 38, 0.2)',
                                    '&:hover': {
                                      bgcolor: 'rgba(246, 192, 38, 0.3)',
                                      transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
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
        message="Pack code copied to clipboard!"
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