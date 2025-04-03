import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  alpha,
  styled
} from '@mui/material';
import { motion } from 'framer-motion';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import CelebrationIcon from '@mui/icons-material/Celebration';
import BackgroundAnimation from './BackgroundAnimation';
import CursorParticles from './CursorParticles';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  backgroundColor: alpha('#ffffff', 0.9),
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '5px',
    background: 'linear-gradient(90deg, #FF9AA2, #FFB7B2, #FFDAC1, #E2F0CB, #B5EAD7, #C7CEEA)',
    backgroundSize: '600% 600%',
    animation: 'gradientAnimation 6s ease infinite',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-3px)',
    },
    '&.Mui-focused': {
      transform: 'translateY(-3px)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 24px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #FF6B6B 0%, #FFE66D 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF5252 0%, #FFD700 100%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 25px rgba(255, 107, 107, 0.6)',
  },
}));

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B',
    },
    secondary: {
      main: '#4ECDC4',
    },
    error: {
      main: '#FF6B6B',
    },
    success: {
      main: '#6BFF92',
    },
    background: {
      default: '#F7FFF7',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      background: 'linear-gradient(45deg, #FF6B6B, #6B66FF)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @keyframes gradientAnimation {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        body {
          background: linear-gradient(135deg, #D4C1EC, #C8B6E2, #BEA9FF);
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
          min-height: 100vh;
        }
      `,
    },
  },
});

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
  const navigate = useNavigate();
  
  // For bouncing animation
  const [bounce, setBounce] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(prev => !prev);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
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
      
      setSuccess('Registration successful! Redirecting to login...');
      
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

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <BackgroundAnimation />
      <CursorParticles />
      <Container maxWidth="xs" component={Box} sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative', // Add this
        zIndex: 1 
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <StyledPaper elevation={6}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              position: 'relative',
              mb: 4,
            }}>
              <motion.div animate={bounce ? floatingAnimation : {}}>
                <EmojiPeopleIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />
              </motion.div>
              
              <Typography component="h2" variant="h2">
                Join the Fun!
              </Typography>
              
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CelebrationIcon color="secondary" sx={{ fontSize: 24, ml: 1 }} />
              </motion.div>
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
                    animation: 'shake 0.5s ease-in-out',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                    }
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
                    animation: 'pulse 1.5s infinite'
                  }}
                >
                  {success}
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <StyledTextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  sx: { fontSize: '1.1rem' }
                }}
                InputLabelProps={{
                  sx: { fontSize: '1.1rem' }
                }}
              />

              <StyledTextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  sx: { fontSize: '1.1rem' }
                }}
                InputLabelProps={{
                  sx: { fontSize: '1.1rem' }
                }}
              />

              <StyledTextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  sx: { fontSize: '1.1rem' }
                }}
                InputLabelProps={{
                  sx: { fontSize: '1.1rem' }
                }}
              />

              <StyledTextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  sx: { fontSize: '1.1rem' }
                }}
                InputLabelProps={{
                  sx: { fontSize: '1.1rem' }
                }}
              />

              <Box sx={{ position: 'relative', width: '100%', height: 50, mt: 2 }}>
                <SubmitButton
                  fullWidth
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  sx={{ height: '100%' }}
                  endIcon={loading ? null : <LockOpenIcon />}
                >
                  {loading ? 'Creating Magic...' : 'Register Now!'}
                </SubmitButton>
                
                {loading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Typography variant="body1">
                  Already in the game?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      textDecoration: 'none', 
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        height: '2px',
                        bottom: 0,
                        left: 0,
                        background: theme.palette.primary.main,
                        transform: 'scaleX(0)',
                        transition: 'transform 0.3s ease'
                      },
                      '&:hover::after': {
                        transform: 'scaleX(1)'
                      }
                    }}
                  >
                    Login here!
                  </Link>
                </Typography>
              </motion.div>
            </Box>
          </StyledPaper>
        </motion.div>
      </Container>
    </ThemeProvider>
  );
}

export default Register;