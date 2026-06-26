"use client";
import { useState, useEffect } from 'react';
import { useGame } from '@/app/context/GameContext';

interface LobbyProps {
  onGameReady: () => void;
}

export default function Lobby({ onGameReady }: LobbyProps) {
  const { 
    isConnected, 
    isWaiting, 
    queuePosition, 
    joinQueue, 
    leaveQueue,
    gameMatched,
    opponentDisconnected
  } = useGame();
  
  const [error, setError] = useState('');

  // Handle game match
  useEffect(() => {
    if (gameMatched) {
      onGameReady();
    }
  }, [gameMatched, onGameReady]);

  const handleJoinQueue = () => {
    setError('');
    joinQueue();
  };

  const handleLeaveQueue = () => {
    leaveQueue();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100vh',
        background: '#1a1a2e',
        color: 'white',
        fontFamily: "'ManaSPC', 'Courier New', monospace",
        gap: '20px',
      }}
    >
      <h1 style={{ fontSize: '48px' }}>Multiplayer Chess</h1>
      
      <div style={{ color: isConnected ? '#4CAF50' : '#f44336', fontSize: '14px' }}>
        {isConnected ? '● Connected' : '● Disconnected'}
      </div>

      {error && (
        <div style={{ color: '#f44336', fontSize: '14px', marginTop: '10px' }}>
          {error}
        </div>
      )}

      {opponentDisconnected && (
        <div style={{ color: '#ffd700', fontSize: '16px', marginTop: '10px' }}>
          ⚠️ Opponent disconnected. Returning to lobby...
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          width: '300px',
          alignItems: 'center',
        }}
      >
        {!isWaiting ? (
          <button
            onClick={handleJoinQueue}
            disabled={!isConnected}
            style={{
              padding: '20px 48px',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              background: !isConnected 
                ? 'rgba(255,255,255,0.1)' 
                :  `rgb(28, 210, 0)`, 
              border: '2px solid transparent',
              borderRadius: '12px',
              cursor: !isConnected ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
              fontFamily: "'ManaSPC', 'Courier New', monospace",
              opacity: !isConnected ? 0.5 : 1,
              boxShadow: isConnected ? '0 4px 20px rgba(247, 151, 30, 0.4)' : 'none',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              if (isConnected) {
                e.currentTarget.style.borderColor = 'white';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 30px rgba(247, 151, 30, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(247, 151, 30, 0.4)';
            }}
          >
            Find Match
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              width: '100%',
            }}
          >
            <div
              style={{
                padding: '20px',
                fontSize: '18px',
                color: '#ffd700',
                textAlign: 'center',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '12px',
                width: '100%',
              }}
            >
              ⏳ Searching for opponent...
              {queuePosition > 0 && (
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                  {queuePosition} player{queuePosition > 1 ? 's' : ''} in queue
                </div>
              )}
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                Looking for another player...
              </div>
            </div>
            
            <button
              onClick={handleLeaveQueue}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                fontFamily: "'ManaSPC', 'Courier New', monospace",
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}