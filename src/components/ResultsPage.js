import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResultsPage.css'; // We'll create this file next

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { statistics, roomCode } = location.state || {};

  // Redirect if no statistics are available
  if (!statistics) {
    return (
      <div className="results-fallback">
        <h2>No game results available</h2>
        <button className="return-button" onClick={() => navigate('/lobby')}>
          Return to Lobby
        </button>
      </div>
    );
  }

  const { players, round_data, winners, total_rounds } = statistics;

  // Get players sorted by score
  const playersList = Object.entries(players).map(([username, data]) => ({
    username,
    ...data
  })).sort((a, b) => b.total_score - a.total_score);

  return (
    <div className="results-page">
      <div className="results-container">
        <h1 className="results-header">Game Results</h1>
        <div className="room-info">Room: {roomCode}</div>

        {/* Winners Section */}
        <div className="winners-section">
          <h2 className="section-title">
            {winners.length > 1 ? 'Winners' : 'Winner'}
          </h2>
          <div className="winners-display">
            {winners.map((winner, index) => (
              <div key={index} className="winner-card">
                <div className="winner-trophy">🏆</div>
                <div className="winner-name">{winner}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Rankings */}
        <div className="player-rankings">
          <h2 className="section-title">Player Rankings</h2>
          <div className="rankings-table">
            <div className="rankings-header">
              <div className="rank-cell">Rank</div>
              <div className="player-cell">Player</div>
              <div className="score-cell">Score</div>
              <div className="wolf-rounds-cell">Rounds as Wolf</div>
            </div>
            {playersList.map((player, index) => (
              <div 
                key={player.username} 
                className={`rankings-row ${winners.includes(player.username) ? 'winner-row' : ''}`}
              >
                <div className="rank-cell">{index + 1}</div>
                <div className="player-cell">{player.username}</div>
                <div className="score-cell">{player.total_score}</div>
                <div className="wolf-rounds-cell">{player.rounds_as_wolf}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Round Details */}
        <div className="round-details">
          <h2 className="section-title">Round Details</h2>
          <div className="rounds-container">
            {round_data.map((round, index) => (
              <div key={index} className="round-card">
                <h3 className="round-title">Round {round.round_number}</h3>
                <p className="round-question">{round.question}</p>
                <div className="round-wolf">Wolf: {round.wolf}</div>
                <div className="round-score">Pack Score: {round.scores}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="results-navigation">
          <button 
            className="play-again-button"
            onClick={() => navigate(`/game/${roomCode}`)}
          >
            Play Again
          </button>
          <button 
            className="return-lobby-button"
            onClick={() => navigate('/lobby')}
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;