"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameContextType {
  socket: Socket | null;
  gameId: string | null;
  color: 'white' | 'black' | null;
  isConnected: boolean;
  createGame: () => Promise<string>;
  joinGame: (gameId: string) => Promise<string>;
  makeMove: (from: string, to: string, promotion?: string) => Promise<any>;
  getGameState: () => Promise<any>;
  disconnect: () => void;
  opponentDisconnected: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [color, setColor] = useState<'white' | 'black' | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
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

  const createGame = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected to server'));
        return;
      }

      socketRef.current.emit('createGame', (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          setGameId(response.gameId);
          setColor(response.color);
          resolve(response.gameId);
        }
      });
    });
  };

  const joinGame = (gameId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Not connected to server'));
        return;
      }

      socketRef.current.emit('joinGame', { gameId }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          setGameId(gameId);
          setColor(response.color);
          resolve(response.color);
        }
      });
    });
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
    }
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        gameId,
        color,
        isConnected,
        createGame,
        joinGame,
        makeMove,
        getGameState,
        disconnect,
        opponentDisconnected,
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