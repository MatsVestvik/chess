// hooks/useChessGame.ts
import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { useGame } from '@/app/context/GameContext';

export function useChessGame(color: 'w' | 'b' | null) {
  const { socket, makeMove, getGameState } = useGame();
  const [fen, setFen] = useState("start");
  const [board, setBoard] = useState<any[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const chessRef = useRef(new Chess());
  const moveListenersRef = useRef<((data: any) => void)[]>([]);

  // Function to notify move listeners
  const notifyMoveListeners = (moveData: any) => {
    moveListenersRef.current.forEach(listener => listener(moveData));
  };

  // Update board when FEN changes
  useEffect(() => {
    if (fen === "start") {
      const chess = new Chess();
      chessRef.current = chess;
      setBoard(chess.board());
      if (color) {
        setIsMyTurn(
          (color === 'w' && chess.turn() === 'w') || 
          (color === 'b' && chess.turn() === 'b')
        );
      }
    } else {
      try {
        const chess = new Chess(fen);
        chessRef.current = chess;
        setBoard(chess.board());
        if (color) {
          setIsMyTurn(
            (color === 'w' && chess.turn() === 'w') || 
            (color === 'b' && chess.turn() === 'b')
          );
        }
      } catch (error) {
        console.error('Invalid FEN:', fen);
      }
    }
  }, [fen, color]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleMoveMade = (data: any) => {
      // Extract move data for animation
      const moveData = data.moveData || {
        from: data.from || '',
        to: data.to || '',
        piece: data.piece || { color: color === 'w' ? 'b' : 'w', type: 'p' }
      };
      
      setFen(data.fen);
      notifyMoveListeners(moveData);
      
      if (data.gameOver) {
        setGameOver(true);
        setGameOverMessage(data.gameOverMessage || 'Game Over');
      }
    };

    const handleGameStarted = (data: any) => {
      setFen(data.fen);
      setGameOver(false);
      setGameOverMessage("");
    };

    socket.on('moveMade', handleMoveMade);
    socket.on('gameStarted', handleGameStarted);

    // Get initial game state
    if (color) {
      getGameState().then((state) => {
        if (state) {
          setFen(state.fen);
          setIsMyTurn(
            (color === 'w' && state.turn === 'w') || 
            (color === 'b' && state.turn === 'b')
          );
        }
      }).catch(console.error);
    }

    return () => {
      socket.off('moveMade', handleMoveMade);
      socket.off('gameStarted', handleGameStarted);
    };
  }, [socket, getGameState, color]);

  const handleMove = async (from: string, to: string) => {
    if (!color) return false;
    const result = await makeMove(from, to, 'q');
    return result.success;
  };

  // Subscribe to move events
  const subscribeToMoves = (listener: (data: any) => void) => {
    moveListenersRef.current.push(listener);
    return () => {
      moveListenersRef.current = moveListenersRef.current.filter(l => l !== listener);
    };
  };

  return {
    board,
    fen,
    isMyTurn,
    gameOver,
    gameOverMessage,
    chessRef,
    handleMove,
    setGameOver,
    setGameOverMessage,
    subscribeToMoves, // Add this
  };
}