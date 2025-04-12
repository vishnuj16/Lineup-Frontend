import React, { useState, useEffect, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Paper, 
  ThemeProvider, 
  createTheme, 
  CssBaseline
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WolfIcon from '@mui/icons-material/Pets';

// Custom dark theme with wolf-inspired colors
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6e8daf', // Wolf blue-gray
    },
    secondary: {
      main: '#d0a85c', // Wolf amber/gold
    },
    background: {
      default: '#1c1f26', // Dark blue-gray
      paper: '#262a35',   // Slightly lighter
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", "Helvetica", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.3s ease',
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

// Draggable player name component
const DraggablePlayer = ({ player, currentPosition }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'player',
    item: { 
      id: player.id, 
      username: player.username, 
      currentPosition // Track current position for drag operations
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <Card
      ref={drag}
      sx={{
        mb: 2,
        opacity: isDragging ? 0.6 : 1,
        transform: isDragging ? 'scale(0.98)' : 'scale(1)',
        boxShadow: currentPosition 
          ? '0 4px 12px rgba(110, 141, 175, 0.4)' 
          : '0 2px 8px rgba(0, 0, 0, 0.2)',
        borderLeft: currentPosition ? '4px solid #d0a85c' : 'none',
        '&:hover': {
          boxShadow: '0 6px 14px rgba(110, 141, 175, 0.5)',
        },
        cursor: 'grab',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center">
          <WolfIcon sx={{ mr: 1, color: '#d0a85c' }} />
          <Box>
            <Typography variant="body1" fontWeight="500">{player.username}</Typography>
            {currentPosition && (
              <Typography variant="caption" color="text.secondary">
                Position: {currentPosition}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Position card that accepts player drops
const PositionCard = ({ position, assignedPlayer, onDrop, onRemovePlayer }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'player',
    drop: (item) => onDrop(item, position),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Handle removing player from position
  const handleRemoveClick = () => {
    if (assignedPlayer) {
      onRemovePlayer(position);
    }
  };

  return (
    <Paper
      ref={drop}
      elevation={3}
      sx={{
        mb: 2,
        position: 'relative',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderRadius: 2,
        border: isOver ? '2px dashed #d0a85c' : 'none',
        backgroundColor: assignedPlayer 
          ? 'rgba(110, 141, 175, 0.15)'
          : isOver 
            ? 'rgba(208, 168, 92, 0.1)'
            : 'background.paper',
        transition: 'all 0.2s ease',
      }}
    >
      <Box 
        sx={{ 
          width: 36, 
          height: 36, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          color: 'background.paper',
          fontWeight: 'bold',
          mr: 2,
        }}
      >
        {position}
      </Box>
      
      {assignedPlayer ? (
        <Box flexGrow={1} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <WolfIcon sx={{ mr: 1, color: '#d0a85c', fontSize: 18 }} />
            <Typography variant="body1" fontWeight="500">
              {assignedPlayer.username}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleRemoveClick} 
            size="small" 
            title="Remove player from position"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          Drop player here
        </Typography>
      )}
    </Paper>
  );
};

const RankingContainer = ({ players, onRankingChange }) => {
  const [rankings, setRankings] = useState({});
  const [playerPositions, setPlayerPositions] = useState({});
  const [totalPositions, setTotalPositions] = useState(players.length);
  
  // Update total positions if players array changes
  useEffect(() => {
    // Only update if the player count changes and is greater than current total
    if (players.length > totalPositions) {
      setTotalPositions(players.length);
    }
  }, [players.length, totalPositions]);
  
  // Create the positions array based on totalPositions
  const positions = Array.from({ length: totalPositions }, (_, i) => i + 1);
  
  // Get the current position of a player
  const getPlayerPosition = (playerId) => {
    return playerPositions[playerId] || null;
  };

  // Convert rankings to the ordered list and notify parent
  const updateParentComponent = useCallback((updatedRankings) => {
    // Important: Use the fixed positions array, not derived from rankings
    const orderedPlayers = positions
      .filter(pos => updatedRankings[pos])
      .map(pos => {
        const playerId = updatedRankings[pos];
        return players.find(p => p.id === playerId);
      })
      .filter(Boolean);
    
    console.log("Ordered players after update:", orderedPlayers);
    onRankingChange(orderedPlayers);
  }, [positions, players, onRankingChange]);

  // Handle dropping a player on a position
  const handleDrop = useCallback((player, position) => {
    if (position > totalPositions) return;
    console.log("Dropping player:", player, "at position:", position);
    
    setRankings(prevRankings => {
      // Create copies of state to modify
      let updatedRankings = { ...prevRankings };
      
      // If this position already has a player, handle swapping logic
      if (updatedRankings[position]) {
        const currentPlayerId = updatedRankings[position];
        
        // If player is already in another position, swap them
        if (player.currentPosition) {
          // Move the current player at this position to the dragged player's old position
          updatedRankings[player.currentPosition] = currentPlayerId;
          
          // Update player positions for the swapped player
          setPlayerPositions(prevPositions => {
            const updatedPositions = { ...prevPositions };
            updatedPositions[currentPlayerId] = player.currentPosition;
            return updatedPositions;
          });
        } else {
          // Just remove the association if the dragged player wasn't positioned before
          setPlayerPositions(prevPositions => {
            const updatedPositions = { ...prevPositions };
            delete updatedPositions[currentPlayerId];
            return updatedPositions;
          });
        }
      } else if (player.currentPosition) {
        // If player is moving to an empty position, just remove from old position
        delete updatedRankings[player.currentPosition];
      }
      
      // Assign the player to the new position
      updatedRankings[position] = player.id;
      
      // Also update playerPositions in a separate setState call
      setPlayerPositions(prevPositions => {
        const updatedPositions = { ...prevPositions };
        updatedPositions[player.id] = position;
        return updatedPositions;
      });
      
      // Return the updated rankings for this setState call
      return updatedRankings;
    });
    
    // Use setTimeout to ensure the state updates have processed before notifying parent
    setTimeout(() => {
      setRankings(currentRankings => {
        updateParentComponent(currentRankings);
        return currentRankings;
      });
    }, 0);
  }, [totalPositions, updateParentComponent]);
  
  // Handle removing a player from a position
  const handleRemovePlayer = useCallback((position) => {
    const playerId = rankings[position];
    if (!playerId) return;
    
    setRankings(prevRankings => {
      // Create a copy to modify
      let updatedRankings = { ...prevRankings };
      // Remove the position association
      delete updatedRankings[position];
      return updatedRankings;
    });
    
    setPlayerPositions(prevPositions => {
      // Create a copy to modify
      let updatedPositions = { ...prevPositions };
      // Remove the player's position
      delete updatedPositions[playerId];
      return updatedPositions;
    });
    
    // Notify parent after a small delay to ensure state is updated
    setTimeout(() => {
      setRankings(currentRankings => {
        updateParentComponent(currentRankings);
        return currentRankings;
      });
    }, 0);
  }, [rankings, updateParentComponent]);
  
  // Get the player object assigned to a position
  const getPlayerForPosition = useCallback((position) => {
    const playerId = rankings[position];
    if (!playerId) return null;
    return players.find(p => p.id === playerId);
  }, [rankings, players]);

  // Group players into positioned and unpositioned
  const positionedPlayerIds = Object.values(rankings);
  const unpositionedPlayers = players.filter(player => !positionedPlayerIds.includes(player.id));

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box 
        sx={{ 
          py: 4,
          px: 2,
          minHeight: '100vh',
          background: `linear-gradient(135deg, #1c1f26 0%, #262a35 100%)`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zm-16.142 0l6.485 6.485L36.070 7.9l-7.9-7.9h2.83zm-8.07 0l6.486 6.485-1.415 1.415-7.9-7.9h2.83zM20.485 0L27 6.485 25.586 7.9l-7.9-7.9h2.8zm-8.072 0l6.486 6.485-1.414 1.415-7.9-7.9h2.828zM4.343 0l6.485 6.485L9.414 7.9l-7.9-7.9h2.83zm0 0L-3 7.344l1.414 1.414L4.342 2.83l6.485 6.486 1.414-1.414L5.757 1.415 9.9 4.55 11.315 3.14 4.344 0zm40.656 0l-6.484
 6.484 1.413 1.414 7.9-7.9h-2.827zm-32.656 0l-6.485 6.485 1.414 1.414 7.9-7.9h-2.83zm16.343 0L12.343 7.344l1.414 1.414L20.685 2.83l6.484 6.486 1.414-1.414-6.484-6.485 4.14 3.134 1.416-1.413L20.344 0zm8.372 0l-6.485 6.484 1.414 1.414 7.9-7.9h-2.828zm8.37 0L29.37 7.344l1.415 1.414 7.9-7.9h-2.83zm-8.37 16.686l-7.314-7.314 1.414-1.414 7.314 7.314-1.414 1.414zm16.74 0L41.96 9.372l1.415-1.414 7.314 7.314-1.414 1.414zM4.157 16.686L-3.157 9.372 1.7426 7.958l7.314 7.314-1.414 1.414z' fill='%236e8daf' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      >
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            color: 'secondary.main',
            fontWeight: 'bold',
            textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
          }}
        >
          <WolfIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Wolf Pack Rankings
        </Typography>
        
        {/* Main container with grid layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: 4,
            maxWidth: 1200,
            mx: 'auto',
          }}
        >
          {/* Left side: Position cards */}
          <Box>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                borderLeft: '4px solid #6e8daf',
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                  color: 'primary.main'
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main',
                    color: 'background.paper',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1,
                    fontSize: '0.8rem'
                  }}
                >
                  #
                </Box>
                Pack Rankings
              </Typography>
              
              {positions.map(position => (
                <PositionCard 
                  key={position} 
                  position={position} 
                  assignedPlayer={getPlayerForPosition(position)}
                  onDrop={handleDrop}
                  onRemovePlayer={handleRemovePlayer}
                />
              ))}
            </Paper>
          </Box>
          
          {/* Right side: Available players */}
          <Box>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                borderLeft: '4px solid #d0a85c',
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                  color: 'secondary.main'
                }}
              >
                <WolfIcon sx={{ mr: 1 }} />
                Available Wolves
              </Typography>
              
              {unpositionedPlayers.length > 0 ? (
                unpositionedPlayers.map(player => (
                  <DraggablePlayer 
                    key={player.id} 
                    player={player}
                    currentPosition={getPlayerPosition(player.id)}
                  />
                ))
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 3,
                    color: 'text.secondary',
                    borderRadius: 1,
                    bgcolor: 'rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="body2">All players have been positioned</Typography>
                </Box>
              )}
            </Paper>
            
            {/* Show positioned players separately for easy access */}
            {positionedPlayerIds.length > 0 && (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  borderLeft: '4px solid #6e8daf',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 1,
                    color: 'primary.main'
                  }}
                >
                  <WolfIcon sx={{ mr: 1 }} />
                  Positioned Wolves
                </Typography>
                
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block', 
                    mb: 2,
                    fontStyle: 'italic'
                  }}
                >
                  Drag these to other positions to swap
                </Typography>
                
                {players
                  .filter(p => positionedPlayerIds.includes(p.id))
                  .map(player => (
                    <DraggablePlayer 
                      key={player.id} 
                      player={player}
                      currentPosition={getPlayerPosition(player.id)}
                    />
                  ))
                }
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default RankingContainer;