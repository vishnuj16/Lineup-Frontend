import React, { useState, useEffect, useRef } from 'react';
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
  styled,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import LoginIcon from '@mui/icons-material/Login';
import PetsIcon from '@mui/icons-material/Pets';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LightModeIcon from '@mui/icons-material/LightMode';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Lottie from 'react-lottie';
import wolfAnimation from '../animations/wolf1.json'; // You'll need to add this Lottie file

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6), // Increased padding
  borderRadius: 30, // More rounded corners
  backgroundColor: alpha('#0F0F13', 0.85),
  backdropFilter: 'blur(10px)',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.7)',
  border: '2px solid rgba(138, 98, 192, 0.3)', // More visible colorful border
  position: 'relative',
  overflow: 'hidden',
  transform: 'scale(1.1)', // Make it larger
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at top right, rgba(138, 98, 192, 0.2) 0%, rgba(25, 22, 33, 0.1) 70%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle at 30% 70%, rgba(138, 98, 192, 0.05) 0%, transparent 50%)',
    animation: 'rotateGradient 30s linear infinite',
    pointerEvents: 'none',
  },
  '@keyframes rotateGradient': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(4), // More spacing between fields
  '& .MuiOutlinedInput-root': {
    borderRadius: 20, // More rounded
    backgroundColor: alpha(theme.palette.background.paper, 0.4),
    backdropFilter: 'blur(5px)',
    transition: 'all 0.4s ease',
    fontSize: '1.2rem', // Larger text
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)', // More playful hover
      boxShadow: '0 8px 20px rgba(111, 76, 155, 0.25)',
    },
    '&.Mui-focused': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 10px 25px rgba(111, 76, 155, 0.3)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.grey[400],
    fontWeight: 500,
    letterSpacing: '0.5px',
    fontSize: '1.15rem', // Larger label
    fontFamily: '"Comic Neue", sans-serif', // Fun font
  },
  '& .MuiOutlinedInput-input': {
    color: theme.palette.grey[100],
    padding: '18px 22px', // Larger padding
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.grey[500], 0.3),
    borderWidth: 2, // Thicker border
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: 22, // More rounded
  padding: '16px 30px', // Bigger button
  fontSize: '1.25rem', // Bigger text
  fontWeight: 'bold',
  textTransform: 'none',
  background: 'linear-gradient(45deg, #574972 0%, #6F4C9B 50%, #9370DB 100%)', // More colorful gradient
  backgroundSize: '200% 200%',
  animation: 'gradientShift 5s ease infinite',
  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  boxShadow: '0 8px 25px rgba(111, 76, 155, 0.4)',
  '&:hover': {
    background: 'linear-gradient(45deg, #6F4C9B 0%, #8A62C0 50%, #B19CD9 100%)',
    backgroundSize: '200% 200%',
    transform: 'translateY(-5px) scale(1.03)',
    boxShadow: '0 12px 30px rgba(111, 76, 155, 0.6)',
  },
  '&:active': {
    transform: 'translateY(2px)',
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
}));

const DayCycleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 20,
  right: 20,
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.background.paper, 0.2),
  color: theme.palette.primary.light,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.4),
    transform: 'rotate(30deg)',
  },
}));

const StarryBackground = ({ isNight }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Star array
    const stars = [];
    const numberOfStars = isNight ? 200 : 100;
    
    // Initialize stars
    for (let i = 0; i < numberOfStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        flickerSpeed: Math.random() * 0.05,
        flickerDirection: Math.random() > 0.5 ? 1 : -1
      });
    }
    
    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      stars.forEach(star => {
        // Update star opacity for flickering effect
        star.opacity += star.flickerSpeed * star.flickerDirection;
        if (star.opacity >= 1) {
          star.flickerDirection = -1;
        } else if (star.opacity <= 0.2) {
          star.flickerDirection = 1;
        }
        
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = isNight 
          ? `rgba(255, 255, 255, ${star.opacity})` 
          : `rgba(255, 255, 255, ${star.opacity * 0.6})`;
        ctx.fill();
        
        // Occasional star glow
        if (Math.random() > 0.99) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = isNight 
            ? `rgba(200, 200, 255, ${star.opacity * 0.3})` 
            : `rgba(200, 200, 255, ${star.opacity * 0.1})`;
          ctx.fill();
        }
      });
      
      animationFrameId = window.requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isNight]);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

