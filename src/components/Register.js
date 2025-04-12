import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  InputAdornment,
  IconButton,
  Snackbar,
  Backdrop,
  Fade,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WolfSvg from '../animations/wolf-svg.svg'; // This would be a custom SVG component

// Create theme with dark wolf aesthetics
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#A8A4CE', // Soft purple/blue - moonlight color
      light: '#C8B6E2',
      dark: '#7A7BC7'
    },
    secondary: {
      main: '#483C67', // Deep purple - shadow color
      light: '#6B5B95',
      dark: '#2D2542'
    },
    background: {
      default: '#13111C', // Very dark blue-black
      paper: '#1D1A2F', // Dark purple-blue
    },
    text: {
      primary: '#E9E8FF', // Light lavender
      secondary: '#A8A4CE', // Matches primary
    },
    error: {
      main: '#FF6B6B', // Soft red
    },
    success: {
      main: '#6BCB77', // Forest green
    }
  },
  typography: {
    fontFamily: '"Quicksand", "Roboto", sans-serif',
    h2: {
      fontWeight: 700,
      letterSpacing: 3,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: 1,
    },
    button: {
      fontWeight: 600,
      letterSpacing: 1.2,
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        
        body {
          background: radial-gradient(circle at 50% 0%, #2D2542, #13111C 70%);
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          background-color: #13111C;
        }
        
        ::-webkit-scrollbar-thumb {
          background-color: #483C67;
          border-radius: 10px;
        }
      `,
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.3s ease',
            '&.Mui-focused': {
              boxShadow: '0 0 15px rgba(168, 164, 206, 0.3)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          textTransform: 'none',
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-3px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Moon backdrop component
const MoonBackdrop = () => (
  <Box
    sx={{
      position: 'absolute',
      top: '-100px',
      right: '-100px',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(200,182,226,0.2) 0%, rgba(168,164,206,0.1) 40%, rgba(29,26,47,0) 70%)',
      filter: 'blur(20px)',
      zIndex: 0,
    }}
  />
);

// Stars animation component
const StarryBackground = () => {
  const stars = Array(100).fill(0);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {stars.map((_, i) => {
        const size = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.8 + 0.2;
        const animationDuration = Math.random() * 3 + 2;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        
        return (
          <Box
            key={i}
            component={motion.div}
            animate={{
              opacity: [opacity, opacity * 0.3, opacity],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            sx={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: '#E9E8FF',
              borderRadius: '50%',
              left: `${left}%`,
              top: `${top}%`,
            }}
          />
        );
      })}
    </Box>
  );
};

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Please enter a username');
      return false;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      setSuccess('Welcome to the pack! Redirecting to login...');
      
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  // Form field styling
  const inputSx = {
    mb: 3,
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      backgroundColor: 'rgba(29, 26, 47, 0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(168, 164, 206, 0.2)',
      transition: 'all 0.3s ease',
      "&:hover": {
        backgroundColor: 'rgba(29, 26, 47, 0.8)',
        border: '1px solid rgba(168, 164, 206, 0.3)',
      },
      "&.Mui-focused": {
        border: '1px solid rgba(168, 164, 206, 0.5)',
        backgroundColor: 'rgba(29, 26, 47, 0.8)',
      },
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StarryBackground />
      
      <Container maxWidth="xs" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        py: 4
      }}>
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: -1, 
            position: 'fixed', 
            background: 'radial-gradient(circle at center, rgba(72, 60, 103, 0.3) 0%, rgba(19, 17, 28, 0) 70%)'
          }}
          open={true}
        />
        
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          elevation={24}
          sx={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(29, 26, 47, 0.8) 0%, rgba(19, 17, 28, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(168, 164, 206, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <MoonBackdrop />
          
          <Box sx={{ 
            p: 4, 
            position: 'relative', 
            zIndex: 1
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: -30, 
                right: -20,
                transform: 'rotate(10deg)',
                filter: 'drop-shadow(0 0 15px rgba(168, 164, 206, 0.5))'
              }}>
                <NightsStayIcon sx={{ fontSize: 50, color: theme.palette.primary.light }} />
              </Box>
            </motion.div>
            
            <Box component={motion.div}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 4
              }}
            >
              <Box sx={{ 
                width: 100, 
                height: 100, 
                mb: 2, 
                filter: 'drop-shadow(0 0 10px rgba(168, 164, 206, 0.5))'
              }}>
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotateZ: [0, 2, 0, -2, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Box sx={{ 
                    width: 100, 
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <NightsStayIcon sx={{ fontSize: 100, color: theme.palette.primary.light }} />
                  </Box>
                </motion.div>
              </Box>
              
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #E9E8FF, #A8A4CE)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  mb: 1
                }}
              >
                JOIN THE PACK
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: 'text.secondary',
                textAlign: 'center',
                mb: 3,
                fontStyle: 'italic'
              }}>
                Where the night belongs to the wolves
              </Typography>
            </Box>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    color: '#FF6B6B',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: 'rgba(107, 203, 119, 0.1)',
                    color: '#6BCB77',
                    border: '1px solid rgba(107, 203, 119, 0.3)',
                  }}
                >
                  {success}
                </Alert>
              </motion.div>
            )}

            <Box
              component={motion.form}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
            >
              <Box component={motion.div} variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box component={motion.div} variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box component={motion.div} variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              <Box component={motion.div} variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              <Box component={motion.div} variants={itemVariants}>
                <Button
                  fullWidth
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  sx={{
                    mt: 2,
                    mb: 3,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #7A7BC7 0%, #A8A4CE 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'all 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress size={24} sx={{ color: '#E9E8FF', mr: 1 }} />
                      <Typography variant="button">Joining...</Typography>
                    </Box>
                  ) : 'Join The Pack'}
                </Button>
              </Box>
            </Box>

            <Box component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Already with the pack?{' '}
                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '0%',
                      height: '2px',
                      bottom: '-3px',
                      left: 0,
                      backgroundColor: 'primary.main',
                      transition: 'width 0.3s',
                    },
                    '&:hover::after': {
                      width: '100%',
                    },
                  }}
                  onClick={() => navigate('/login')}
                >
                  Return to your den
                </Box>
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        {/* Paw print particles */}
        {!isMobile && Array(5).fill(0).map((_, i) => {
          const size = Math.random() * 15 + 10;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const opacity = Math.random() * 0.2 + 0.05;
          const rotation = Math.random() * 360;
          
          return (
            <Box
              key={i}
              sx={{
                position: 'fixed',
                width: size,
                height: size,
                opacity,
                transform: `rotate(${rotation}deg)`,
                left: `${left}%`,
                top: `${top}%`,
                zIndex: -1,
              }}
            >
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <path fill="#A8A4CE" d="M65,10c-5.5,0-10,4.5-10,10s4.5,10,10,10s10-4.5,10-10S70.5,10,65,10z M35,10c-5.5,0-10,4.5-10,10s4.5,10,10,10s10-4.5,10-10 S40.5,10,35,10z M20,40c-5.5,0-10,4.5-10,10s4.5,10,10,10s10-4.5,10-10S25.5,40,20,40z M80,40c-5.5,0-10,4.5-10,10s4.5,10,10,10 s10-4.5,10-10S85.5,40,80,40z M50,50c-8.3,0-15,6.7-15,15s6.7,15,15,15s15-6.7,15-15S58.3,50,50,50z"/>
              </svg>
            </Box>
          );
        })}
      </Container>
    </ThemeProvider>
  );
}

export default Register;