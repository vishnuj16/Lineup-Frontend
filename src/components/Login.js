import React, { useState } from 'react';
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
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LoginIcon from '@mui/icons-material/Login';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
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
  background: 'linear-gradient(45deg, #6B66FF 0%, #4ECDC4 100%)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  boxShadow: '0 4px 20px rgba(107, 102, 255, 0.4)',
  '&:hover': {
    background: 'linear-gradient(45deg, #5D5AFF 0%, #43B3AC 100%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 25px rgba(107, 102, 255, 0.6)',
  },
}));

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6B66FF',
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
      background: 'linear-gradient(45deg, #6B66FF, #4ECDC4)',
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

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', formData);
      onLogin(
        {
          id: response.data.user_id,
          username: response.data.username,
          email: response.data.email
        },
        {
          access: response.data.access,
          refresh: response.data.refresh
        }
      );
      navigate('/start');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const svgVariants = {
    hidden: { rotate: -10 },
    visible: { 
      rotate: 10,
      transition: { 
        yoyo: Infinity,
        duration: 0.5,
        ease: "easeInOut"
      }
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
              <motion.div
                variants={svgVariants}
                initial="hidden"
                animate="visible"
              >
                <SportsEsportsIcon color="primary" sx={{ fontSize: 60, mb: 1 }} />
              </motion.div>
              
              <Typography component="h2" variant="h2">
                Game On!
              </Typography>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: 0.3
                }}
              >
                <EmojiEventsIcon color="secondary" sx={{ fontSize: 24, ml: 1 }} />
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

            <motion.form 
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <StyledTextField
                fullWidth
                label="Username or Email"
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

              <Box sx={{ position: 'relative', width: '100%', height: 50, mt: 2 }}>
                <SubmitButton
                  fullWidth
                  type="submit"
                  disabled={loading}
                  variant="contained"
                  sx={{ height: '100%' }}
                  endIcon={loading ? null : <LoginIcon />}
                >
                  {loading ? 'Entering World...' : 'Start Adventure!'}
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
            </motion.form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Typography variant="body1">
                  New to the game?{' '}
                  <Link 
                    to="/register" 
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
                    Join now!
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

export default Login;