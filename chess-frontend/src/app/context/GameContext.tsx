"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameContextType {
  socket: Socket | null;
  gameId: string | null;
  color: 'white' | 'black' | null;
  isConnected: boolean;
  isWaiting: boolean;
  queuePosition: number;
  joinQueue: () => void;
  leaveQueue: () => void;
  makeMove: (from: string, to: string, promotion?: string) => Promise<any>;
  getGameState: () => Promise<any>;
  disconnect: () => void;
  opponentDisconnected: boolean;
  gameMatched: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [color, setColor] = useState<'white' | 'black' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [gameMatched, setGameMatched] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setOpponentDisconnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setIsWaiting(false);
    });

    newSocket.on('queueStatus', (data) => {
      console.log('Queue status:', data);
      setQueuePosition(data.position);
    });

    newSocket.on('gameMatched', (data) => {
      console.log('Game matched!', data);
      setGameId(data.gameId);
      setColor(data.color);
      setGameMatched(true);
      setIsWaiting(false);
      setQueuePosition(0);
    });

    newSocket.on('opponentDisconnected', (data) => {
      console.log('Opponent disconnected:', data.message);
      setOpponentDisconnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinQueue = () => {
    if (!socketRef.current || !isConnected) return;
    setIsWaiting(true);
    setGameMatched(false);
    socketRef.current.emit('joinQueue');
  };

  const leaveQueue = () => {
    if (!socketRef.current) return;
    setIsWaiting(false);
    setQueuePosition(0);
    socketRef.current.emit('leaveQueue');
  };

  const makeMove = (from: string, to: string, promotion?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !gameId) {
        reject(new Error('Not connected to a game'));
        return;
      }

      socketRef.current.emit('makeMove', { gameId, from, to, promotion }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  };

  const getGameState = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !gameId) {
        reject(new Error('Not connected to a game'));
        return;
      }

      socketRef.current.emit('getGameState', { gameId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
      setIsWaiting(false);
      setGameMatched(false);
    }
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        gameId,
        color,
        isConnected,
        isWaiting,
        queuePosition,
        joinQueue,
        leaveQueue,
        makeMove,
        getGameState,
        disconnect,
        opponentDisconnected,
        gameMatched,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}