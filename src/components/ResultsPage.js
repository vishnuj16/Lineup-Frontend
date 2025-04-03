import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Button, 
  Avatar, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Divider, 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery
} from '@mui/material';
import { 
  Replay, 
  HomeRounded, 
  EmojiEvents, 
  Pets, 
  QuestionAnswer,
  NightsStay,
  Group
} from '@mui/icons-material';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { statistics, roomCode } = location.state || {};
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Custom Night Wolf Theme
  const nightWolfTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#9561FF', // Purple with blue tone
      },
      secondary: {
        main: '#4ECDC4', // Teal accent
      },
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
      text: {
        primary: '#E0E0FF',
        secondary: '#B0B0FF',
      },
      error: {
        main: '#FF6B6B',
      },
      warning: {
        main: '#FFD166',
      },
      info: {
        main: '#6FA8DC',
      },
      success: {
        main: '#06D6A0',
      },
    },
    typography: {
      fontFamily: '"Quicksand", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
      h2: {
        fontWeight: 600,
        letterSpacing: '0.03em',
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'linear-gradient(to bottom right, rgba(30, 30, 40, 0.8), rgba(15, 15, 25, 0.95))',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: '1rem',
          },
        },
      },
    },
  });

  // Apply night wolf background effect
  useEffect(() => {
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    document.body.style.background = 'linear-gradient(135deg, #121212 0%, #1A1A2E 50%, #202040 100%)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.minHeight = '100vh';
    document.body.style.fontFamily = '"Quicksand", sans-serif';
    document.body.style.color = '#E0E0FF';
    
    return () => {
      document.body.style.background = '';
      document.body.style.backgroundSize = '';
      document.body.style.minHeight = '';
      document.body.style.fontFamily = '';
      document.body.style.color = '';
    };
  }, []);

  // Redirect if no statistics are available
  if (!statistics) {
    return (
      <ThemeProvider theme={nightWolfTheme}>
        <CssBaseline />
        <Container sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper elevation={6} sx={{ p: 6, textAlign: 'center', maxWidth: 400, width: '100%' }}>
            <NightsStay sx={{ fontSize: 80, mb: 2, color: 'primary.main' }} />
            <Typography variant="h4" gutterBottom>No Results Found</Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              It seems the moon has hidden the game results from view.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<HomeRounded />}
              onClick={() => navigate('/lobby')}
              fullWidth
            >
              Return to Lobby
            </Button>
          </Paper>
        </Container>
      </ThemeProvider>
    );
  }

  const { players, round_data, winners, total_rounds } = statistics;

  // Get players sorted by score
  const playersList = Object.entries(players).map(([username, data]) => ({
    username,
    ...data
  })).sort((a, b) => b.total_score - a.total_score);

  // Wolf silhouette SVG for background decoration
  const WolfSilhouette = () => (
    <Box
      component="div"
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '40%',
        height: '40%',
        opacity: 0.05,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23FFFFFF' d='M267.4 35.3c-4.2 1.9-9.5 7.5-16.4 17.2-5.1 7.2-19.9 31.4-28.8 47-3.8 6.6-12.7 20.4-19.8 30.5-7.1 10.2-16 24-19.9 30.8-3.8 6.9-9.9 16.6-13.5 21.7-6.9 9.9-19.3 24.2-47.5 55-9.5 10.4-20.3 22.9-24 27.7-3.6 4.9-8.4 10.3-10.5 12.1-3.4 2.9-4.4 3.2-9.5 3.2-9.9 0-33.5 4.9-45.4 9.5-14.9 5.6-24.5 12.7-28.7 21.2-4.9 9.9-5.6 30.5-1.2 34.9 3.1 3.1 10.2 2.7 15.8-1 8.2-5.3 13.9-15.4 16.9-29.5 1.5-7.1 2.5-9.5 4.1-10.9 5.8-4.9 22-8.7 36.4-8.7 15.3 0 15.4 0 30.2 15.4 6.9 7.1 13.8 13.6 15.4 14.4 3.9 1.9 9.3 2 13.2.1 2.2-1 7.8-6.1 15.4-13.9 14.4-14.8 23.4-22.2 30.9-25.5 5.3-2.4 6.9-2.6 19.4-2.6 12.9 0 14 .2 20.3 3 15.7 7.1 31.9 21.9 43.3 39.7 7.3 11.5 10.1 13.4 19.9 13.4 9.6 0 12.7-2.2 19.2-13.6 8.6-15.2 20.2-28.7 32.8-38.3 10.7-8.1 21.7-12.6 32.4-13.2 12.3-.7 19 2.3 31.8 14.3 12.8 12 17.8 14.8 24.8 14.8 7.3 0 12.5-3.1 22.7-13.6 13.8-14.2 14.6-14.6 29.9-14.6 14.6 0 30.5 3.7 36.5 8.5 1.6 1.3 2.7 3.7 4.2 11 2.8 13.9 8.6 24.2 16.8 29.6 5.6 3.7 12.7 4.1 15.8 1 1.9-1.9 2.4-3.8 2.8-10.3.7-12.8-1.3-22.5-6.3-29.7-4.3-6.3-13.8-13.3-24.5-18.2-10.4-4.8-20.6-7.3-38.9-9.5-13.2-1.6-17.8-3.5-28.7-12.2-4.9-3.9-18.5-17.6-30.3-30.6-49.5-54.4-64.9-72.4-80.9-94.2-15.7-21.4-25.8-39.8-29.7-54.3-5.4-19.8-18.1-54.3-23.3-63-2.6-4.3-6.5-10.1-8.6-12.7-8-10.1-15.1-14.1-20.1-11.5z'/%3E%3C/svg%3E")`,
        backgroundSize: 'contain',
        backgroundPosition: 'bottom right',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );

  return (
    <ThemeProvider theme={nightWolfTheme}>
      <CssBaseline />
      <WolfSilhouette />
      <Box sx={{ 
        minHeight: '100vh', 
        py: 4, 
        px: { xs: 2, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Moon decoration */}
        <Box 
          sx={{
            position: 'fixed',
            top: '-80px',
            left: '-80px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(149,97,255,0.1) 70%, rgba(0,0,0,0) 100%)',
            boxShadow: '0 0 80px 20px rgba(255,255,255,0.15)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper elevation={5} sx={{ p: { xs: 2, sm: 4 }, mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Pets sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Night Wolf Pack
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Room Code: <Chip label={roomCode} size="small" sx={{ ml: 1, fontFamily: 'monospace', fontWeight: 'bold' }} />
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: { xs: 2, md: 0 } }}>
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<HomeRounded />}
                onClick={() => navigate('/lobby')}
                sx={{ mr: 2 }}
              >
                Lobby
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Replay />}
                onClick={() => navigate(`/game/${roomCode}`)}
              >
                Play Again
              </Button>
            </Box>
          </Paper>

          {/* Winners Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" sx={{ 
              mb: 3, 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <EmojiEvents sx={{ color: 'warning.main', fontSize: 40 }} />
              {winners.length > 1 ? 'Pack Leaders' : 'Alpha Wolf'}
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              {winners.map((winner, index) => (
                <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{ height: '100%', background: 'linear-gradient(135deg, rgba(149, 97, 255, 0.2) 0%, rgba(25, 25, 35, 0.95) 100%)' }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Avatar 
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          mx: 'auto', 
                          mb: 2,
                          background: 'linear-gradient(45deg, #9561FF 30%, #4ECDC4 90%)',
                          boxShadow: '0 0 20px rgba(149, 97, 255, 0.5)',
                        }}
                      >
                        <Pets sx={{ fontSize: 50 }} />
                      </Avatar>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {winner}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <EmojiEvents sx={{ color: 'warning.main' }} />
                        <Typography variant="body1" color="text.secondary">
                          Score: {players[winner]?.total_score || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Player Rankings */}
          <Grid container spacing={4}>
            <Grid item xs={12} lg={6}>
              <Paper elevation={4} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" component="h2" sx={{ 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Group sx={{ color: 'primary.main' }} />
                  Pack Rankings
                </Typography>
                
                <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Player</TableCell>
                        <TableCell align="center">Score</TableCell>
                        <TableCell align="center">Wolf Rounds</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {playersList.map((player, index) => (
                        <TableRow 
                          key={player.username}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            background: winners.includes(player.username) 
                              ? 'linear-gradient(90deg, rgba(255, 209, 102, 0.1) 0%, rgba(25, 25, 35, 0) 100%)'
                              : 'transparent',
                            '&:hover': { 
                              background: 'rgba(149, 97, 255, 0.08)',
                            }
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {index + 1 <= 3 ? (
                              <Chip 
                                label={index + 1} 
                                size="small"
                                sx={{ 
                                  fontWeight: 'bold',
                                  background: index === 0 
                                    ? 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)' 
                                    : index === 1 
                                      ? 'linear-gradient(45deg, #C0C0C0 30%, #A9A9A9 90%)'
                                      : 'linear-gradient(45deg, #CD7F32 30%, #8B4513 90%)',
                                  color: '#000'
                                }}
                              />
                            ) : (
                              index + 1
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {winners.includes(player.username) && (
                                <EmojiEvents sx={{ fontSize: 16, color: 'warning.main', mr: 1 }} />
                              )}
                              {player.username}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={player.total_score} 
                              size="small" 
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              icon={<Pets sx={{ fontSize: '1rem !important' }} />} 
                              label={player.rounds_as_wolf}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Round Details */}
            <Grid item xs={12} lg={6}>
              <Paper elevation={4} sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" sx={{ 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <QuestionAnswer sx={{ color: 'secondary.main' }} />
                  Round Details
                </Typography>
                
                <Box sx={{ maxHeight: 500, overflow: 'auto', pr: 1 }}>
                  {round_data.map((round, index) => (
                    <Card 
                      key={index} 
                      sx={{ 
                        mb: 2, 
                        background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(25, 25, 35, 0.8) 100%)',
                        borderLeft: '4px solid',
                        borderColor: 'secondary.main',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Round {round.round_number}
                        </Typography>
                        
                        <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                          "{round.question}"
                        </Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              The Wolf
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Pets sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
                              <Typography variant="body1">
                                {round.wolf}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Pack Score
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Chip 
                                label={round.scores} 
                                size="small" 
                                color="primary" 
                                sx={{ fontWeight: 'bold' }} 
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Footer */}
          <Box sx={{ mt: 6, textAlign: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Night Wolf Pack Game Results • Total Rounds: {total_rounds}
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default ResultsPage;