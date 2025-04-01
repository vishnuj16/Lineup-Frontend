import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';

// Draggable Player Item component
const PlayerItem = ({ player, index, movePlayer }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'player',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'player',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        movePlayer(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`player-item ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="player-rank">{index + 1}</span>
      <span className="player-name">{player.username}</span>
    </div>
  );
};

// Main GamePlay component
function GamePlay({ user, roomData, onLogout, onLeaveLobby }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  
  // Game flow states
  const [roundStatus, setRoundStatus] = useState('waiting'); // waiting, wolf_ranking, pack_ranking, results
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [players, setPlayers] = useState([]);
  const [rankablePlayers, setRankablePlayers] = useState([]);
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
  
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds
  
  // Establish the WebSocket connection with reconnection logic
  const connectWebSocket = useCallback(() => {
    if (!roomCode || !user?.username) return;
    
    const token = localStorage.getItem('access_token');
    const wsURL = `ws://localhost:8000/ws/game/${roomCode}/?token=${token}`;
    
    // Clean up any existing connection
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
      return;
    }
    
    const socket = new WebSocket(wsURL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('GamePlay WebSocket connection established');
      setWsConnected(true);
      reconnectAttemptsRef.current = 0;
      setMessages(prev => [...prev, { type: 'system', content: 'Connected to game' }]);
      
      // Send player_connected message when connection is established
      socket.send(JSON.stringify({ 
        type: 'player_connected', 
        player: user.username 
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('GamePlay WebSocket message received:', data);

        switch (data.type) {
          case 'round_start_message':
            handleRoundStart(data);
            break;
          case 'wolf_ranking_submitted':
            handleWolfRankingSubmitted(data);
            break;
          case 'pack_ranker_selected':
            handlePackRankerSelected(data);
            break;
          case 'pack_ranking_submitted':
            handlePackRankingSubmitted(data);
            break;
          case 'round_result':
            handleRoundResult(data);
            break;
          case 'player_list_update':
            if (data.players) {
              setPlayers(data.players);
            }
            break;
          case 'error':
            setError(data.message || 'An error occurred');
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

  // Reorder players in a ranking
  const movePlayer = useCallback((dragIndex, hoverIndex) => {
    setRankablePlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const draggedPlayer = newPlayers[dragIndex];
      newPlayers.splice(dragIndex, 1);
      newPlayers.splice(hoverIndex, 0, draggedPlayer);
      return newPlayers;
    });
  }, []);

  // WebSocket message handlers
  const handleRoundStart = useCallback((data) => {
    // Clear any existing timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setCurrentRound(data.round_number);
    setQuestion(data.question);
    setWolfId(data.wolf_id);
    setIsWolf(data.wolf_id === user.username);
    setRoundStatus('wolf_ranking');
    
    // Initialize time left for wolf's turn (2 minutes = 120 seconds)
    setTimeLeft(120);
    
    // Prepare rankable players list (excluding the wolf if current user is the wolf)
    const playersList = players.filter(p => p.username !== data.wolf_id);
    setRankablePlayers(playersList);
    
    setMessages(prev => [...prev, { 
      type: 'round_start', 
      content: `Round ${data.round_number} started! Question: ${data.question}` 
    }]);

    if (data.wolf_id === user.username) {
      setMessages(prev => [...prev, { 
        type: 'wolf_notification', 
        content: `You are the wolf for this round! You have 2 minutes to rank the players.` 
      }]);
      
      // Start the timer for wolf's turn
      startTimer(120, () => {
        // Auto-submit the current ranking when time runs out
        submitWolfRanking();
      });
    } else {
      setMessages(prev => [...prev, { 
        type: 'wolf_notification', 
        content: `${data.wolf_id} is the wolf for this round. Waiting for their ranking...` 
      }]);
    }
  }, [user.username, players]);
  
  const handleWolfRankingSubmitted = useCallback((data) => {
    // Clear wolf timer if it exists
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setWolfRanking(data.ranking);
    
    setMessages(prev => [...prev, { 
      type: 'wolf_ranking', 
      content: `The wolf has submitted their ranking!` 
    }]);
    
    // If this is from a different round or not immediate transition to pack_ranking,
    // we'll wait for the separate pack_ranker_selected message
    // This ensures we maintain proper flow in case messages arrive out of order
  }, []);
  
  const handlePackRankerSelected = useCallback((data) => {
    setRoundStatus('pack_ranking');
    setPackRankerId(data.pack_ranker_id);
    setIsPackRanker(data.pack_ranker_id === user.username);
    
    // Reset rankable players for pack ranker
    const playersList = players.filter(p => p.username !== wolfId);
    setRankablePlayers(playersList);
    
    if (data.pack_ranker_id === user.username) {
      setMessages(prev => [...prev, { 
        type: 'pack_notification', 
        content: `You have been selected to rank for the pack! You have 2 minutes to submit your ranking.` 
      }]);
      
      // Start the timer for pack ranker's turn
      setTimeLeft(120);
      startTimer(120, () => {
        // Auto-submit the current ranking when time runs out
        submitPackRanking();
      });
    } else {
      setMessages(prev => [...prev, { 
        type: 'pack_notification', 
        content: `${data.pack_ranker_id} is ranking for the pack. Waiting for their ranking...` 
      }]);
    }
  }, [user.username, players, wolfId]);
  
  const handlePackRankingSubmitted = useCallback((data) => {
    // Clear pack timer if it exists
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setPackRanking(data.ranking);
    
    setMessages(prev => [...prev, { 
      type: 'pack_ranking', 
      content: `The pack representative has submitted their ranking!` 
    }]);
    
    // Results should come in a separate message, but we can transition the UI
    // to show we're waiting for results
    setRoundStatus('waiting_results');
  }, []);

  const handleRoundResult = useCallback((data) => {
    setRoundResults({
      wolfRanking: data.wolf_ranking,
      packRanking: data.pack_ranking,
      packScore: data.pack_score,
      totalScore: data.total_score
    });
    
    setRoundStatus('results');
    
    setMessages(prev => [...prev, { 
      type: 'round_result', 
      content: `Round ${data.round_number} results: Pack scored ${data.pack_score} points! Total score: ${data.total_score}` 
    }]);
    
    // Update players with new scores
    if (data.updated_players) {
      setPlayers(data.updated_players);
    }
  }, []);

  // Start a countdown timer
  const startTimer = useCallback((seconds, onComplete) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimeLeft(seconds);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          if (onComplete) onComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, []);

  // Setup and cleanup
  useEffect(() => {
    // Connect to WebSocket
    connectWebSocket();

    // Fetch initial game data
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/game/get-game-state/?room_code=${roomCode}`);
        
        // Update state with data from the response
        setPlayers(response.data.players || []);
        setIsHost(user.username === response.data.host);
        setTotalRounds(response.data.total_rounds || 3);
        setCurrentRound(response.data.current_round || 1);
        setRoundStatus(response.data.round_status || 'waiting');
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game data:', error);
        setError('Failed to load game data. Please refresh the page.');
        setLoading(false);
      }
    };

    fetchGameData();

    // Ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds

    // Cleanup function
    return () => {
      clearInterval(pingInterval);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        // Send player_disconnected message before closing
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ 
            type: 'player_disconnected', 
            player: user.username 
          }));
          
          // Close with normal closure code
          socketRef.current.close(1000);
        }
      }
    };
  }, [roomCode, connectWebSocket, user.username, startTimer]);

  const startRound = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'start_round',
        round_number: currentRound
      }));
      
      setMessages(prev => [...prev, { 
        type: 'system', 
        content: `Starting round ${currentRound}...` 
      }]);
    }
  };

  const submitWolfRanking = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && isWolf) {
      // Convert player objects to just their usernames for ranking
      const ranking = rankablePlayers.map(player => player.username);
      
      socketRef.current.send(JSON.stringify({
        type: 'wolf_ranking',
        ranking: ranking,
        round_number: currentRound
      }));
      
      setMessages(prev => [...prev, { 
        type: 'system', 
        content: 'Your wolf ranking has been submitted!' 
      }]);
    }
  };

  const submitPackRanking = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && isPackRanker) {
      // Convert player objects to just their usernames for ranking
      const ranking = rankablePlayers.map(player => player.username);
      
      socketRef.current.send(JSON.stringify({
        type: 'pack_ranking',
        ranking: ranking,
        round_number: currentRound
      }));
      
      setMessages(prev => [...prev, { 
        type: 'system', 
        content: 'Your pack ranking has been submitted!' 
      }]);
    }
  };

  const returnToLobby = async () => {
    try {
      // Close current connection
      if (socketRef.current) {
        socketRef.current.close(1000);
      }
      
      // Navigate back to the lobby
      navigate(`/lobby/${roomCode}`);
    } catch (error) {
      console.error('Error returning to lobby:', error);
      setError('Failed to return to lobby. Please try again.');
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render different UI based on round status
  const renderGameContent = () => {
    if (loading) {
      return <div className="loading">Loading game data...</div>;
    }
    
    switch (roundStatus) {
      case 'waiting':
        return (
          <div className="waiting-state">
            <h2>Waiting for round to start...</h2>
            {isHost && (
              <div className="host-controls">
                <h3>You are the host</h3>
                <button 
                  className="start-round-btn"
                  onClick={startRound}
                  disabled={!wsConnected}
                >
                  Start Round {currentRound}
                </button>
              </div>
            )}
            <div className="players-list">
              <h3>Players in Game:</h3>
              <ul>
                {players.map((player, index) => (
                  <li key={index}>
                    {player.username} {player.username === user.username ? "(You)" : ""}
                    {player.isHost ? " (Host)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      
      case 'wolf_ranking':
        return (
          <div className="wolf-ranking-state">
            <h2>Round {currentRound} of {totalRounds}</h2>
            <div className="question-box">
              <h3>Question:</h3> 
              <p>{question}</p>
            </div>
            
            {isWolf ? (
              <div className="wolf-interface">
                <h3>You are the Wolf!</h3>
                <div className="timer">Time remaining: {formatTime(timeLeft)}</div>
                <p>Drag and drop players to rank them from best to worst:</p>
                
                <DndProvider backend={HTML5Backend}>
                  <div className="ranking-container">
                    {rankablePlayers.map((player, index) => (
                      <PlayerItem 
                        key={player.username}
                        index={index}
                        player={player}
                        movePlayer={movePlayer}
                      />
                    ))}
                  </div>
                </DndProvider>
                
                <button 
                  className="submit-btn"
                  onClick={submitWolfRanking}
                  disabled={!wsConnected}
                >
                  Submit Wolf Ranking
                </button>
              </div>
            ) : (
              <div className="waiting-for-wolf">
                <h3>Waiting for the Wolf's ranking...</h3>
                <p>The Wolf ({wolfId}) is currently ranking all players.</p>
              </div>
            )}
          </div>
        );
      
      case 'pack_ranking':
        return (
          <div className="pack-ranking-state">
            <h2>Round {currentRound} of {totalRounds}</h2>
            <div className="question-box">
              <h3>Question:</h3> 
              <p>{question}</p>
            </div>
            
            {isPackRanker ? (
              <div className="pack-interface">
                <h3>You are ranking for the Pack!</h3>
                <div className="timer">Time remaining: {formatTime(timeLeft)}</div>
                <p>Try to match the Wolf's ranking - drag and drop players to rank them:</p>
                
                <DndProvider backend={HTML5Backend}>
                  <div className="ranking-container">
                    {rankablePlayers.map((player, index) => (
                      <PlayerItem 
                        key={player.username}
                        index={index}
                        player={player}
                        movePlayer={movePlayer}
                      />
                    ))}
                  </div>
                </DndProvider>
                
                <button 
                  className="submit-btn"
                  onClick={submitPackRanking}
                  disabled={!wsConnected}
                >
                  Submit Pack Ranking
                </button>
              </div>
            ) : (
              <div className="waiting-for-pack">
                <h3>The Wolf has submitted their ranking!</h3>
                <p>{packRankerId} is now ranking for the Pack.</p>
              </div>
            )}
          </div>
        );
        
      case 'waiting_results':
        return (
          <div className="waiting-results-state">
            <h2>Round {currentRound} of {totalRounds}</h2>
            <div className="results-pending">
              <h3>Both rankings submitted!</h3>
              <p>Calculating round results...</p>
              <div className="loading-spinner"></div>
            </div>
          </div>
        );
      
      case 'results':
        return (
          <div className="results-state">
            <h2>Round {currentRound} Results</h2>
            
            <div className="results-grid">
              <div className="wolf-results">
                <h3>Wolf's Ranking:</h3>
                <ol>
                  {roundResults?.wolfRanking.map((player, index) => (
                    <li key={index}>{player}</li>
                  ))}
                </ol>
              </div>
              
              <div className="pack-results">
                <h3>Pack's Ranking:</h3>
                <ol>
                  {roundResults?.packRanking.map((player, index) => (
                    <li key={index}>{player}</li>
                  ))}
                </ol>
              </div>
            </div>
            
            <div className="score-summary">
              <h3>Round Score: {roundResults?.packScore} points</h3>
              <h3>Total Score: {roundResults?.totalScore} points</h3>
            </div>
            
            {isHost && currentRound < totalRounds && (
              <button 
                className="next-round-btn"
                onClick={startRound}
                disabled={!wsConnected}
              >
                Start Round {currentRound + 1}
              </button>
            )}
            
            {currentRound >= totalRounds && (
              <div className="game-over">
                <h2>Game Complete!</h2>
                <button 
                  className="return-lobby-btn"
                  onClick={returnToLobby}
                >
                  Return to Lobby
                </button>
              </div>
            )}
          </div>
        );
      
      default:
        return <div>Unknown round status</div>;
    }
  };

  return (
    <div className="game-play-container">
      <header className="game-header">
        <div className="header-content">
          <div className="game-info">
            <h1>Wolf Game</h1>
            <p>Room Code: <span className="room-code">{roomCode}</span></p>
            <span className={`connection-status ${wsConnected ? 'connected' : 'disconnected'}`}>
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="header-actions">
            <button className="return-btn" onClick={returnToLobby}>
              Return to Lobby
            </button>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="game-main">
        <div className="game-container">
          {error && (
            <div className="error-message">
              {error}
              {!wsConnected && (
                <button 
                  className="reconnect-btn"
                  onClick={() => {
                    reconnectAttemptsRef.current = 0;
                    setError('');
                    connectWebSocket();
                  }}
                >
                  Reconnect
                </button>
              )}
            </div>
          )}
          
          <div className="game-layout">
            {/* Left Panel - Game Content */}
            <div className="game-content">
              {renderGameContent()}
            </div>

            {/* Right Panel - Activity Feed & Players */}
            <div className="game-sidebar">
              {/* Players */}
              <div className="players-panel">
                <div className="panel-header">
                  <h3>Players</h3>
                </div>
                <ul className="players-list">
                  {players.map((player, index) => (
                    <li key={index} className="player-item">
                      <div className="player-info">
                        <p className="player-name">
                          {player.username}
                          {player.username === user.username && " (You)"}
                          {player.isHost && " (Host)"}
                        </p>
                        <p className="player-score">Score: {player.score || 0}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Activity Feed */}
              <div className="activity-panel">
                <div className="panel-header">
                  <h3>Game Activity</h3>
                </div>
                <div className="message-list">
                  {messages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`message ${msg.type}`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="no-messages">Waiting for game events...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GamePlay;