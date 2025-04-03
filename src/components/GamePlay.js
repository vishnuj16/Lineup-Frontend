import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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

  // Debug logging for state tracking
  // useEffect(() => {
  //   console.log("Rankings updated:", rankings);
  //   console.log("Player positions updated:", playerPositions);
  //   console.log("Positioned player IDs:", positionedPlayerIds);
  //   console.log("Unpositioned players:", unpositionedPlayers);
  // }, [rankings, playerPositions, positionedPlayerIds, unpositionedPlayers]);

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

// Timer component
const Timer = ({ timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  return (
    <div className="timer-container">
      <div className={`timer-display ${timeLeft < 30 ? 'timer-warning' : ''}`}>
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </div>
      <p className="timer-label">Time Remaining</p>
    </div>
  );
};

// Status Banner component
const StatusBanner = ({ roundStatus, isWolf }) => {
  let message = "";
  let bannerClass = "status-banner status-info";

  switch (roundStatus) {
    case 'waiting':
      message = "Waiting for the host to start the round";
      break;
    case 'wolf_ranking':
      message = isWolf ? "You are the wolf! Rank the players" : "Waiting for the wolf to rank players";
      bannerClass = isWolf ? "status-banner status-danger" : "status-banner status-warning";
      break;
    case 'pack_ranking':
      message = "The pack is now ranking players";
      bannerClass = "status-banner status-success";
      break;
    case 'results':
      message = "Round results";
      bannerClass = "status-banner status-purple";
      break;
    default:
      message = "Waiting...";
  }

  return (
    <div className={bannerClass}>
      {message}
    </div>
  );
};

// Results component
const ResultsDisplay = ({ wolfRanking, packRanking, packScore, question }) => {
  console.log("Results Display:", { wolfRanking, packRanking, packScore, question });
  return (
    <div className="results-container">
      <h3 className="results-title">Round Results</h3>
      <p className="results-question">Question: {question}</p>
      
      <div className="results-columns">
        <div className="results-column">
          <h4 className="wolf-ranking-title">Wolf's Ranking</h4>
          <ol className="ranking-list">
            {wolfRanking.map((player, idx) => (
              <li key={player.id} className="ranking-item">{player.username}</li>
            ))}
          </ol>
        </div>
        
        <div className="results-column">
          <h4 className="pack-ranking-title">Pack's Ranking</h4>
          <ol className="ranking-list">
            {packRanking.map((player, idx) => (
              <li key={player.id} className="ranking-item">{player.username}</li>
            ))}
          </ol>
        </div>
      </div>
      
      <div className="score-container">
        <p className="score-value">Pack Score: <span className="score-number">{packScore}</span></p>
        <p className="score-explanation">
          (Points awarded to each pack member)
        </p>
      </div>
    </div>
  );
};

// Main GamePlay component
function GamePlay({ user, roomData, onLogout, onLeaveLobby }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Game flow states
  const [roundStatus, setRoundStatus] = useState('waiting'); // waiting, wolf_ranking, pack_ranking, results
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
  
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds
  
  // Establish the WebSocket connection with reconnection logic
  const connectWebSocket = useCallback(() => {
    if (!roomCode || !user?.username) return;
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem('access_token');
    const wsURL = `ws://localhost:8000/ws/game/${roomCode}/?token=${token}`;
    
    // Clean up any existing connection
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    
    const socket = new WebSocket(wsURL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('GamePlay WebSocket connection established');
      setWsConnected(true);
      reconnectAttemptsRef.current = 0;
      setMessages(prev => [...prev, { type: 'system', content: 'Connected to game' }]);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('GamePlay WebSocket message received:', data);

        switch (data.type) {
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
      setWsConnected(false);
      setMessages(prev => [...prev, { type: 'system', content: 'Disconnected from game' }]);
      
      // Attempt to reconnect if not closed intentionally (code 1000)
      if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        setMessages(prev => [...prev, { 
          type: 'system', 
          content: `Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})...` 
        }]);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current += 1;
          connectWebSocket();
        }, RECONNECT_DELAY);
      } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setError('Failed to connect after multiple attempts. Please refresh the page to try again.');
      }
    };

    socket.onerror = (error) => {
      console.error('GamePlay WebSocket error:', error);
      setMessages(prev => [...prev, { type: 'error', content: 'Error connecting to game' }]);
    };
  }, [roomCode, user?.username]);

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
    if (!isHost || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    console.log('Starting new round...');
    socketRef.current.send(JSON.stringify({
      type: 'start_round',
      round_number: currentRound
    }));
  };

  // Function to submit wolf ranking
  const handleSubmitWolfRanking = () => {
    if (!isWolf || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
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

  // Function to submit pack ranking
  const handleSubmitPackRanking = () => {
    if (!isPackRanker || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
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
    if (!isHost || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
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

  const getRoomData = async() => {
    try {
      setLoading(true); // Set loading state while fetching
      console.log("Fetching room data for room code:", roomCode);
      const response = await axios.get(`http://localhost:8000/api/game/get-room-details/?room_code=${roomCode}`);
      console.log("Room data received:", response.data);
      setRoomInfo(response.data);
      
      // If we have current_players, process them right away
      if (response.data.current_players && response.data.current_players.length > 0) {
        setPlayers(response.data.current_players);
        
        // If we're already in a round with a wolf, set up rankable players
        if (wolfId) {
          const rankable = prepareRankablePlayers(response.data.current_players, wolfId);
          console.log("Setting initial rankable players from API response:", rankable);
          setRankablePlayers(rankable);
        }
      }
      
      setLoading(false); // End loading state
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
    return <div className="loading-screen">Loading game...</div>;
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-message">{error}</div>
        <button 
          className="return-button"
          onClick={() => navigate('/lobby')}
        >
          Return to Lobby
        </button>
      </div>
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
    <DndProvider backend={HTML5Backend}>
      <div className="game-container">
        <div className="game-panel">
          <div className="game-header">
            <h1 className="room-title">Room: {roomCode}</h1>
            <div className="header-buttons">
              <button 
                className="leave-button"
                onClick={onLeaveLobby}
              >
                Leave Game
              </button>
            </div>
          </div>

          <div className="status-section">
            <StatusBanner roundStatus={roundStatus} isWolf={isWolf} />
            
            {timeLeft > 0 && (
              <Timer timeLeft={timeLeft} />
            )}
          </div>

          {/* Round information */}
          <div className="round-section">
            <div className="round-info">
              <div className="round-header">
                <h2 className="round-title">Round {currentRound} of {totalRounds}</h2>
                {isHost && roundStatus === 'waiting' && (
                  <button 
                    className="start-round-button"
                    onClick={handleStartRound}
                  >
                    Start Round
                  </button>
                )}
                {isHost && roundStatus === 'results' && (
                  <button 
                    className="next-round-button"
                    onClick={handleEndRound}
                  >
                    Next Round
                  </button>
                )}
              </div>
              
              {question && (
                <div className="question-display">
                  <h3 className="question-text">{question}</h3>
                </div>
              )}
              
              {wolfId && (
                <div className="wolf-info">
                  {isWolf ? (
                    <p className="wolf-status-player">You are the wolf!</p>
                  ) : (
                    <p className="wolf-status">Wolf: <span className="wolf-name">{wolfId}</span></p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Debug info */}
          <div className="debug-info" style={{display: 'none'}}>
            <h4>Debug Info</h4>
            <p>Players count: {players.length}</p>
            <p>Rankable players count: {rankablePlayers.length}</p>
            <p>Round status: {roundStatus}</p>
            <p>Is wolf: {isWolf ? 'Yes' : 'No'}</p>
            <p>Is pack ranker: {isPackRanker ? 'Yes' : 'No'}</p>
          </div>

          {/* Ranking interface */}
          {(roundStatus === 'wolf_ranking' && isWolf) || (roundStatus === 'pack_ranking' && isPackRanker) ? (
            <div className="ranking-section">
              <RankingContainer 
                players={displayRankablePlayers}
                onRankingChange={handleRankingChange}
              />
              
              <div className="submit-ranking">
                <button 
                  className="submit-button"
                  onClick={isWolf ? handleSubmitWolfRanking : handleSubmitPackRanking}
                  disabled={displayRankablePlayers.length === 0}
                >
                  Submit Ranking
                </button>
              </div>
            </div>
          ) : roundStatus === 'wolf_ranking' || roundStatus === 'pack_ranking' ? (
            <div className="waiting-message">
              <p>
                {roundStatus === 'wolf_ranking' 
                  ? `Waiting for ${wolfId} to rank players...` 
                  : `Waiting for ${packRankerId} to rank players...`}
              </p>
            </div>
          ) : null}

          {/* Results display */}
          {roundStatus === 'results' && roundResults && (
            <ResultsDisplay 
              wolfRanking={roundResults.wolfRanking}
              packRanking={roundResults.packRanking}
              packScore={roundResults.packScore}
              question={question}
            />
          )}

          {/* Players list */}
          <div className="players-section">
            <h3 className="players-title">Players</h3>
            <div className="players-grid">
              {players.length > 0 ? (
                players.map(player => (
                  <div 
                    key={player.id} 
                    className={`player-tile ${
                      player.user__username === wolfId || player.username === wolfId 
                        ? 'player-wolf' : ''
                    }`}
                  >
                    <div className="player-tile-info">
                      {(player.user__username === roomInfo?.host || player.username === roomInfo?.host) && (
                        <span className="host-crown">👑</span>
                      )}
                      <span>{player.user__username || player.username}</span>
                      {(player.user__username === wolfId || player.username === wolfId) && (
                        <span className="wolf-label">(Wolf)</span>
                      )}
                    </div>
                    <div className="player-score">
                      Score: {player.score || 0}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-players-message">No players in the game yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default GamePlay;