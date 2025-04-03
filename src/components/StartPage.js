import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  AppBar, 
  Toolbar, 
  Container, 
  Paper, 
  Grid,
  Card, 
  CardContent, 
  CardActions,
  IconButton,
  Slide,
  Grow,
  Alert,
  InputAdornment,
  useTheme,
  createTheme,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import { 
  GroupAdd, 
  Login, 
  Logout, 
  Close, 
  Pets, 
  NightsStay, 
  PersonAdd,
  QrCode,
  Groups,
  ArrowBack
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Custom theme for Wolf Game
const wolfTheme = createTheme({
  palette: {
    primary: {
      main: '#6C3483', // Deep purple
      light: '#9B59B6',
      dark: '#4A235A',
    },
    secondary: {
      main: '#F39C12', // Amber/gold for wolf eyes
      light: '#F9E79F',
      dark: '#D35400',
    },
    background: {
      default: '#1E1F26', // Dark night sky
      paper: '#2C3E50', // Midnight blue
    },
    text: {
      primary: '#ECF0F1', // Light text for dark backgrounds
      secondary: '#BDC3C7',
    },
    error: {
      main: '#E74C3C', // Blood red
    },
  },
  typography: {
    fontFamily: '"Quicksand", "Roboto", "Arial", sans-serif',
    h1: {
      fontFamily: '"Creepster", cursive',
    },
    h2: {
      fontFamily: '"Creepster", cursive',
    },
    h3: {
      fontFamily: '"Creepster", cursive',
    },
    h4: {
      fontFamily: '"Creepster", cursive',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
          padding: '10px 20px',
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

// Wolf icon animation component
const WolfIcon = () => {
  return (
    <motion.div
      animate={{
        rotate: [0, 10, 0, -10, 0],
        y: [0, -5, 0, -5, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "loop"
      }}
    >
      <Pets sx={{ fontSize: 40, color: wolfTheme.palette.secondary.main }} />
    </motion.div>
  );
};

// Full moon animation component
const MoonIcon = () => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <NightsStay sx={{ fontSize: 32, color: '#F9E79F' }} />
    </motion.div>
  );
};

function StartPage({ user, onLogout, onRoomCreated, onRoomJoined }) {
  const [createRoomFormData, setCreateRoomFormData] = useState({
    name: '',
    max_players: 10
  });
  const [joinRoomFormData, setJoinRoomFormData] = useState({
    room_code: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoomChange = (e) => {
    setCreateRoomFormData({
      ...createRoomFormData,
      [e.target.name]: e.target.name === 'max_players' ? parseInt(e.target.value) : e.target.value
    });
  };

  const handleJoinRoomChange = (e) => {
    setJoinRoomFormData({
      ...joinRoomFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/game/create-room/', createRoomFormData);
      onRoomCreated(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/game/join-room/', joinRoomFormData);
      onRoomJoined(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setShowJoinForm(false);
    setError('');
  };

  const toggleJoinForm = () => {
    setShowJoinForm(!showJoinForm);
    setShowCreateForm(false);
    setError('');
  };

  const backgroundStyle = {
    minHeight: '100vh',
    backgroundImage: 'radial-gradient(circle, #2C3E50 10%, #1E1F26 100%)',
    backgroundSize: 'cover',
    position: 'relative',
    overflow: 'hidden',
  };

  // Stars background effect
  const Stars = () => {
    const starCount = 100;
    const stars = [];
    
    for (let i = 0; i < starCount; i++) {
      const size = Math.random() * 3;
      stars.push(
        <Box
          key={i}
          component={motion.div}
          sx={{
            position: 'absolute',
            width: size,
            height: size,
            backgroundColor: 'white',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 1 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      );
    }
    
    return <>{stars}</>;
  };

  return (
    <ThemeProvider theme={wolfTheme}>
      <CssBaseline />
      <Box sx={backgroundStyle}>
        <Stars />
        
        {/* Forest silhouette at the bottom */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '15vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            clipPath: 'polygon(0% 100%, 5% 90%, 10% 100%, 15% 85%, 20% 95%, 25% 85%, 30% 100%, 35% 90%, 40% 95%, 45% 85%, 50% 100%, 55% 90%, 60% 95%, 65% 85%, 70% 100%, 75% 90%, 80% 95%, 85% 85%, 90% 100%, 95% 90%, 100% 100%)',
            zIndex: 1,
          }}
        />
        
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <WolfIcon />
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  ml: 2, 
                  fontFamily: '"Creepster", cursive',
                  color: 'secondary.main',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                Social Wolf
              </Typography>
              <MoonIcon sx={{ ml: 2 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Typography variant="subtitle1" sx={{ mr: 2, color: 'text.secondary' }}>
                  Welcome, {user?.username}
                </Typography>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={onLogout}
                  startIcon={<Logout />}
                  sx={{ 
                    boxShadow: '0 4px 20px rgba(231, 76, 60, 0.5)',
                  }}
                >
                  Logout
                </Button>
              </motion.div>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
          {error && (
            <Grow in={!!error}>
              <Alert 
                severity="error" 
                sx={{ mb: 4 }}
                action={
                  <IconButton color="inherit" size="small" onClick={() => setError('')}>
                    <Close fontSize="small" />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            </Grow>
          )}
          
          <Grid container spacing={4}>
            {/* Create Room Card */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card 
                  elevation={8}
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(145deg, rgba(44,62,80,0.9) 0%, rgba(52,73,94,0.8) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'visible',
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -15, 
                      right: -15,
                      zIndex: 10
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Paper 
                        elevation={6}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #6C3483 0%, #9B59B6 100%)'
                        }}
                      >
                        <GroupAdd sx={{ fontSize: 30, color: 'white' }} />
                      </Paper>
                    </motion.div>
                  </Box>
                  
                  <CardContent sx={{ pt: 4, pb: 2 }}>
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ 
                        color: 'primary.light',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      Form Your Wolf Pack
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Become the alpha wolf! Create your own game and invite friends to join your pack with a secret howl code.
                    </Typography>
                    
                    <Slide direction="up" in={showCreateForm} mountOnEnter unmountOnExit>
                      <Box component="form" onSubmit={handleCreateRoom} sx={{ mt: 1 }}>
                        <TextField
                          fullWidth
                          label="Pack Name"
                          name="name"
                          value={createRoomFormData.name}
                          onChange={handleCreateRoomChange}
                          required
                          variant="outlined"
                          margin="normal"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Pets color="secondary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: 'rgba(155, 89, 182, 0.5)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.light',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                        
                        <TextField
                          fullWidth
                          label="Pack Size (2-10 wolves)"
                          name="max_players"
                          type="number"
                          value={createRoomFormData.max_players}
                          onChange={handleCreateRoomChange}
                          required
                          variant="outlined"
                          margin="normal"
                          inputProps={{ min: 2, max: 10 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Groups color="secondary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: 'rgba(155, 89, 182, 0.5)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.light',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                        
                        <Box sx={{ display: 'flex', mt: 3, gap: 2 }}>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flexGrow: 1 }}>
                            <Button 
                              type="submit"
                              fullWidth
                              variant="contained" 
                              color="primary"
                              disabled={loading}
                              sx={{ 
                                py: 1.5, 
                                boxShadow: '0 4px 20px rgba(155, 89, 182, 0.5)',
                              }}
                            >
                              {loading ? 'Summoning wolves...' : 'Form Pack'}
                            </Button>
                          </motion.div>
                          
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              type="button"
                              variant="outlined"
                              color="primary"
                              onClick={toggleCreateForm}
                              startIcon={<ArrowBack />}
                            >
                              Back
                            </Button>
                          </motion.div>
                        </Box>
                      </Box>
                    </Slide>
                  </CardContent>
                  
                  {!showCreateForm && (
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        style={{ width: '100%' }}
                      >
                        <Button
                          fullWidth
                          size="large" 
                          variant="contained" 
                          color="primary"
                          startIcon={<GroupAdd />}
                          onClick={toggleCreateForm}
                          sx={{ 
                            py: 1.5, 
                            boxShadow: '0 4px 20px rgba(155, 89, 182, 0.5)',
                          }}
                        >
                          Create New Pack
                        </Button>
                      </motion.div>
                    </CardActions>
                  )}
                </Card>
              </motion.div>
            </Grid>
            
            {/* Join Room Card */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card 
                  elevation={8}
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(145deg, rgba(44,62,80,0.9) 0%, rgba(52,73,94,0.8) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'visible',
                    position: 'relative'
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -15, 
                      left: -15,
                      zIndex: 10
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Paper 
                        elevation={6}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #D35400 0%, #F39C12 100%)'
                        }}
                      >
                        <PersonAdd sx={{ fontSize: 30, color: 'white' }} />
                      </Paper>
                    </motion.div>
                  </Box>
                  
                  <CardContent sx={{ pt: 4, pb: 2 }}>
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ 
                        color: 'secondary.main',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      Join a Wolf Pack
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Already received a howl from your alpha? Enter their secret pack code to join the hunt tonight.
                    </Typography>
                    
                    <Slide direction="up" in={showJoinForm} mountOnEnter unmountOnExit>
                      <Box component="form" onSubmit={handleJoinRoom} sx={{ mt: 1 }}>
                        <TextField
                          fullWidth
                          label="Howl Code"
                          name="room_code"
                          value={joinRoomFormData.room_code}
                          onChange={handleJoinRoomChange}
                          required
                          variant="outlined"
                          margin="normal"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <QrCode color="secondary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: 'rgba(243, 156, 18, 0.5)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'secondary.light',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'secondary.main',
                              },
                            },
                          }}
                        />
                        
                        <Box sx={{ display: 'flex', mt: 3, gap: 2 }}>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flexGrow: 1 }}>
                            <Button 
                              type="submit"
                              fullWidth
                              variant="contained" 
                              color="secondary"
                              disabled={loading}
                              sx={{ 
                                py: 1.5, 
                                boxShadow: '0 4px 20px rgba(243, 156, 18, 0.5)',
                              }}
                            >
                              {loading ? 'Joining pack...' : 'Join Hunt'}
                            </Button>
                          </motion.div>
                          
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              type="button"
                              variant="outlined"
                              color="secondary"
                              onClick={toggleJoinForm}
                              startIcon={<ArrowBack />}
                            >
                              Back
                            </Button>
                          </motion.div>
                        </Box>
                      </Box>
                    </Slide>
                  </CardContent>
                  
                  {!showJoinForm && (
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        style={{ width: '100%' }}
                      >
                        <Button
                          fullWidth
                          size="large" 
                          variant="contained" 
                          color="secondary"
                          startIcon={<Login />}
                          onClick={toggleJoinForm}
                          sx={{ 
                            py: 1.5, 
                            boxShadow: '0 4px 20px rgba(243, 156, 18, 0.5)',
                          }}
                        >
                          Join Existing Pack
                        </Button>
                      </motion.div>
                    </CardActions>
                  )}
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default StartPage;