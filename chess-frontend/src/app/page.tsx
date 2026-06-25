"use client";
import { Chess } from "chess.js";
import { useState } from "react";
import { useRef } from "react";
import { getPieceStyle } from "@/lib/pieces";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function Home() {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const board = chessRef.current.board();

  const [selected, setSelected] = useState<string | null>(null);
  const [animatingMove, setAnimatingMove] = useState<{
    from: string;
    to: string;
    piece: any;
  } | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Konfigurasjon for brettet ditt
  const BOARD_SIZE_SCALE_CONST = 3;
  const BOARD_IMAGE_SIZE = 202 * BOARD_SIZE_SCALE_CONST;
  const BOARD_SIZE = 184 * BOARD_SIZE_SCALE_CONST;
  const BORDER_SIZE = (BOARD_IMAGE_SIZE - BOARD_SIZE) / 2;
  const SQUARE_SIZE = BOARD_SIZE / 8;
  const PIECE_SIZE = SQUARE_SIZE;

  function squareName(rowIndex: number, colIndex: number): string {
    return files[colIndex] + (8 - rowIndex);
  }

  function getSquareCoords(squareName: string): { x: number; y: number } {
    const col = files.indexOf(squareName[0]);
    const row = 8 - parseInt(squareName[1]);
    return {
      x: BORDER_SIZE + col * SQUARE_SIZE + SQUARE_SIZE / 2,
      y: BORDER_SIZE + row * SQUARE_SIZE + SQUARE_SIZE / 2,
    };
  }

  const handleSquareClick = (rowIndex: number, colIndex: number, square: any) => {
    const name = squareName(rowIndex, colIndex);
    
    if (selected == null) {
      if (square != null) {
        setSelected(name);
      }
    } else {
      try {
        // Try the move first to validate it
        const move = chessRef.current.move({ 
          from: selected, 
          to: name,
          promotion: 'q'
        });
        
        if (move) {
          // Get the piece that was moved
          const piece = move.piece;
          const color = move.color;
          
          // Set up animation
          setAnimatingMove({
            from: selected,
            to: name,
            piece: { color, type: piece }
          });
          setAnimationProgress(0);
          
          // Animate over ~300ms
          const startTime = Date.now();
          const duration = 300;
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setAnimationProgress(progress);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Animation complete
              setAnimatingMove(null);
              setFen(chessRef.current.fen());
            }
          };
          
          requestAnimationFrame(animate);
        }
      } catch (error) {
        console.log("Ugyldig trekk");
      }
      setSelected(null);
    }
  };

  const isSelected = (rowIndex: number, colIndex: number) => {
    return selected === squareName(rowIndex, colIndex);
  };

  return (
    <div 
      style={{
        width: BOARD_IMAGE_SIZE,
        height: BOARD_IMAGE_SIZE,
        backgroundImage: "url('/board.png')",
        backgroundSize: `${BOARD_IMAGE_SIZE}px ${BOARD_IMAGE_SIZE}px`,
        backgroundPosition: "0 0",
        display: "grid",
        gridTemplateColumns: `repeat(8, ${SQUARE_SIZE}px)`,
        gap: 0,
        padding: `${BORDER_SIZE}px`,
        boxSizing: "border-box",
        imageRendering: "pixelated",
        position: "relative",
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => {
          const isDark = (rowIndex + colIndex) % 2 === 1;
          const isPieceSelected = isSelected(rowIndex, colIndex);
          const squareNameStr = squareName(rowIndex, colIndex);

          // Check if this square has a piece that's currently animating
          const isAnimatingFrom = animatingMove?.from === squareNameStr;
          const isAnimatingTo = animatingMove?.to === squareNameStr;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleSquareClick(rowIndex, colIndex, square)}
              style={{
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                cursor: "pointer",
                outline: isPieceSelected ? "3px solid yellow" : "none",
                outlineOffset: "-3px",
                position: "relative",
              }}
            >
              {square && !isAnimatingFrom && !isAnimatingTo && (
                <div style={{ 
                  position: "relative", 
                  width: PIECE_SIZE, 
                  height: PIECE_SIZE,
                  transform: isPieceSelected 
                    ? "translateY(-30px)" 
                    : "translateY(-15px)",
                  transition: "transform 0.2s ease-out",
                }}>
                  {/* Shadow */}
                  <div
                    style={{
                      ...getPieceStyle(square, "/shadows.png"),
                      position: "absolute",
                      top: 0,
                      left: 0,
                      transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
                      transform: isPieceSelected
                        ? "translate(-8px, -8px)" 
                        : "translate(0, 0)",
                      opacity: isPieceSelected ? 0.5 : 1,
                    }}
                  />
                  {/* Piece */}
                  <div
                    style={{
                      ...getPieceStyle(square, "/pieces.png"),
                      position: "relative",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Animated moving piece overlay */}
      {animatingMove && (
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
          {(() => {
            const fromCoords = getSquareCoords(animatingMove.from);
            const toCoords = getSquareCoords(animatingMove.to);
            
            const x = fromCoords.x + (toCoords.x - fromCoords.x) * animationProgress;
            const y = fromCoords.y + (toCoords.y - fromCoords.y) * animationProgress;
            
            // Piece is lifted during animation
            const liftOffset = -15 - 15 * (1 - Math.sin(animationProgress * Math.PI));
            
            return (
              <div
                style={{
                  position: "absolute",
                  left: x - PIECE_SIZE / 2,
                  top: y - PIECE_SIZE / 2 + liftOffset,
                  width: PIECE_SIZE,
                  height: PIECE_SIZE,
                  transition: "none",
                }}
              >
                <div
                  style={{
                    ...getPieceStyle(
                      { color: animatingMove.piece.color, type: animatingMove.piece.type },
                      "/pieces.png"
                    ),
                    position: "relative",
                    zIndex: 1,
                    transform: `scale(${1 + 0.1 * Math.sin(animationProgress * Math.PI)})`,
                  }}
                />
                {/* Shadow that follows the piece */}
                <div
                  style={{
                    ...getPieceStyle(
                      { color: animatingMove.piece.color, type: animatingMove.piece.type },
                      "/shadows.png"
                    ),
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: 0.5,
                    transform: `translate(${8 * (1 - animationProgress)}px, ${8 * (1 - animationProgress)}px)`,
                  }}
                />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}