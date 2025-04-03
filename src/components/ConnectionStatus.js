import React from 'react';
import './ConnectionStatus.css'; // Create this CSS file

const ConnectionStatus = ({ status, attempts, maxAttempts }) => {
  // Status can be 'connected', 'connecting', 'disconnected'
  
  const getStatusMessage = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return `Reconnecting (${attempts}/${maxAttempts})`;
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className={`connection-status connection-${status}`}>
      <div className="status-indicator"></div>
      <span className="status-text">{getStatusMessage()}</span>
    </div>
  );
};

export default ConnectionStatus;