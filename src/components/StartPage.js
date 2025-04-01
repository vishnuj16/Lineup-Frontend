import React, { useState } from 'react';
import axios from 'axios';

function StartPage({ user, onLogout, onRoomCreated, onRoomJoined }) {
  const [createRoomFormData, setCreateRoomFormData] = useState({
    name: '',
    max_players: 10
  });
  const [joinRoomFormData, setJoinRoomFormData] = useState({
    room_code: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoomChange = (e) => {
    setCreateRoomFormData({
      ...createRoomFormData,
      [e.target.name]: e.target.name === 'max_players' ? parseInt(e.target.value) : e.target.value
    });
  };

  const handleJoinRoomChange = (e) => {
    setJoinRoomFormData({
      ...joinRoomFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/game/create-room/', createRoomFormData);
      onRoomCreated(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/game/join-room/', joinRoomFormData);
      onRoomJoined(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setShowJoinForm(false);
    setError('');
  };

  const toggleJoinForm = () => {
    setShowJoinForm(!showJoinForm);
    setShowCreateForm(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Wolf Game</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-600">Welcome, {user?.username}</span>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a New Game</h2>
                  <p className="text-gray-600 mb-4">Start your own Wolf Game and invite friends to join with your room code.</p>
                  
                  {!showCreateForm ? (
                    <button 
                      onClick={toggleCreateForm}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition-colors"
                    >
                      Create Game
                    </button>
                  ) : (
                    <form onSubmit={handleCreateRoom} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                          Room Name
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          type="text"
                          id="name"
                          name="name"
                          value={createRoomFormData.name}
                          onChange={handleCreateRoomChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="max_players">
                          Max Players (2-10)
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          type="number"
                          id="max_players"
                          name="max_players"
                          min="2"
                          max="10"
                          value={createRoomFormData.max_players}
                          onChange={handleCreateRoomChange}
                          required
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
                        >
                          {loading ? 'Creating...' : 'Create Room'}
                        </button>
                        <button
                          type="button"
                          onClick={toggleCreateForm}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              
              <div className="flex-1 bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Join Existing Game</h2>
                  <p className="text-gray-600 mb-4">Join a Wolf Game using the room code provided by the host.</p>
                  
                  {!showJoinForm ? (
                    <button 
                      onClick={toggleJoinForm}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-colors"
                    >
                      Join Game
                    </button>
                  ) : (
                    <form onSubmit={handleJoinRoom} className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="room_code">
                          Room Code
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                          type="text"
                          id="room_code"
                          name="room_code"
                          value={joinRoomFormData.room_code}
                          onChange={handleJoinRoomChange}
                          required
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
                        >
                          {loading ? 'Joining...' : 'Join Room'}
                        </button>
                        <button
                          type="button"
                          onClick={toggleJoinForm}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
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

export default StartPage;