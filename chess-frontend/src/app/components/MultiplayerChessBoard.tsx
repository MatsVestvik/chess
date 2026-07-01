"use client";
import { useState, useEffect } from "react";
import { useGame } from "@/app/context/GameContext";
import { useChessGame } from "./hooks/useChessGame";
import { useBoardScale } from "./hooks/useBoardScale";
import { useMoveAnimation } from "./hooks/useMoveAnimation";
import { ChessBoard } from "./ChessBoard";
import { BoardControls } from "./BoardControls";
import { BOARD_SIZE_SCALE_CONST } from "./utils/boardUtils";
import { Square } from "chess.js"; // Import Square type from chess.js

interface MultiplayerChessBoardProps {
  onBackToLobby: () => void;
}

export default function MultiplayerChessBoard({ onBackToLobby }: MultiplayerChessBoardProps) {
  const { color, opponentDisconnected, leaveGame } = useGame();
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Convert color to chess.js format (w/b) if needed
  const chessColor = color === 'white' ? 'w' : color === 'black' ? 'b' : null;
  
  const {
    board,
    isMyTurn,
    gameOver,
    gameOverMessage,
    handleMove,
    subscribeToMoves,
    chessRef, // Add this
  } = useChessGame(chessColor);

  const { animatingMove, animationProgress, startAnimation } = useMoveAnimation();
  const { scale, boardSize, squareSize, borderSize, pieceSize } = useBoardScale(
    BOARD_SIZE_SCALE_CONST
  );

  // Auto-flip when game starts (if playing as black)
  useEffect(() => {
    if (color === 'black' && !flipped) {
      setFlipped(true);
    }
  }, [color]);

  // Subscribe to move events for animation
  useEffect(() => {
    const handleMoveComplete = (moveData: { from: string; to: string; piece: { color: 'w' | 'b'; type: string } }) => {
      if (moveData) {
        startAnimation(moveData);
      }
    };

    // Subscribe to move events from the chess game
    const unsubscribe = subscribeToMoves(handleMoveComplete);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [startAnimation, subscribeToMoves]);

  const handleSquareClick = async (rowIndex: number, colIndex: number, square: any) => {
    if (gameOver || !isMyTurn || opponentDisconnected) return;

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const name = files[colIndex] + (8 - rowIndex);

    if (selected === null) {
      // Select a piece
      if (square) {
        // Use chessColor for comparison (w/b)
        const isMyPiece = (chessColor === 'w' && square.color === 'w') || 
                         (chessColor === 'b' && square.color === 'b');
        if (isMyPiece) {
          setSelected(name);
        }
      }
    } else {
      // If clicking on the same square, deselect
      if (selected === name) {
        setSelected(null);
        return;
      }

      // If clicking on another of your own pieces, switch selection
      if (square) {
        const isMyPiece = (chessColor === 'w' && square.color === 'w') || 
                         (chessColor === 'b' && square.color === 'b');
        if (isMyPiece) {
          setSelected(name);
          return;
        }
      }

      // Validate the move locally before sending to server
      const chess = chessRef.current;
      if (!chess) {
        setSelected(null);
        return;
      }

      // Check if the move is valid - convert to Square type
      const fromSquare = selected as Square;
      const toSquare = name as Square;
      
      // Get all moves for the selected square
      const moves = chess.moves({ square: fromSquare, verbose: true });
      const isValidMove = moves.some(move => move.to === toSquare);
      
      if (!isValidMove) {
        // Invalid move - just deselect
        setSelected(null);
        return;
      }

      // Valid move - proceed
      const fromRow = 8 - parseInt(selected[1]);
      const fromCol = selected.charCodeAt(0) - 97;
      const fromSquareData = board[fromRow]?.[fromCol];
      const piece = fromSquareData ? { color: fromSquareData.color, type: fromSquareData.type } : null;
      
      try {
        const result = await handleMove(selected, name);
        if (result && piece) {
          // Start animation when move is successful
          startAnimation({
            from: selected,
            to: name,
            piece: piece
          });
          setSelected(null);
        } else {
          setSelected(null);
        }
      } catch (error) {
        // If there's still an error, just deselect
        console.log('Move error:', error);
        setSelected(null);
      }
    }
  };

  const handleHome = () => {
    leaveGame();
    onBackToLobby();
  };

  const handleFlipBoard = () => {
    setFlipped(!flipped);
  };

  // Convert color to display format (for UI)
  const displayColor = color === 'white' ? 'white' : color === 'black' ? 'black' : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
        background: "#1a1a2e",
        margin: 0,
        padding: 0,
        cursor: "default",
        userSelect: "none",
      }}
    >
      <BoardControls
        onBackToLobby={handleHome}
        onFlipBoard={handleFlipBoard}
        isFlipped={flipped}
        gameOver={gameOver}
        gameOverMessage={gameOverMessage}
        opponentDisconnected={opponentDisconnected}
        isMyTurn={isMyTurn}
        color={displayColor}
      />

      <div style={{ width: boardSize, height: boardSize, overflow: "hidden" }}>
        <div
          style={{
            width: boardSize,
            height: boardSize,
            transformOrigin: "top left",
          }}
        >
          <ChessBoard
            board={board}
            selectedSquare={selected}
            onSquareClick={(row, col) => {
              const square = board[row]?.[col];
              handleSquareClick(row, col, square);
            }}
            animatingMove={animatingMove}
            animationProgress={animationProgress}
            isMyTurn={isMyTurn}
            gameOver={gameOver}
            opponentDisconnected={opponentDisconnected}
            flipped={flipped}
            boardSize={boardSize}
            squareSize={squareSize}
            borderSize={borderSize}
            pieceSize={pieceSize}
            boardImage={flipped ? '/assets/boards/boarderlessblackboard.png' : '/assets/boards/boarderlesswhiteboard.png'}
          />
        </div>
      </div>
    </div>
  );
}