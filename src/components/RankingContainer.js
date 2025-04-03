import React, { useState, useEffect, useCallback } from 'react';

import { useDrag, useDrop } from 'react-dnd';
import './GamePlay.css'; // Make sure to create this CSS file

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
      <div 
        ref={drag} 
        className={`player-card ${isDragging ? 'player-dragging' : currentPosition ? 'player-positioned' : 'player-available'}`}
      >
        <div className="player-info">
          <div>
            <p className="player-name">{player.username}</p>
            {currentPosition && <span className="player-position">Position: {currentPosition}</span>}
          </div>
        </div>
      </div>
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
      <div 
        ref={drop} 
        className={`position-card ${
          isOver ? 'position-hover' : assignedPlayer ? 'position-filled' : 'position-empty'
        }`}
      >
        <div className="position-info">
          <div className="position-number">{position}</div>
          {assignedPlayer ? (
            <>
              <div className="position-player-name">{assignedPlayer.username}</div>
              <button 
                className="remove-player-btn" 
                onClick={handleRemoveClick} 
                title="Remove player from position"
              >
                ×
              </button>
            </>
          ) : (
            <div className="position-placeholder">Drop player here</div>
          )}
        </div>
      </div>
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
        
        // If this position already has a player, remove that association
        if (updatedRankings[position]) {
          const currentPlayerId = updatedRankings[position];
          
          // Also update playerPositions in the next setState call
          setPlayerPositions(prevPositions => {
            const updatedPositions = { ...prevPositions };
            delete updatedPositions[currentPlayerId];
            return updatedPositions;
          });
        }
        
        // If player is already in another position, remove from there
        if (player.currentPosition) {
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
        updateParentComponent({ ...rankings, [position]: player.id });
      }, 0);
    }, [totalPositions, rankings, updateParentComponent]);
    
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
        const updatedRankings = { ...rankings };
        delete updatedRankings[position];
        updateParentComponent(updatedRankings);
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
      <div className="ranking-container">
        {/* Left side: Position cards */}
        <div className="ranking-positions">
          <h3 className="section-title">Rankings</h3>
          {positions.map(position => (
            <PositionCard 
              key={position} 
              position={position} 
              assignedPlayer={getPlayerForPosition(position)}
              onDrop={handleDrop}
              onRemovePlayer={handleRemovePlayer}
            />
          ))}
        </div>
        {/* Right side: Available players */}
        <div className="ranking-players">
          <h3 className="section-title">Available Players</h3>
          
          {unpositionedPlayers.length > 0 ? (
            unpositionedPlayers.map(player => (
              <DraggablePlayer 
                key={player.id} 
                player={player}
                currentPosition={getPlayerPosition(player.id)}
              />
            ))
          ) : (
            <div className="empty-players-message">All players have been positioned</div>
          )}
          
          {/* Show positioned players separately for easy access */}
          {positionedPlayerIds.length > 0 && (
            <div className="positioned-players-section">
              <h3 className="section-title">Positioned Players</h3>
              <p className="hint-text">You can drag these to other positions</p>
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
            </div>
          )}
        </div>
      </div>
    );
  };

  export default RankingContainer;