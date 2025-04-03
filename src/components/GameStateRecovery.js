import React, { useState, useEffect } from 'react';

const GameStateRecovery = ({ roomCode, isConnected, onRecoveryComplete }) => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);
  const [recoveryMessage, setRecoveryMessage] = useState('');

  // Function to attempt game state recovery
  const recoverGameState = async () => {
    if (isRecovering) return;
    
    setIsRecovering(true);
    setRecoveryMessage('Attempting to recover game state...');
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/game/game-state/${roomCode}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch game state');
      
      const gameState = await response.json();
      setRecoveryMessage('Game state recovered successfully!');
      
      // Pass the recovered state to parent
      if (onRecoveryComplete) {
        onRecoveryComplete(gameState);
      }
      
      // Hide the recovery message after 3 seconds
      setTimeout(() => {
        setRecoveryMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error recovering game state:', error);
      setRecoveryMessage('Failed to recover game state. Will try again when reconnected.');
    } finally {
      setIsRecovering(false);
      setLastAttempt(Date.now());
    }
  };

  // Trigger recovery when connection is restored
  useEffect(() => {
    if (isConnected && Date.now() - lastAttempt > 5000) {
      recoverGameState();
    }
  }, [isConnected]);

  return (
    <div className="game-state-recovery">
      {!isConnected && (
        <div className="disconnected-overlay">
          <div className="disconnected-message">
            <div className="spinner"></div>
            <p>Connection lost. Attempting to reconnect...</p>
          </div>
        </div>
      )}
      
      {recoveryMessage && (
        <div className="recovery-message">
          {recoveryMessage}
        </div>
      )}
      
      {!isConnected && (
        <button 
          className="manual-reconnect-button"
          onClick={() => window.location.reload()}
        >
          Manually Reconnect
        </button>
      )}
    </div>
  );
};

export default GameStateRecovery;