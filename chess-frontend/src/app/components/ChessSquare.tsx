import { ChessPiece } from './ChessPiece';

interface ChessSquareProps {
  square: any;
  rowIndex: number;
  colIndex: number;
  isSelected: boolean;
  isAnimatingFrom: boolean;
  isAnimatingTo: boolean;
  onClick: (row: number, col: number, square: any) => void;
  isMyTurn: boolean;
  gameOver: boolean;
  opponentDisconnected: boolean;
  squareSize: number;
  pieceSize: number;
}

export function ChessSquare({
  square,
  rowIndex,
  colIndex,
  isSelected,
  isAnimatingFrom,
  isAnimatingTo,
  onClick,
  isMyTurn,
  gameOver,
  opponentDisconnected,
  squareSize,
  pieceSize,
}: ChessSquareProps) {
  const isClickable = isMyTurn && !gameOver && !opponentDisconnected;
  const isValidTarget = false; // Would need move generation logic

  return (
    <div
      onClick={() => onClick(rowIndex, colIndex, square)}
      style={{
        width: squareSize,
        height: squareSize,
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        cursor: isClickable ? "pointer" : "default",
        outline: isSelected ? "3px solid yellow" : isValidTarget ? "3px solid #4CAF50" : "none",
        outlineOffset: "-3px",
        position: "relative",
      }}
    >
      {/* Move target indicator - rendered as a separate element */}
      {isValidTarget && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: squareSize * 0.25,
            height: squareSize * 0.25,
            borderRadius: "50%",
            background: "rgba(0, 255, 0, 0.3)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
      )}

      {square && !isAnimatingFrom && !isAnimatingTo && (
        <ChessPiece
          piece={square}
          isSelected={isSelected}
          pieceSize={pieceSize}
          squareSize={squareSize}
        />
      )}
    </div>
  );
}