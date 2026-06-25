"use client";
import { useState } from 'react';
import { useGame } from '@/app/context/GameContext';

interface LobbyProps {
  onGameReady: () => void;
}

export default function Lobby({ onGameReady }: LobbyProps) {
  const { createGame, joinGame, isConnected, gameId } = useGame();
  const [joinGameId, setJoinGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    setLoading(true);
    setError('');
    try {
      await createGame();
      onGameReady();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinGameId.trim()) {
      setError('Please enter a game ID');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await joinGame(joinGameId.trim());
      onGameReady();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      <h1 style={{ fontSize: '36px' }}>♛ Multiplayer Chess</h1>
      
      <div style={{ color: isConnected ? '#4CAF50' : '#f44336', fontSize: '14px' }}>
        {isConnected ? '● Connected' : '● Disconnected'}
      </div>

      {error && (
        <div style={{ color: '#f44336', fontSize: '14px', marginTop: '10px' }}>
          {error}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          width: '300px',
        }}
      >
        <button
          onClick={handleCreateGame}
          disabled={loading || !isConnected}
          style={{
            padding: '16px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #f7971e, #ffd200)',
            border: '2px solid transparent',
            borderRadius: '8px',
            cursor: loading || !isConnected ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
            fontFamily: "'ManaSPC', 'Courier New', monospace",
            opacity: loading || !isConnected ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading && isConnected) {
              e.currentTarget.style.borderColor = 'white';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {loading ? 'Creating...' : 'Create New Game'}
        </button>

        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>OR</div>

        <input
          type="text"
          placeholder="Enter Game ID"
          value={joinGameId}
          onChange={(e) => setJoinGameId(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: 'white',
            fontFamily: "'ManaSPC', 'Courier New', monospace",
            textAlign: 'center',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleJoinGame();
            }
          }}
        />

        <button
          onClick={handleJoinGame}
          disabled={loading || !isConnected || !joinGameId.trim()}
          style={{
            padding: '16px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            cursor: loading || !isConnected || !joinGameId.trim() ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
            fontFamily: "'ManaSPC', 'Courier New', monospace",
            opacity: loading || !isConnected || !joinGameId.trim() ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading && isConnected && joinGameId.trim()) {
              e.currentTarget.style.borderColor = '#f7971e';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {loading ? 'Joining...' : 'Join Game'}
        </button>

        {gameId && (
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            Game ID: {gameId}
          </div>
        )}
      </div>
    </div>
  );
}