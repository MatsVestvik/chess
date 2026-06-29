"use client";
import { useState, useEffect } from "react";
import { useGame } from "@/app/context/GameContext";
import { useChessGame } from "./hooks/useChessGame";
import { useBoardScale } from "./hooks/useBoardScale";
import { useMoveAnimation } from "./hooks/useMoveAnimation";
import { ChessBoard } from "./ChessBoard";
import { BoardControls } from "./BoardControls";
import { BOARD_SIZE_SCALE_CONST } from "./utils/boardUtils";

interface MultiplayerChessBoardProps {
  onBackToLobby: () => void;
}

export default function MultiplayerChessBoard({ onBackToLobby }: MultiplayerChessBoardProps) {
  const { color, opponentDisconnected, leaveQueue } = useGame();
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
  } = useChessGame(chessColor);

  const { animatingMove, animationProgress } = useMoveAnimation();
  const { scale, boardSize, squareSize, borderSize, pieceSize } = useBoardScale(
    BOARD_SIZE_SCALE_CONST
  );

  // Auto-flip when game starts (if playing as black)
  useEffect(() => {
    if (color === 'black' && !flipped) {
      setFlipped(true);
    }
  }, [color]); // Remove flipped from dependencies to avoid loop

  const handleSquareClick = async (rowIndex: number, colIndex: number, square: any) => {
    if (gameOver || !isMyTurn || opponentDisconnected) return;

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const name = files[colIndex] + (8 - rowIndex);

    if (selected === null) {
      if (square) {
        // Use chessColor for comparison (w/b)
        const isMyPiece = (chessColor === 'w' && square.color === 'w') || 
                         (chessColor === 'b' && square.color === 'b');
        if (isMyPiece) {
          setSelected(name);
        }
      }
    } else {
      const result = await handleMove(selected, name);
      if (result) {
        setSelected(null);
      }
    }
  };

  const handleBackToLobby = () => {
    leaveQueue();
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
        onBackToLobby={handleBackToLobby}
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
            transform: `scale(${scale})`,
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
          />
        </div>
      </div>
    </div>
  );
}