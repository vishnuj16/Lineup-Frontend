import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
// Material UI imports
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container, 
  Grid, 
  Chip, 
  LinearProgress, 
  Card, 
  CardContent, 
  Avatar, 
  ThemeProvider, 
  createTheme, 
  CircularProgress, 
  Divider, 
  Zoom,
  Fade,
  Grow,
  Slide
} from '@mui/material';
import { 
  PetsRounded, 
  TimerOutlined, 
  SignalWifiStatusbarConnectedNoInternet4, 
  SignalWifiStatusbar4Bar, 
  HighlightOff, 
  SportsScore, 
  EmojiEvents, 
  Send,
  WarningAmber,
  ExitToApp,
  FormatListNumbered,
  KeyboardArrowRight,
  KeyboardReturn,
  PlayArrow,
  NightlightRound,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Import your existing components
import ConnectionStatus from './ConnectionStatus';
import RankingContainer from './RankingContainer';
import {StatusBanner, Timer} from './TimeAndStatus';
// import ResultsDisplay from './ResultsDisplay';

// Import CSS with override styling
import './GamePlay.css';

// Create a custom wolf theme
const wolfTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C5DF9', // Vibrant purple for primary actions
      light: '#9C81FF',
      dark: '#5D3FD3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF7E5F', // Warm orange for accents and wolf elements
      light: '#FFA183',
      dark: '#D65A3F',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0F0D1F', // Deep rich blue-black background
      paper: '#1A172E', // Slightly lighter variant for cards
    },
    text: {
      primary: '#F0F0FF', // Light lavender text
      secondary: '#B9B8CE', // Muted purple-gray for secondary text
    },
    error: {
      main: '#FF5C77', // Bright pink-red for errors
    },
    warning: {
      main: '#FFB547', // Gold-yellow for warnings
    },
    success: {
      main: '#5CDB95', // Minty green for success
    },
    info: {
      main: '#64D2FF', // Bright sky blue for info
    },
  },
  typography: {
    fontFamily: "'Quicksand', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.03em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '10px 24px',
          boxShadow: '0 4px 14px 0 rgba(124, 93, 249, 0.39)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px 0 rgba(124, 93, 249, 0.45)',
          },
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #7C5DF9 0%, #9C81FF 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #6B4CF5 0%, #8B6FFF 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #FF7E5F 0%, #FFA183 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF6D4C 0%, #FF8F6D 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, rgba(124, 93, 249, 0.05), rgba(255, 126, 95, 0.03))',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
          borderRadius: 24,
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        },
        elevation2: {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        },
        elevation3: {
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'visible',
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid #7C5DF9',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
});


// Ensure CSS animations work with Material UI
const styles = {
  '@keyframes pulse': {
    '0%': {
      opacity: 0.6,
      transform: 'scale(0.95)',
    },
    '50%': {
      opacity: 1,
      transform: 'scale(1.05)',
    },
    '100%': {
      opacity: 0.6,
      transform: 'scale(0.95)',
    },
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
  },
  '@keyframes slideIn': {
    '0%': {
      transform: 'translateX(-20px)',
      opacity: 0,
    },
    '100%': {
      transform: 'translateX(0)',
      opacity: 1,
    },
  },
  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': {
      transform: 'translateY(0)',
    },
    '40%': {
      transform: 'translateY(-20px)',
    },
    '60%': {
      transform: 'translateY(-10px)',
    },
  },
};

// Custom styled components
const WolfAvatar = ({ isWolf, username }) => {
  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const getColor = (name) => {
    // Generate a unique hue based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 65%)`;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: 50,
        height: 50,
      }}
    >
      <Avatar
        sx={{
          width: 50,
          height: 50,
          bgcolor: isWolf ? 'secondary.main' : getColor(username),
          border: isWolf ? '3px solid' : '2px solid',
          borderColor: isWolf ? 'secondary.light' : 'primary.light',
          fontSize: 20,
          fontWeight: 'bold',
          boxShadow: isWolf 
            ? '0 0 10px rgba(255, 126, 95, 0.5), 0 0 20px rgba(255, 126, 95, 0.3)'
            : '0 4px 10px rgba(0, 0, 0, 0.2)',
          animation: isWolf ? 'pulse 2s infinite' : 'none',
          zIndex: 2,
        }}
      >
        {getInitials(username)}
      </Avatar>
      
      {/* Wolf ears if isWolf */}
      {isWolf && (
        <>
          {/* Left ear */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              left: 6,
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '20px solid #FF7E5F',
              transform: 'rotate(-20deg)',
              zIndex: 1,
            }}
          />
          {/* Right ear */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              right: 6,
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderBottom: '20px solid #FF7E5F',
              transform: 'rotate(20deg)',
              zIndex: 1,
            }}
          />
        </>
      )}
    </Box>
  );
};

