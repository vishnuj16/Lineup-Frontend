import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GameLobby({ user, roomData, onLogout, onLeaveLobby }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState(roomData?.current_players || []);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState({});
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  useEffect(() => {
    setIsHost(roomInfo.host == user.username);
  }, [roomInfo, user.username]);

  const getRoomData = async() => {
    try {
      const response = await axios.get(`http://localhost:8000/api/game/get-room-details/?room_code=${roomCode}`);
      setRoomInfo(response.data);
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  }
  
  // Establish the WebSocket connection with reconnection logic
  const connectWebSocket = useCallback(() => {
    if (!roomCode || !user?.username) return;
    
    const token = localStorage.getItem('access_token');
    const wsURL = `ws://localhost:8000/ws/lobby/${roomCode}/?token=${token}`;
    
    // Clean up any existing connection
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
      return;
    }
    
    const socket = new WebSocket(wsURL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setWsConnected(true);
      reconnectAttemptsRef.current = 0;
      setMessages(prev => [...prev, { type: 'system', content: 'Connected to game lobby' }]);
      
      // Send player_joined message when connection is established
      socket.send(JSON.stringify({ 
        type: 'player_joined', 
        player: user.id 
      }));

      getRoomData();
      setIsHost(roomInfo.host == user.username);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        switch (data.type) {
          case 'player_joined':
            handlePlayerJoined(data.player);
            break;
          case 'player_left':
            handlePlayerLeft(data.player);
            break;
          case 'game_start':
            handleGameStart(data);
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
      console.log('WebSocket connection closed', event);
      setWsConnected(false);
      setMessages(prev => [...prev, { type: 'system', content: 'Disconnected from game lobby' }]);
      
      // Attempt to reconnect if not closed intentionally (code 1000) and not redirecting to game
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
      console.error('WebSocket error:', error);
      setMessages(prev => [...prev, { type: 'error', content: 'Error connecting to game lobby' }]);
    };
  }, [roomCode, user?.username]);

  // WebSocket message handlers
  const handlePlayerJoined = useCallback((playerName) => {
    setPlayers(prevPlayers => {
        const playerExists = prevPlayers.some(p => p.user__username === playerName);
        if (!playerExists) {
            setMessages(prev => [...prev, { 
                type: 'player_joined', 
                content: `${playerName} has joined the game` 
              }]);
          return [...prevPlayers, { user__username: playerName }];
        }
        return prevPlayers;
      });
  }, []);

  const handlePlayerLeft = useCallback((playerName) => {
    setMessages(prev => [...prev, { 
      type: 'player_left', 
      content: `${playerName} has left the game` 
    }]);
    
    setPlayers(prevPlayers => prevPlayers.filter(p => p.user__username !== playerName));
  }, []);

  const handleGameStart = useCallback((data) => {
    setMessages(prev => [...prev, { 
      type: 'game_start', 
      content: data.message || 'Game is starting!' 
    }]);
    
    // Close the current WebSocket connection with normal closure code
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close(1000);
    }
    
    // Navigate to game screen
    navigate(`/game/${roomCode}`);
  }, [navigate, roomCode]);

  // Setup and cleanup
  useEffect(() => {
    if (!roomData && roomCode) {
      // If we don't have room data but have a room code, navigate back to start
      navigate('/start');
      return;
    }

    // Check if current user is the host
    if (roomData) {
      setIsHost(roomInfo.host == user.username);
      console.log('Is Host:', isHost, roomInfo.host, user.username);
      
      // Initialize players from roomData if available
      if (roomData.current_players) {
        setPlayers(roomData.current_players);
      }
    }

    // Connect to WebSocket
    connectWebSocket();

    // Ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds

    // Cleanup function
    return () => {
      clearInterval(pingInterval);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        // Send player_left message before closing
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ 
            type: 'player_left', 
            player: user.username 
          }));
          
          // Close with normal closure code
          socketRef.current.close(1000);
        }
      }
    };
  }, [roomData, roomCode, navigate, user, connectWebSocket]);

  const handleStartGame = async () => {
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/api/game/start-game/', { room_code: roomCode });
      
      // Send WebSocket message to notify all clients
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ 
          type: 'game_start',
          message: 'The host has started the game!'
        }));
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    setLoading(true);

    try {
      // Send WebSocket message before API call
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ 
          type: 'player_left', 
          player: user.username 
        }));
      }
      
      await axios.post('http://localhost:8000/api/game/leave-room/', { room_code: roomCode });
      onLeaveLobby();
      navigate('/start');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to leave room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header>
        <div>
          <div>
            <h1>Game Lobby</h1>
            <p>Room: {roomData?.room_name} (Code: {roomCode})</p>
            {wsConnected ? (
              <span style={{ color: 'green' }}>Connected</span>
            ) : (
              <span style={{ color: 'red' }}>Disconnected</span>
            )}
          </div>
          <div>
            <button
              onClick={handleLeaveRoom}
              disabled={loading}
            >
              Leave Room
            </button>
            <button
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>
        <div>
          <div>
            {error && (
              <div style={{ color: 'red', margin: '10px 0' }}>
                {error}
                {!wsConnected && (
                  <button 
                    onClick={() => {
                      reconnectAttemptsRef.current = 0;
                      setError('');
                      connectWebSocket();
                    }}
                    style={{ marginLeft: '10px' }}
                  >
                    Reconnect
                  </button>
                )}
              </div>
            )}

            <div>
              {/* Left Panel - Player List */}
              <div>
                <div>
                  <h3>
                    Players ({players.length}/{roomData?.max_players || 10})
                  </h3>
                </div>
                <ul>
                  {players.map((player, index) => (
                    <li key={index}>
                      <div>
                        <p>
                            
                          {player.user__username }
                          {player.user__username === user.username && " (You)"}
                          {isHost && player.user__username === user.username && <strong> Host</strong>}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Panel - Activity Feed & Controls */}
              <div>
                {/* Activity Feed */}
                <div>
                  <div>
                    <h3>
                      Lobby Activity
                    </h3>
                  </div>
                  <div>
                    {messages.map((msg, index) => (
                      <div 
                        key={index}
                        style={{
                          color: msg.type === 'error' ? 'red' : 
                                 msg.type === 'player_joined' ? 'green' : 
                                 msg.type === 'player_left' ? 'orange' : 
                                 msg.type === 'game_start' ? 'blue' : 'black'
                        }}
                      >
                        {msg.content}
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <p>
                        Waiting for activity...
                      </p>
                    )}
                  </div>
                </div>

                {/* Game Controls */}
                <div>
                  <div>
                    <h3>
                      Game Controls
                    </h3>
                  </div>
                  <div>
                    {isHost ? (
                      <>
                        <p>
                          As the host, you can start the game when all players are ready.
                        </p>
                        <button
                          onClick={handleStartGame}
                          disabled={loading || players.length < 2 || !wsConnected}
                        >
                          {loading ? 'Starting Game...' : 'Start Game'}
                        </button>
                        {players.length < 2 && (
                          <p>
                            At least 2 players are required to start the game
                          </p>
                        )}
                        {!wsConnected && (
                          <p style={{ color: 'red' }}>
                            Cannot start game while disconnected
                          </p>
                        )}
                      </>
                    ) : (
                      <p>
                        Waiting for the host to start the game...
                      </p>
                    )}
                  </div>
                </div>

                {/* Room Info */}
                <div>
                  <div>
                    <h3>
                      Room Information
                    </h3>
                  </div>
                  <div>
                    <p>
                      <span>Room Name:</span> {roomData?.room_name}
                    </p>
                    <p>
                      <span>Room Code:</span> {roomCode}
                    </p>
                    <p>
                      <span>Max Players:</span> {roomData?.max_players || 10}
                    </p>
                    <p>
                      <span>Share this code with friends:</span>
                    </p>
                    <div>
                      {roomCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GameLobby;