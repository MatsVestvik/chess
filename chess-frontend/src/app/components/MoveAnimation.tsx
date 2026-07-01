import { getPieceStyle } from "@/app/lib/pieces";
import { getSquareCoords } from "@/app/components/utils/boardUtils";

interface MoveData {
  from: string;
  to: string;
  piece: {
    color: 'w' | 'b';
    type: string;
  };
}

interface MoveAnimationProps {
  move: MoveData;
  progress: number;
  pieceSize: number;
  squareSize: number;
  borderSize: number;
  flipped: boolean;
}

export function MoveAnimation({
  move,
  progress,
  pieceSize,
  squareSize,
  borderSize,
  flipped,
}: MoveAnimationProps) {
  // Get coordinates with flip support
  let fromCoords = getSquareCoords(move.from, borderSize, squareSize);
  let toCoords = getSquareCoords(move.to, borderSize, squareSize);
  
  // Adjust for flipped board
  if (flipped) {
    const maxX = borderSize * 2 + squareSize * 8;
    const maxY = borderSize * 2 + squareSize * 8;
    fromCoords = {
      x: maxX - fromCoords.x,
      y: maxY - fromCoords.y,
    };
    toCoords = {
      x: maxX - toCoords.x,
      y: maxY - toCoords.y,
    };
  }

  // Calculate interpolated position
  const x = fromCoords.x + (toCoords.x - fromCoords.x) * progress;
  const y = fromCoords.y + (toCoords.y - fromCoords.y) * progress;

  // Animation easing for vertical movement (arc effect)
  const descentStart = 0.9;
  let currentYOffset = -30; // Start 30px above the board

  if (progress > descentStart) {
    const descentProgress = (progress - descentStart) / (1 - descentStart);
    const easedDescent = 1 - Math.pow(1 - descentProgress, 2);
    currentYOffset = -30 + 15 * easedDescent; // Settle 15px above board
  }

  // Shadow animation
  let shadowOpacity = 0.5;
  let shadowOffsetX = -8;
  let shadowOffsetY = -8;

  if (progress > descentStart) {
    const descentProgress = (progress - descentStart) / (1 - descentStart);
    const easedDescent = 1 - Math.pow(1 - descentProgress, 2);
    shadowOpacity = 0.5 + 0.5 * easedDescent;
    shadowOffsetX = -8 * (1 - easedDescent);
    shadowOffsetY = -8 * (1 - easedDescent);
  }

  // Trail effect - show multiple positions with fading
  const trailPositions = [];
  const trailCount = 3;
  for (let i = 1; i <= trailCount; i++) {
    const trailProgress = Math.max(0, progress - i * 0.05);
    if (trailProgress > 0 && trailProgress < 1) {
      const trailX = fromCoords.x + (toCoords.x - fromCoords.x) * trailProgress;
      const trailY = fromCoords.y + (toCoords.y - fromCoords.y) * trailProgress;
      trailPositions.push({
        x: trailX,
        y: trailY,
        opacity: 0.3 * (1 - i / trailCount),
      });
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {/* Trail pieces */}
      {trailPositions.map((pos, index) => (
        <div
          key={`trail-${index}`}
          style={{
            position: "absolute",
            left: pos.x - pieceSize / 2,
            top: pos.y - pieceSize / 2 + currentYOffset * 0.5,
            width: pieceSize,
            height: pieceSize,
            opacity: pos.opacity * 0.5,
            transition: "none",
          }}
        >
          <div
            style={{
              ...getPieceStyle(
                { color: move.piece.color, type: move.piece.type },
                "/assets/pieces/pieces.png",
                pieceSize
              ),
              position: "relative",
              zIndex: 1,
              pointerEvents: "none",
              filter: "blur(2px)",
            }}
          />
        </div>
      ))}

      {/* Main animated piece */}
      <div
        style={{
          position: "absolute",
          left: x - pieceSize / 2,
          top: y - pieceSize / 2 + currentYOffset,
          width: pieceSize,
          height: pieceSize,
          transition: "none",
        }}
      >
        {/* Shadow */}
        <div
          style={{
            ...getPieceStyle(
              { color: move.piece.color, type: move.piece.type },
              "/assets/shadows/shadows.png",
              pieceSize
            ),
            position: "absolute",
            top: 0,
            left: 0,
            opacity: shadowOpacity,
            transform: `translate(${shadowOffsetX}px, ${shadowOffsetY}px)`,
            pointerEvents: "none",
          }}
        />
        
        {/* Piece */}
        <div
          style={{
            ...getPieceStyle(
              { color: move.piece.color, type: move.piece.type },
              "/assets/pieces/pieces.png",
              pieceSize
            ),
            position: "relative",
            zIndex: 1,
            pointerEvents: "none",
            filter: progress < 0.3 
              ? "brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.3))" 
              : "none",
            transform: progress < 0.3 
              ? "scale(1.1)" 
              : "scale(1)",
            transition: "none",
          }}
        />
        
        {/* Sparkle effect at the start */}
        {progress < 0.2 && (
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255, 215, 0, 0.8)",
              fontSize: "20px",
              pointerEvents: "none",
            }}
          >
            ✦
          </div>
        )}
      </div>
    </div>
  );
}