// Enhanced Timer Component
const EnhancedTimer = ({ timeLeft }) => {
  const percentage = (timeLeft / 60) * 100; // Assuming max time is 60 seconds
  const color = timeLeft > 20 ? wolfTheme.palette.success.main 
              : timeLeft > 10 ? wolfTheme.palette.warning.main 
              : wolfTheme.palette.error.main;
  
  return (
    <Box sx={{ position: 'relative', width: '100%', mt: 2, mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <TimerOutlined color="action" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          Time Remaining: <span style={{ color }}>{timeLeft}s</span>
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        sx={{ 
          height: 10, 
          borderRadius: 5,
          bgcolor: alpha(color, 0.2),
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 5,
            background: `linear-gradient(90deg, ${alpha(color, 0.7)} 0%, ${color} 100%)`,
          },
        }} 
      />
    </Box>
  );
};

// Enhanced Status Banner Component
const EnhancedStatusBanner = ({ roundStatus, isWolf }) => {
  let message = '';
  let bgColor = '';
  let icon = null;
  
  switch (roundStatus) {
    case 'waiting':
      message = 'Waiting for the next round to start...';
      bgColor = alpha(wolfTheme.palette.info.main, 0.15);
      icon = <NightlightRound sx={{ mr: 1, color: wolfTheme.palette.info.main }} />;
      break;
    case 'wolf_ranking':
      message = isWolf 
        ? 'You are the Wolf! Rank the players in your order' 
        : 'The Wolf is ranking players...';
      bgColor = alpha(wolfTheme.palette.secondary.main, 0.15);
      icon = <PetsRounded sx={{ mr: 1, color: wolfTheme.palette.secondary.main }} />;
      break;
    case 'pack_ranking':
      message = 'The Pack Leader is ranking players...';
      bgColor = alpha(wolfTheme.palette.primary.main, 0.15);
      icon = <FormatListNumbered sx={{ mr: 1, color: wolfTheme.palette.primary.main }} />;
      break;
    case 'results':
      message = 'Round Results';
      bgColor = alpha(wolfTheme.palette.success.main, 0.15);
      icon = <SportsScore sx={{ mr: 1, color: wolfTheme.palette.success.main }} />;
      break;
    default:
      message = 'Loading game status...';
      bgColor = alpha(wolfTheme.palette.info.main, 0.15);
  }
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        py: 2, 
        px: 3, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: bgColor,
        borderRadius: 3,
        border: `1px dashed ${alpha(icon?.props?.color || wolfTheme.palette.info.main, 0.5)}`,
      }}
    >
      {icon}
      <Typography 
        variant="h6" 
        fontWeight="bold" 
        sx={{ 
          color: icon?.props?.color || 'info.main',
          animation: roundStatus === 'wolf_ranking' && isWolf ? 'pulse 2s infinite' : 'none',
        }}
      >
        {message}
      </Typography>
    </Paper>
  );
};