// Northern Lights Effect
const NorthernLights = ({ isNight }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!isNight) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Aurora parameters
    const waves = [];
    for (let i = 0; i < 5; i++) {
      waves.push({
        y: Math.random() * canvas.height * 0.6,
        length: Math.random() * 100 + 100,
        amplitude: Math.random() * 50 + 50,
        speed: Math.random() * 0.2 + 0.1,
        phase: Math.random() * Math.PI * 2,
        color: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 150 + 100)}, ${Math.floor(Math.random() * 100 + 155)}, 0.2)`
      });
    }
    
    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      waves.forEach(wave => {
        ctx.beginPath();
        
        for (let x = 0; x <= canvas.width; x += 5) {
          const y = wave.y + Math.sin(x * 0.01 + wave.phase) * wave.amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + wave.amplitude);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, wave.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        wave.phase += wave.speed;
      });
      
      animationFrameId = window.requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isNight]);
  
  return isNight ? (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7
      }}
    />
  ) : null;
};

// Create a custom theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8A62C0',
      light: '#AC8FD8',
      dark: '#574972',
    },
    secondary: {
      main: '#45374D',
    },
    error: {
      main: '#F06292',
    },
    success: {
      main: '#81C784',
    },
    background: {
      default: '#0F0F13',
      paper: '#1A1A24',
    },
    text: {
      primary: '#E2D9F3',
      secondary: '#AC8FD8',
    },
  },
  typography: {
    fontFamily: '"Comic Neue", "Bubblegum Sans", "Quicksand", sans-serif',
    h2: {
      fontWeight: 700,
      fontSize: '3rem',
      letterSpacing: '1px',
      color: '#E2D9F3',
      textShadow: '0 0 15px rgba(138, 98, 192, 0.7)',
    },
    subtitle1: {
      fontSize: '1.3rem',
      letterSpacing: '0.5px',
    },
    button: {
      fontFamily: '"Bubblegum Sans", "Comic Neue", sans-serif',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Comic+Neue:wght@400;700&family=Quicksand:wght@400;500;600;700&display=swap');
        body {
          background: linear-gradient(135deg, #0F0F13, #1A1A24, #252336);
          background-size: cover;
          min-height: 100vh;
          overflow-x: hidden;
        }
      `,
    },
  },
  shape: {
    borderRadius: 18, // Increased roundness
  },
});

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNight, setIsNight] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const toggleDayCycle = () => {
    setIsNight(!isNight);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.19, 1.0, 0.22, 1.0] }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    },
    hover: { 
      scale: 1.05,
      rotate: [0, -5, 5, -5, 0],
      transition: { 
        duration: 1,
        ease: "easeInOut"
      }
    }
  };

  const moonSunVariants = {
    initial: {
      rotate: 0,
      scale: 1
    },
    animate: {
      rotate: isNight ? [0, 360] : [0, -360],
      scale: [1, 0.8, 1],
      transition: {
        duration: 1,
        ease: "easeInOut"
      }
    }
  };

  const backgroundVariants = {
    night: {
      background: 'linear-gradient(135deg, #0F0F13, #1A1A24, #252336)'
    },
    day: {
      background: 'linear-gradient(135deg, #2A2440, #3A3163, #4A3E86)'
    }
  };

  // Lottie options
  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: wolfAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <motion.div
        initial={isNight ? "night" : "day"}
        animate={isNight ? "night" : "day"}
        variants={backgroundVariants}
        transition={{ duration: 1.5 }}
        style={{ 
          minHeight: '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -2
        }}
      />
      
      {/* Background Animations */}
      <StarryBackground isNight={isNight} />
      <NorthernLights isNight={isNight} />
      
      <Box sx={{ 
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        p: { xs: 2, sm: 4 }
      }}>
        {/* Wolf Animation/Logo for desktop */}
        {!isMobile && (
          <Box 
            sx={{ 
              position: 'absolute', 
              left: '10%', 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '40%',
              maxWidth: '600px',
              zIndex: 1
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {/* If you have Lottie animation */}
              <Lottie options={defaultLottieOptions} height={400} width={400} />
              
              {/* If you don't have Lottie, use this fallback */}
              {/* <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Box 
                  component="img"
                  src="/path-to-wolf-silhouette.png" // Replace with actual path
                  alt="Wolf Silhouette"
                  sx={{ 
                    width: '100%',
                    maxWidth: '500px',
                    filter: 'drop-shadow(0 0 15px rgba(138, 98, 192, 0.5))'
                  }}
                />
              </motion.div> */}
              
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 700,
                  textAlign: 'center',
                  color: '#E2D9F3',
                  textShadow: '0 0 15px rgba(138, 98, 192, 0.7)',
                  mt: 2
                }}
              >
                Wolf Pack
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontStyle: 'italic',
                  textAlign: 'center',
                  color: alpha('#AC8FD8', 0.8),
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                }}
              >
                Embrace the night, join the hunt
              </Typography>
            </motion.div>
          </Box>
        )}
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ 
            width: isMobile ? '100%' : '500px', // Wider form
            marginRight: isMobile ? 0 : '10%'
          }}
        >
          <StyledPaper elevation={24}>
            <DayCycleButton onClick={toggleDayCycle}>
              <motion.div
                initial="initial"
                animate="animate"
                variants={moonSunVariants}
              >
                {isNight ? 
                  <NightsStayIcon sx={{ fontSize: 24 }} /> : 
                  <LightModeIcon sx={{ fontSize: 24 }} />
                }
              </motion.div>
            </DayCycleButton>

            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              mb: 4,
            }}>
              {/* Only show logo in mobile or when no lottie */}
              {isMobile && (
                <motion.div 
                  variants={logoVariants}
                  whileHover="hover"
                >
                  <Box sx={{ 
                    position: 'relative',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(138,98,192,0.2) 0%, rgba(79,56,110,0) 70%)',
                      filter: 'blur(8px)',
                      animation: 'pulse 3s infinite ease-in-out',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                        '50%': { opacity: 1, transform: 'scale(1.2)' },
                      }
                    }} />
                    <PetsIcon sx={{ 
                      fontSize: 50, 
                      color: theme.palette.primary.light,
                      filter: 'drop-shadow(0 0 10px rgba(138, 98, 192, 0.6))',
                    }} />
                  </Box>
                </motion.div>
              )}
              
              {isMobile && (
                <>
                  <motion.div variants={itemVariants}>
                    <Typography component="h2" variant="h2" sx={{ 
                      mb: 1,
                      textAlign: 'center',
                    }}>
                      Wolf Pack
                    </Typography>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Typography variant="subtitle1" sx={{ 
                      color: alpha('#AC8FD8', 0.8),
                      fontStyle: 'italic',
                      mb: 3,
                      textAlign: 'center',
                    }}>
                      Join the moonlit hunt
                    </Typography>
                  </motion.div>
                </>
              )}
              
              {!isMobile && (
                <motion.div variants={itemVariants}>
                  <Typography variant="h4" sx={{ 
                    mb: 3,
                    textAlign: 'center',
                    fontWeight: 600,
                  }}>
                    Return to the Pack
                  </Typography>
                </motion.div>
              )}
            </Box>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.error.main, 0.15),
                    color: theme.palette.error.light,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                    animation: 'fadeInDown 0.5s ease-in-out',
                    '@keyframes fadeInDown': {
                      '0%': { opacity: 0, transform: 'translateY(-10px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' },
                    }
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            <motion.form 
              onSubmit={handleSubmit}
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <StyledTextField
                  fullWidth
                  label="Username or Email"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { fontSize: '1.05rem' }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.05rem' }
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <StyledTextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { fontSize: '1.05rem' },
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                        sx={{ color: alpha(theme.palette.primary.light, 0.7) }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    )
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '1.05rem' }
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Box sx={{ position: 'relative', width: '100%', height: 56, mt: 2 }}>
                  <SubmitButton
                    fullWidth
                    type="submit"
                    disabled={loading}
                    variant="contained"
                    sx={{ height: '100%' }}
                    endIcon={loading ? null : <LoginIcon />}
                  >
                    {loading ? 'Joining Pack...' : 'Enter The Wild'}
                  </SubmitButton>
                  
                  {loading && (
                    <CircularProgress
                      size={28}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-14px',
                        marginLeft: '-14px',
                        color: theme.palette.primary.light
                      }}
                    />
                  )}
                </Box>
              </motion.div>
            </motion.form>

            <motion.div variants={itemVariants}>
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Typography variant="body1" sx={{ 
                    color: theme.palette.grey[400],
                    fontWeight: 500 
                  }}>
                    New to the pack?{' '}
                    <Link 
                      to="/register" 
                      style={{ 
                        textDecoration: 'none', 
                        color: theme.palette.primary.light,
                        fontWeight: 'bold',
                        position: 'relative',
                      }}
                    >
                      <Box component="span" sx={{
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          width: '0%',
                          height: '2px',
                          bottom: -2,
                          left: 0,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                          transition: 'width 0.3s ease',
                        },
                        '&:hover::after': {
                          width: '100%'
                        }
                      }}>
                        Become a wolf
                      </Box>
                    </Link>
                  </Typography>
                </motion.div>
              </Box>
            </motion.div>
          </StyledPaper>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
}

export default Login;