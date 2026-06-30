import { getPieceStyle } from "@/app/lib/pieces";

interface ChessPieceProps {
  piece: {
    color: 'w' | 'b';
    type: string;
  };
  isSelected: boolean;
  pieceSize: number;
  squareSize: number;
}

export function ChessPiece({ piece, isSelected, pieceSize, squareSize }: ChessPieceProps) {
  // Calculate offset based on piece size and square size
  const verticalOffset = -pieceSize * 0.15; // 15% of piece size above the square
  
  return (
    <div
      style={{
        position: "relative",
        width: pieceSize,
        height: pieceSize,
        transform: isSelected 
          ? `translateY(${verticalOffset - 15}px)` 
          : `translateY(${verticalOffset}px)`,
        transition: "transform 0.2s ease-out",
      }}
    >
      {/* Shadow layer */}
      <div
        style={{
          ...getPieceStyle(piece, "/assets/shadows/shadows.png", pieceSize),
          position: "absolute",
          top: 0,
          left: 0,
          transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
          transform: isSelected ? "translate(-8px, -8px)" : "translate(0, 0)",
          opacity: isSelected ? 0.5 : 1,
          pointerEvents: "none",
        }}
      />
      
      {/* Piece layer */}
      <div
        style={{
          ...getPieceStyle(piece, "/assets/pieces/pieces.png", pieceSize),
          position: "relative",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}