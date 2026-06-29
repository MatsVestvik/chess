import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface GameState {
  fen: string;
  turn: 'w' | 'b';
  gameOver: boolean
  gameOverMessage?: string;
}

export function useGameSocket(socket: Socket | null, gameId: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  const emitMove = useCallback((from: string, to: string, promotion?: string) => {
    if (!socket || !gameId) return;
    socket.emit('makeMove', { gameId, from, to, promotion });
  }, [socket, gameId]);

  const requestGameState = useCallback(async (): Promise<GameState | null> => {
    if (!socket || !gameId) return null;
    
    return new Promise((resolve) => {
      socket.emit('getGameState', { gameId }, (state: GameState) => {
        setGameState(state);
        resolve(state);
      });
    });
  }, [socket, gameId]);

  return {
    gameState,
    isConnected,
    emitMove,
    requestGameState,
  };
}