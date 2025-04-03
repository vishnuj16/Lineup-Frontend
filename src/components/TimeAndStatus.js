import React from 'react';

import './GamePlay.css'; // Make sure to create this CSS file

// Timer component
export const Timer = ({ timeLeft }) => {
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
export const StatusBanner = ({ roundStatus, isWolf }) => {
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

// export default { Timer, StatusBanner };