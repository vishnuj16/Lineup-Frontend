
// App.js - Main component with routing
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import StartPage from './components/StartPage';
import GameLobby from './components/GameLobby';
import Gameplay from './components/GamePlay';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    // Check if user is authenticated on load
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      const userData = JSON.parse(localStorage.getItem('user_data'));
      setUser(userData);
    }
    setLoading(false);
  }, []);

  // Set axios default headers with token
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [isAuthenticated]);

  const handleLogin = (userData, tokens) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await axios.post('/api/logout/', { refresh: refreshToken });
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setIsAuthenticated(false);
      setRoomData(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRoomCreated = (data) => {
    setRoomData(data);
  };

  const handleRoomJoined = (data) => {
    setRoomData(data);
  };

  const handleLeaveLobby = () => {
    setRoomData(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/start" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/start" /> : <Register />} 
          />
          <Route 
            path="/start" 
            element={
              isAuthenticated ? (
                roomData ? 
                <Navigate to={`/lobby/${roomData.room_code}`} /> : 
                <StartPage 
                  user={user} 
                  onLogout={handleLogout}
                  onRoomCreated={handleRoomCreated}
                  onRoomJoined={handleRoomJoined}
                />
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/lobby/:roomCode" 
            element={
              isAuthenticated ? (
                roomData ? 
                <GameLobby 
                  user={user} 
                  roomData={roomData}
                  onLogout={handleLogout}
                  onLeaveLobby={handleLeaveLobby}
                /> : 
                <Navigate to="/start" />
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/game/:roomCode" 
            element={isAuthenticated ? (
              roomData ? 
              <Gameplay 
                user={user} 
                roomData={roomData}
                onLogout={handleLogout}
                onLeaveLobby={handleLeaveLobby}
              /> : 
              <Navigate to="/start" />
            ) : <Navigate to="/login" />} 
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/start" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;