const ResultsDisplay = ({ wolfRanking, packRanking, packScore, question }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 4,
          bgcolor: alpha(wolfTheme.palette.success.main, 0.05),
          border: `1px solid ${alpha(wolfTheme.palette.success.main, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            Round Results
          </Typography>
          <Chip 
            label={`Pack Score: ${packScore} Pts`} 
            color="success"
            sx={{ fontWeight: 'bold', p: 0.5 }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 3, 
                bgcolor: alpha(wolfTheme.palette.secondary.main, 0.1),
                border: `1px dashed ${wolfTheme.palette.secondary.main}`,
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="secondary.main" gutterBottom>
                🐺 Wolf's Ranking
              </Typography>
              <Box sx={{ mt: 2 }}>
                {wolfRanking.map((player, index) => (
                  <Paper 
                    key={player.id} 
                    sx={{ 
                      p: 1.5, 
                      mb: 1.5, 
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: alpha(wolfTheme.palette.background.paper, 0.7),
                      borderLeft: `4px solid ${wolfTheme.palette.secondary.main}`,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: wolfTheme.palette.secondary.dark,
                        color: '#fff',
                        fontWeight: 'bold',
                        width: 32,
                        height: 32,
                        fontSize: 16,
                        mr: 2,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">
                      {player.username}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 3, 
                bgcolor: alpha(wolfTheme.palette.primary.main, 0.1),
                border: `1px dashed ${wolfTheme.palette.primary.main}`,
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                🐾 Pack's Ranking
              </Typography>
              <Box sx={{ mt: 2 }}>
                {packRanking.map((player, index) => (
                  <Paper 
                    key={player.id} 
                    sx={{ 
                      p: 1.5, 
                      mb: 1.5, 
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: alpha(wolfTheme.palette.background.paper, 0.7),
                      borderLeft: `4px solid ${wolfTheme.palette.primary.main}`,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: wolfTheme.palette.primary.dark,
                        color: '#fff',
                        fontWeight: 'bold',
                        width: 32,
                        height: 32,
                        fontSize: 16,
                        mr: 2,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Typography variant="body1" fontWeight="medium">
                      {player.username}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

// Connection Status Component
const EnhancedConnectionStatus = ({ status }) => {
  let color;
  let label;
  let icon;
  
  switch (status) {
    case 'connected':
      color = wolfTheme.palette.success.main;
      label = 'Connected';
      icon = <SignalWifiStatusbar4Bar sx={{ color }} />;
      break;
    case 'connecting':
      color = wolfTheme.palette.warning.main;
      label = 'Reconnecting...';
      icon = <SignalWifiStatusbarConnectedNoInternet4 sx={{ color, animation: 'pulse 1.5s infinite' }} />;
      break;
    case 'disconnected':
      color = wolfTheme.palette.error.main;
      label = 'Disconnected';
      icon = <HighlightOff sx={{ color }} />;
      break;
    default:
      color = wolfTheme.palette.text.disabled;
      label = 'Unknown';
      icon = <SignalWifiStatusbarConnectedNoInternet4 sx={{ color }} />;
  }
  
  return (
    <Chip 
      icon={icon}
      label={label}
      sx={{ 
        bgcolor: alpha(color, 0.15),
        color,
        fontWeight: 'bold',
        borderColor: alpha(color, 0.3),
        border: '1px solid',
      }}
      variant="outlined"
    />
  );
};

// Main GamePlay component
function GamePlay({ user, roomData, onLogout, onLeaveLobby }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Game flow states
  const [roundStatus, setRoundStatus] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [players, setPlayers] = useState([]);
  const [isWolf, setIsWolf] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isPackRanker, setIsPackRanker] = useState(false);
  const [wolfId, setWolfId] = useState('');
  const [packRankerId, setPackRankerId] = useState('');
  const [question, setQuestion] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [wolfRanking, setWolfRanking] = useState([]);
  const [packRanking, setPackRanking] = useState([]);
  const [roundResults, setRoundResults] = useState(null);
  const [rankablePlayers, setRankablePlayers] = useState([]);
  const [buttonFeedback, setButtonFeedback] = useState('');

  // All your ref declarations
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef(null);
  const lastPongTimeRef = useRef(Date.now());
  
  // const socketRef = useRef(null);
  // const timerRef = useRef(null);
  // const reconnectTimeoutRef = useRef(null);
  // const reconnectAttemptsRef = useRef(0);
  // const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  const MAX_RECONNECT_ATTEMPTS = 10; // Increase from 5 to 10
  const BASE_RECONNECT_DELAY = 1000; // Start with 1 second
  const MAX_RECONNECT_DELAY = 10000; // Cap at 10 seconds
  
  // Establish the WebSocket connection with reconnection logic
  const connectWebSocket = useCallback(() => {
    if (!roomCode || !user?.username) return;
    
    // Don't try to reconnect if connection is already being established
    if (socketRef.current && socketRef.current.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket connection already in progress');
      return;
    }
    
    // If socket is already open, don't reconnect
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket connection already established');
      return;
    }
  
    const token = localStorage.getItem('access_token');
    // Use secure websocket for production
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_API_HOST || 'localhost:8000';
    const wsURL = `${protocol}//${host}/ws/game/${roomCode}/?token=${token}`;
    
    // Clean up any existing connection that's in the process of closing
    if (socketRef.current && socketRef.current.readyState === WebSocket.CLOSING) {
      console.log('Waiting for previous WebSocket to close');
      setTimeout(() => connectWebSocket(), 500);
      return;
    }
    
    console.log('Establishing new WebSocket connection');
    const socket = new WebSocket(wsURL);
    socketRef.current = socket;
  
    // Set a connection timeout
    const connectionTimeoutId = setTimeout(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        console.log('Connection attempt timed out');
        socket.close();
        // This will trigger the onclose event which handles reconnection
      }
    }, 5000);
  
    socket.onopen = () => {
      console.log('GamePlay WebSocket connection established');
      clearTimeout(connectionTimeoutId);
      setWsConnected(true);
      reconnectAttemptsRef.current = 0;
      setMessages(prev => [...prev, { type: 'system', content: 'Connected to game' }]);
      
      // Clear any connection errors
      setError('');
      
      // Send a ping immediately to verify connection
      socket.send(JSON.stringify({ type: 'ping' }));
      
      // Set up regular pings to keep the connection alive
      pingIntervalRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // Send ping every 30 seconds
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('GamePlay WebSocket message received:', data);

        switch (data.type) {
          case 'pong':
            console.log('Received pong from server');
            lastPongTimeRef.current = Date.now();
            return;
          case 'round_start':
            handleRoundStart(data);
            break;
          case 'wolf_timer':
            handleWolfTimer(data);
            break;
          case 'wolf_order':
            handleWolfOrderSubmitted(data);
            break;
          case 'round_result':
            handleRoundResult(data);
            break;
          case 'status_change_message':
            handleStatusChange(data);
            break;
          case 'player_list_update':
            if (data.players) {
              setPlayers(data.players);
            }
            break;
          case 'error':
            setError(data.message || 'An error occurred');
            break;
          // Add this to the existing switch case in the socket.onmessage handler
          case 'game_end':
            handleGameEnd(data);
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
      console.log('GamePlay WebSocket connection closed', event);
      clearTimeout(connectionTimeoutId);
      clearInterval(pingIntervalRef.current);
      setWsConnected(false);
      setMessages(prev => [...prev, { type: 'system', content: 'Disconnected from game' }]);
      
      // Attempt to reconnect if not closed intentionally (code 1000)
      if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        // Calculate exponential backoff delay
        const delay = Math.min(
          BASE_RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current),
          MAX_RECONNECT_DELAY
        );
        
        setMessages(prev => [...prev, { 
          type: 'system', 
          content: `Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS}) in ${delay/1000}s...` 
        }]);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connectWebSocket();
        }, delay);
      } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setError('Failed to connect after multiple attempts. Please refresh the page to try again.');
      }
    };
  
    socket.onerror = (error) => {
      console.error('GamePlay WebSocket error:', error);
      setMessages(prev => [...prev, { type: 'error', content: 'Error connecting to game' }]);
    };
  }, [roomCode, user?.username]);


  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        // If we haven't received a pong in 45 seconds, the connection might be dead
        if (Date.now() - lastPongTimeRef.current > 45000) {
          console.log('Connection appears stale. Attempting reconnect...');
          socketRef.current.close();
        }
      }
    }, 15000);
    
    return () => clearInterval(healthCheckInterval);
  }, []);

  // Add this function to the GamePlay component
  const handleGameEnd = (data) => {
    console.log('Game ended:', data);
    const { statistics } = data;
    
    // Navigate to results page with the game statistics
    navigate('/results', { state: { statistics, roomCode } });
  };

  // Function to prepare rankable players list
  const prepareRankablePlayers = (allPlayers, wolfUsername) => {
    console.log("Preparing rankable players from:", allPlayers, "Wolf ID:", wolfUsername);
    
    if (!allPlayers || allPlayers.length === 0) {
      console.warn("No players available to rank");
      return [];
    }
    
    // Convert backend player format to the format needed for ranking
    // This handles both the API format and the websocket format
    return allPlayers
      .map(player => ({
        id: player.id,
        username: player.user__username || player.username
      }));
  };

  // Function to handle round start message
  const handleRoundStart = (data) => {
    console.log('Round started:', data);
    const { round_number, wolf_id, question: newQuestion } = data;
    
    setCurrentRound(round_number);
    setWolfId(wolf_id);
    setQuestion(newQuestion);
    setRoundStatus('wolf_ranking');
    setIsWolf(user?.username === wolf_id);

    // Set up rankable players (all players except the wolf)
    const rankable = prepareRankablePlayers(players, wolf_id);
    console.log("Setting rankable players:", rankable);
    setRankablePlayers(rankable);

    // Reset rankings
    setWolfRanking([]);
    setPackRanking([]);
    setRoundResults(null);
  };

  // Function to handle wolf timer message
  const handleWolfTimer = (data) => {
    const { time } = data;
    setTimeLeft(time);

    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start the countdown
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Function to handle wolf order submitted message
  const handleWolfOrderSubmitted = (data) => {
    const { submitter } = data;
    
    setPackRankerId(submitter);
    setIsPackRanker(user?.username === submitter);
    setRoundStatus('pack_ranking');
    
    // If we're not the wolf, we need to ensure the rankable players are correctly set
    if (!isWolf) {
      const rankable = prepareRankablePlayers(players, wolfId);
      console.log("Refreshing rankable players for pack ranking:", rankable);
      setRankablePlayers(rankable);
    }

    // Clear timer if it's running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimeLeft(0);
    }
  };

  // Function to handle round result message
  const handleRoundResult = (data) => {
    const { wolf_order, pack_order, pack_score } = data;
    
    // Store the original orders for reference
    setWolfRanking(wolf_order);
    setPackRanking(pack_order);

    // Create player arrays from the orders for display
    const wolfRankingArray = Object.entries(wolf_order)
      .map(([playerId, username]) => ({
        id: parseInt(playerId),
        username: username
      }));
    
    const packRankingArray = Object.entries(pack_order)
      .map(([playerId, username]) => ({
        id: parseInt(playerId),
        username: username
      }));
    
    setRoundResults({
      wolfRanking: wolfRankingArray,
      packRanking: packRankingArray,
      packScore: pack_score
    });
    
    setRoundStatus('results');
  };

  // Function to handle status change message
  const handleStatusChange = (data) => {
    const { status } = data;
    setRoundStatus(status);
  };

  // Function to start a new round
  const handleStartRound = () => {
    if (!isHost) return;
    
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      // Show visual feedback that connection is being established
      setButtonFeedback('connecting');
      
      // Try to reconnect if needed
      connectWebSocket();
      
      // Wait a moment for connection to establish, then try again
      setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          sendStartRoundMessage();
          setButtonFeedback('success');
        } else {
          setButtonFeedback('error');
          setError('Connection failed. Please try again.');
          setTimeout(() => setButtonFeedback(''), 2000); // Clear feedback after 2 seconds
        }
      }, 1000);
      
      return;
    }
    
    // Connection is already open, send message directly
    sendStartRoundMessage();
    setButtonFeedback('success');
    setTimeout(() => setButtonFeedback(''), 2000); // Clear feedback after 2 seconds
  };

  const sendStartRoundMessage = () => {
    console.log('Starting new round...');
    socketRef.current.send(JSON.stringify({
      type: 'start_round',
      round_number: currentRound
    }));
  };
  

  // Function to submit wolf ranking
  const handleSubmitWolfRanking = () => {
    if (!isWolf) return;
    
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setButtonFeedback('connecting');
      connectWebSocket();
      
      setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          sendWolfRankingMessage();
          setButtonFeedback('success');
        } else {
          setButtonFeedback('error');
          setError('Connection failed. Please try again.');
          setTimeout(() => setButtonFeedback(''), 2000);
        }
      }, 1000);
      
      return;
    }
    
    sendWolfRankingMessage();
    setButtonFeedback('success');
    setTimeout(() => setButtonFeedback(''), 2000);
  };
  
  const sendWolfRankingMessage = () => {
    console.log("Submitting wolf ranking for players:", rankablePlayers);
    
    // Convert the array of ranked players to the format expected by the backend
    const order = {};
    rankablePlayers.forEach((player, index) => {
      order[player.id] = index + 1;
    });
    
    socketRef.current.send(JSON.stringify({
      type: 'wolf_order',
      order: order,
      round_number: currentRound
    }));
  };
  
  const handleSubmitPackRanking = () => {
    if (!isPackRanker) return;
    
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setButtonFeedback('connecting');
      connectWebSocket();
      
      setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          sendPackRankingMessage();
          setButtonFeedback('success');
        } else {
          setButtonFeedback('error');
          setError('Connection failed. Please try again.');
          setTimeout(() => setButtonFeedback(''), 2000);
        }
      }, 1000);
      
      return;
    }
    
    sendPackRankingMessage();
    setButtonFeedback('success');
    setTimeout(() => setButtonFeedback(''), 2000);
  };
  
  const sendPackRankingMessage = () => {
    console.log("Submitting pack ranking for players:", rankablePlayers);
    
    // Convert the array of ranked players to the format expected by the backend
    const order = {};
    rankablePlayers.forEach((player, index) => {
      order[player.id] = index + 1;
    });
    
    socketRef.current.send(JSON.stringify({
      type: 'pack_order',
      order: order,
      round_number: currentRound
    }));
  };

  // Function to end current round and prepare for next
  const handleEndRound = () => {
    if (!isHost) return;
    
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      // Show visual feedback that connection is being established
      setButtonFeedback('connecting');
      
      // Try to reconnect if needed
      connectWebSocket();
      
      // Wait a moment for connection to establish, then try again
      setTimeout(() => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          sendEndRoundMessage();
          setButtonFeedback('success');
        } else {
          setButtonFeedback('error');
          setError('Connection failed. Please try again.');
          setTimeout(() => setButtonFeedback(''), 2000); // Clear feedback after 2 seconds
        }
      }, 1000);
      
      return;
    }
    
    // Connection is already open, send message directly
    sendEndRoundMessage();
    setButtonFeedback('success');
    setTimeout(() => setButtonFeedback(''), 2000); // Clear feedback after 2 seconds
  };

  const sendEndRoundMessage = () => {
    socketRef.current.send(JSON.stringify({
      type: 'change_status',
      status: 'waiting',
      round_number: currentRound + 1
    }));
    
    setCurrentRound(prev => prev + 1);
    setRoundStatus('waiting');
    setWolfId('');
    setPackRankerId('');
    setQuestion('');
    setIsWolf(false);
    setIsPackRanker(false);
    setRoundResults(null);
  };

  // Handle ranking changes from the RankingContainer
  const handleRankingChange = (orderedPlayers) => {
    console.log("Ranking changed:", orderedPlayers);
    
    // Get the IDs of positioned players
    const positionedIds = orderedPlayers.map(p => p.id);
    
    // Start with all players that should be rankable
    const allRankablePlayers = prepareRankablePlayers(players, wolfId);
    
    // Create a new ordered list that keeps unpositioned players at the end
    const newRankablePlayers = [
      ...orderedPlayers,
      ...allRankablePlayers.filter(p => !positionedIds.includes(p.id))
    ];
    
    // Update state with this new combined list
    setRankablePlayers(newRankablePlayers);
  };

  const [roomInfo, setRoomInfo] = useState({});

  // Add the existing getRoomData function - keeping as is
  const getRoomData = async() => {
    try {
      setLoading(true);
      console.log("Fetching room data for room code:", roomCode);
      const response = await axios.get(`http://localhost:8000/api/game/get-room-details/?room_code=${roomCode}`);
      console.log("Room data received:", response.data);
      setRoomInfo(response.data);
      
      if (response.data.current_players && response.data.current_players.length > 0) {
        setPlayers(response.data.current_players);
        
        if (wolfId) {
          const rankable = prepareRankablePlayers(response.data.current_players, wolfId);
          console.log("Setting initial rankable players from API response:", rankable);
          setRankablePlayers(rankable);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching room data:', error);
      setError('Failed to load game data. Please try again.');
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch room data first
    getRoomData();
    
    // Connect to WebSocket only once when component mounts
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting");
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]); // Only depend on connectWebSocket which is memoized
  
  // Add a separate useEffect for handling host status updates
  useEffect(() => {
    if (roomInfo.host && user?.username) {
      setIsHost(roomInfo.host === user.username);
    }
  }, [roomInfo, user?.username]);
  
  // Add a separate useEffect for handling player updates
  useEffect(() => {
    if (roomInfo.current_players && roomInfo.current_players.length > 0) {
      console.log('Current players updated:', roomInfo.current_players);
      setPlayers(roomInfo.current_players);
      
      // If we're in wolf_ranking or pack_ranking phase, update rankable players
      if ((roundStatus === 'wolf_ranking' || roundStatus === 'pack_ranking') && wolfId) {
        const rankable = prepareRankablePlayers(roomInfo.current_players, wolfId);
        console.log("Updating rankable players after player list update:", rankable);
        setRankablePlayers(rankable);
      }
    }
  }, [roomInfo.current_players, roundStatus, wolfId]);

  // Add debugging console logs for important state changes
  useEffect(() => {
    console.log("GamePlay component state updated:", {
      roundStatus,
      isWolf,
      isPackRanker,
      wolfId,
      packRankerId,
      players: players.length,
      rankablePlayers: rankablePlayers.length
    });
  }, [roundStatus, isWolf, isPackRanker, wolfId, packRankerId, players, rankablePlayers]);

  if (loading) {
    return (
      <ThemeProvider theme={wolfTheme}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            bgcolor: 'background.default',
            backgroundImage: 'radial-gradient(circle, rgba(138,107,190,0.1) 10%, transparent 10%), radial-gradient(circle, rgba(138,107,190,0.1) 10%, transparent 10%)',
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px',
          }}
        >
          <CircularProgress size={60} color="primary" />
          <Typography variant="h4" color="primary.main" sx={{ mt: 3, fontWeight: 600 }}>
            Loading game...
          </Typography>
          <Box sx={{ mt: 2, width: '60%', maxWidth: 400 }}>
            <LinearProgress color="secondary" sx={{ height: 8, borderRadius: 4 }} />
          </Box>
          <Fade in timeout={1000}>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, animation: 'bounce 2s infinite' }}>
              <PetsRounded sx={{ verticalAlign: 'middle', mr: 1 }} /> Calling the wolf pack...
            </Typography>
          </Fade>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={wolfTheme}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            bgcolor: 'background.default'
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              textAlign: 'center',
              border: '2px solid',
              borderColor: 'error.main',
              maxWidth: 600,
              width: '80%'
            }}
          >
            <WarningAmber color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<KeyboardReturn />}
              onClick={() => navigate('/lobby')}
              sx={{ 
                minWidth: 200,
                animation: 'pulse 2s infinite'
              }}
            >
              Return to Lobby
            </Button>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  // If we have players but rankablePlayers is empty (and we should have some)
  // Fix it on the fly for rendering
  let displayRankablePlayers = rankablePlayers;
  if ((isWolf || isPackRanker) && 
      (roundStatus === 'wolf_ranking' || roundStatus === 'pack_ranking') && 
      rankablePlayers.length === 0 && 
      players.length > 0 && 
      wolfId) {
    displayRankablePlayers = prepareRankablePlayers(players, wolfId);
    console.log("Creating on-the-fly rankable players for display:", displayRankablePlayers);
  }

  return (
    <ThemeProvider theme={wolfTheme}>
      <DndProvider backend={HTML5Backend}>
        <Box 
          sx={{ 
            minHeight: '100vh',
            bgcolor: 'background.default',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'52\' height=\'26\' viewBox=\'0 0 52 26\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234e387e\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            pt: 3,
            pb: 5,
          }}
        >
          <Container maxWidth="lg">
            {/* Header */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                mb: 3, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'linear-gradient(135deg, #4E387E 0%, #6A4CAA 100%)',
                color: 'white',
                borderRadius: '16px'
              }}
            >
              <Zoom in timeout={800}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PetsRounded sx={{ fontSize: 36, mr: 2 }} />
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    Wolf Pack
                  </Typography>
                  <Chip 
                    label={`Room: ${roomCode}`}
                    sx={{ 
                      ml: 2, 
                      bgcolor: alpha('#fff', 0.25), 
                      color: 'white',
                      fontWeight: 'bold' 
                    }} 
                  />
                </Box>
              </Zoom>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EnhancedConnectionStatus 
                  status={wsConnected ? 'connected' : reconnectAttemptsRef.current > 0 ? 'connecting' : 'disconnected'} 
                />
                <Button 
                  variant="outlined" 
                  color="inherit"
                  startIcon={<ExitToApp />}
                  onClick={onLeaveLobby}
                  sx={{ 
                    borderColor: 'white', 
                    '&:hover': { 
                      bgcolor: alpha('#fff', 0.1),
                      borderColor: 'white'
                    } 
                  }}
                >
                  Leave Game
                </Button>
              </Box>
            </Paper>

            {/* Main Game Area */}
            <Grid container spacing={3}>
              {/* Left Column: Game Status */}
              <Grid item xs={12} md={8}>
                <Fade in timeout={1000}>
                  <Paper elevation={3} sx={{ p: 3, mb: 3, position: 'relative', overflow: 'hidden' }}>
                    {/* Wolf paw print background */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        opacity: 0.05,
                        transform: 'rotate(15deg)',
                        pointerEvents: 'none'
                      }}
                    >
                      <PetsRounded sx={{ fontSize: 180 }} />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" component="h2" fontWeight="bold" color="primary">
                        Round {currentRound} of {totalRounds}
                      </Typography>

                      <Box>
                        {isHost && roundStatus === 'waiting' && (
                          <Zoom in>
                            <Button 
                              variant="contained" 
                              color="secondary"
                              startIcon={<PlayArrow />}
                              onClick={handleStartRound}
                              disabled={buttonFeedback === 'connecting'}
                              sx={{ 
                                borderRadius: '20px',
                                animation: 'pulse 2s infinite',
                              }}
                            >
                              {buttonFeedback === 'connecting' ? 'Connecting...' : 'Start Round'}
                            </Button>
                          </Zoom>
                        )}
                        {isHost && roundStatus === 'results' && (
                          <Zoom in>
                            <Button 
                              variant="contained" 
                              color="primary"
                              startIcon={<KeyboardArrowRight />}
                              onClick={handleEndRound}
                              disabled={buttonFeedback === 'connecting'}
                              sx={{ borderRadius: '20px' }}
                            >
                              {buttonFeedback === 'connecting' ? 'Connecting...' : 'Next Round'}
                            </Button>
                          </Zoom>
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                      <EnhancedStatusBanner roundStatus={roundStatus} isWolf={isWolf} />
                    
                      {timeLeft > 0 && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                          <EnhancedTimer timeLeft={timeLeft} />
                        </Box>
                      )}
                    </Box>

                    {question && (
                      <Grow in timeout={500}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 3, 
                            mb: 3, 
                            bgcolor: alpha(wolfTheme.palette.primary.light, 0.1),
                            border: `1px solid ${alpha(wolfTheme.palette.primary.main, 0.2)}`,
                            borderRadius: 3
                          }}
                        >
                          <Typography variant="h5" component="h3" fontWeight="600" color="primary.dark" gutterBottom>
                            Question:
                          </Typography>
                          <Typography variant="h6" sx={{ fontStyle: 'italic' }}>
                            {question}
                          </Typography>
                        </Paper>
                      </Grow>
                    )}

                    {wolfId && (
                      <Grow in timeout={800}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: 2, 
                            mb: 3,
                            borderRadius: 2,
                            bgcolor: isWolf ? alpha(wolfTheme.palette.secondary.light, 0.1) : 'transparent',
                            border: isWolf ? `2px dashed ${wolfTheme.palette.secondary.main}` : 'none'
                          }}
                        >
                          <WolfAvatar isWolf={true} username={wolfId} />
                          <Box sx={{ ml: 2 }}>
                            {isWolf ? (
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: 'secondary.main',
                                  animation: 'pulse 2s infinite'
                                }}
                              >
                                You are the Wolf! 🐺
                              </Typography>
                            ) : (
                              <Typography variant="h6">
                                Wolf: <span style={{ fontWeight: 'bold', color: wolfTheme.palette.secondary.main }}>{wolfId}</span>
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grow>
                    )}

                    {/* Ranking interface */}
                    {(roundStatus === 'wolf_ranking' && isWolf) || (roundStatus === 'pack_ranking' && isPackRanker) ? (
                      <Grow in timeout={500}>
                        <Box sx={{ mt: 4 }}>
                          <Typography 
                            variant="h5" 
                            component="h3" 
                            fontWeight="bold" 
                            color="primary.dark" 
                            gutterBottom
                          >
                            {isWolf ? 'Arrange Players in Your Order:' : 'Arrange Players as the Pack:'}
                          </Typography>
                          
                          <Paper 
                            elevation={2} 
                            sx={{ 
                              p: 3, 
                              bgcolor: alpha(wolfTheme.palette.primary.light, 0.05),
                              borderRadius: 3,
                              border: `1px dashed ${wolfTheme.palette.primary.main}`
                            }}
                          >
                            <RankingContainer 
                              players={displayRankablePlayers}
                              onRankingChange={handleRankingChange}
                            />
                          </Paper>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Button 
                              variant="contained" 
                              color={isWolf ? "secondary" : "primary"}
                              size="large"
                              startIcon={<Send />}
                              onClick={isWolf ? handleSubmitWolfRanking : handleSubmitPackRanking}
                              disabled={displayRankablePlayers.length === 0 || buttonFeedback === 'connecting'}
                              sx={{ minWidth: 200, py: 1.5 }}
                            >
                              {buttonFeedback === 'connecting' ? 'Connecting...' : 'Submit Ranking'}
                            </Button>
                          </Box>
                        </Box>
                      </Grow>
                    ) : roundStatus === 'wolf_ranking' || roundStatus === 'pack_ranking' ? (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          py: 5,
                          flexDirection: 'column'
                        }}
                      >
                        <CircularProgress size={48} color={roundStatus === 'wolf_ranking' ? 'secondary' : 'primary'} />
                        <Typography 
                          variant="h6" 
                          color="text.secondary" 
                          sx={{ mt: 2, textAlign: 'center', fontWeight: 500 }}
                        >
                          {roundStatus === 'wolf_ranking' 
                            ? `Waiting for ${wolfId} to rank players...` 
                            : `Waiting for ${packRankerId} to rank players...`}
                        </Typography>
                      </Box>
                    ) : null}

                    {/* Results display */}
                    {roundStatus === 'results' && roundResults && (
                      <Grow in timeout={500}>
                        <Box>
                          <ResultsDisplay 
                            wolfRanking={roundResults.wolfRanking}
                            packRanking={roundResults.packRanking}
                            packScore={roundResults.packScore}
                            question={question}
                          />
                        </Box>
                      </Grow>
                    )}
                  </Paper>
                </Fade>
              </Grid>

              {/* Right Column: Players */}
              <Grid item xs={12} md={4}>
                <Fade in timeout={1200}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'background.paper',
                      height: '100%',
                    }}
                  >
                    <Typography variant="h5" component="h2" fontWeight="bold" color="primary" gutterBottom>
                      Players
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      {players.length > 0 ? (
                        <Grid container spacing={2}>
                          {players.map(player => {
                            const username = player.user__username || player.username;
                            const isPlayerWolf = username === wolfId;
                            const isPlayerHost = username === roomInfo?.host;
                            const isCurrentPlayer = username === user?.username;
                            const isPackRankerPlayer = username === packRankerId;
                            
                            return (
                              <Grid item xs={12} key={player.id}>
                                <Card 
                                  sx={{ 
                                    position: 'relative',
                                    transition: 'all 0.3s ease',
                                    bgcolor: isCurrentPlayer ? alpha(wolfTheme.palette.primary.light, 0.1) : 'background.paper',
                                    borderLeft: isCurrentPlayer ? `4px solid ${wolfTheme.palette.primary.main}` : 'none',
                                    border: isPlayerWolf 
                                      ? `2px solid ${wolfTheme.palette.secondary.main}`
                                      : isPackRankerPlayer
                                        ? `2px solid ${wolfTheme.palette.primary.main}`
                                        : 'none',
                                    '&:hover': {
                                      transform: 'translateY(-3px)',
                                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    },
                                  }}
                                >
                                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <WolfAvatar 
                                          isWolf={isPlayerWolf} 
                                          username={username} 
                                        />
                                        <Box sx={{ ml: 2 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {isPlayerHost && (
                                              <Chip 
                                                size="small" 
                                                label="Host" 
                                                color="primary" 
                                                variant="outlined"
                                                icon={<EmojiEvents fontSize="small" />}
                                                sx={{ mr: 1, height: 22 }}
                                              />
                                            )}
                                            <Typography 
                                              variant="subtitle1" 
                                              component="span" 
                                              fontWeight={isCurrentPlayer ? 700 : 500}
                                              color={isPlayerWolf ? 'secondary.main' : 'text.primary'}
                                            >
                                              {username}
                                              {isCurrentPlayer && ' (You)'}
                                            </Typography>
                                          </Box>
                                          
                                          {isPlayerWolf && (
                                            <Chip 
                                              size="small" 
                                              label="Wolf" 
                                              color="secondary" 
                                              icon={<PetsRounded fontSize="small" />}
                                              sx={{ mt: 0.5 }}
                                            />
                                          )}
                                          
                                          {isPackRankerPlayer && (
                                            <Chip 
                                              size="small" 
                                              label="Pack Ranker" 
                                              color="primary" 
                                              icon={<FormatListNumbered fontSize="small" />}
                                              sx={{ mt: 0.5 }}
                                            />
                                          )}
                                        </Box>
                                      </Box>
                                      
                                      <Box sx={{ textAlign: 'right' }}>
                                        <Chip 
                                          label={`Score: ${player.score || 0}`}
                                          color="default"
                                          variant="outlined"
                                          sx={{ 
                                            fontWeight: 600,
                                            borderColor: wolfTheme.palette.primary.light
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      ) : (
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            bgcolor: alpha(wolfTheme.palette.primary.light, 0.05),
                            borderRadius: 2,
                            border: `1px dashed ${wolfTheme.palette.primary.light}`
                          }}
                        >
                          <Typography color="text.secondary">
                            No players in the game yet
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                    </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </DndProvider>
  </ThemeProvider>
);
}

export default GamePlay;