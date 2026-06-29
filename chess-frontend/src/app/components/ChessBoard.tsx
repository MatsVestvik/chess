import { useState, useMemo } from 'react';
import { ChessSquare } from './ChessSquare';
import { MoveAnimation } from './MoveAnimation';
import { getSquareName } from '@/app/components/utils/boardUtils';

// Add this interface
interface MoveData {
  from: string;
  to: string;
  piece: {
    color: 'w' | 'b';
    type: string;
  };
}

interface ChessBoardProps {
  board: any[][];
  selectedSquare: string | null;
  onSquareClick: (row: number, col: number) => void;
  animatingMove: MoveData | null;
  animationProgress: number;
  isMyTurn: boolean;
  gameOver: boolean;
  opponentDisconnected: boolean;
  flipped: boolean;
  boardSize: number;
  squareSize: number;
  borderSize: number;
  pieceSize: number;
}

export function ChessBoard({
  board,
  selectedSquare,
  onSquareClick,
  animatingMove,
  animationProgress,
  isMyTurn,
  gameOver,
  opponentDisconnected,
  flipped,
  boardSize,
  squareSize,
  borderSize,
  pieceSize,
}: ChessBoardProps) {
  // Create board rows with flip support
  const boardRows = useMemo(() => {
    const rows = [...board];
    if (flipped) {
      rows.reverse();
      return rows.map(row => [...row].reverse());
    }
    return rows;
  }, [board, flipped]);

  return (
    <div
      style={{
        width: boardSize,
        height: boardSize,
        backgroundImage: "url('/assets/boards/board.png')",
        backgroundSize: `${boardSize}px ${boardSize}px`,
        backgroundPosition: "0 0",
        display: "grid",
        gridTemplateColumns: `repeat(8, ${squareSize}px)`,
        gap: 0,
        padding: `${borderSize}px`,
        boxSizing: "border-box",
        imageRendering: "pixelated",
        position: "relative",
      }}
    >
      {boardRows.map((row: any, rowIndex: number) => {
        const actualRow = flipped ? 7 - rowIndex : rowIndex;
        return row.map((square: any, colIndex: number) => {
          const actualCol = flipped ? 7 - colIndex : colIndex;
          const squareName = getSquareName(actualRow, actualCol);
          const isSelected = selectedSquare === squareName;
          const isAnimatingFrom = animatingMove?.from === squareName;
          const isAnimatingTo = animatingMove?.to === squareName;

          return (
            <ChessSquare
              key={`${rowIndex}-${colIndex}`}
              square={square}
              rowIndex={actualRow}
              colIndex={actualCol}
              isSelected={isSelected}
              isAnimatingFrom={isAnimatingFrom}
              isAnimatingTo={isAnimatingTo}
              onClick={onSquareClick}
              isMyTurn={isMyTurn}
              gameOver={gameOver}
              opponentDisconnected={opponentDisconnected}
              squareSize={squareSize}
              pieceSize={pieceSize}
            />
          );
        });
      })}

      {animatingMove && (
        <MoveAnimation
          move={animatingMove}
          progress={animationProgress}
          pieceSize={pieceSize}
          squareSize={squareSize}
          borderSize={borderSize}
          flipped={flipped}
        />
      )}
    </div>
  );
}