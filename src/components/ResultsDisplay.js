import React from 'react';
import './GamePlay.css'; // Make sure to create this CSS file

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

  export default ResultsDisplay;