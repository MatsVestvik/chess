"use client";
import { Chess } from "chess.js";
import { useState, useRef } from "react";
import { getPieceStyle } from "@/app/lib/pieces";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface ChessBoardProps {
  onBackToMenu: () => void;
}

export default function ChessBoard({ onBackToMenu }: ChessBoardProps) {
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
        const move = chessRef.current.move({ 
          from: selected, 
          to: name,
          promotion: 'q'
        });
        
        if (move) {
          const piece = move.piece;
          const color = move.color;
          
          setAnimatingMove({
            from: selected,
            to: name,
            piece: { color, type: piece }
          });
          setAnimationProgress(0);
          
          const startTime = Date.now();
          const duration = 300;
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setAnimationProgress(progress);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#1a1a2e",
      }}
    >
      <button
        onClick={onBackToMenu}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 16px",
          color: "white",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      
      <div 
        style={{
          width: BOARD_IMAGE_SIZE,
          height: BOARD_IMAGE_SIZE,
          backgroundImage: "url('/assets/boards/board.png')",
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
            const isPieceSelected = isSelected(rowIndex, colIndex);
            const squareNameStr = squareName(rowIndex, colIndex);

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
                    <div
                      style={{
                        ...getPieceStyle(square, "/assets/shadows/shadows.png"),
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
                    <div
                      style={{
                        ...getPieceStyle(square, "/assets/pieces/pieces.png"),
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
              
              const descentStart = 0.9;
              let currentYOffset = -30;
              
              if (animationProgress > descentStart) {
                const descentProgress = (animationProgress - descentStart) / (1 - descentStart);
                const easedDescent = 1 - Math.pow(1 - descentProgress, 2);
                currentYOffset = -30 + (15 * easedDescent);
              }
              
              let shadowOpacity = 0.5;
              let shadowOffsetX = -8;
              let shadowOffsetY = -8;
              
              if (animationProgress > descentStart) {
                const descentProgress = (animationProgress - descentStart) / (1 - descentStart);
                const easedDescent = 1 - Math.pow(1 - descentProgress, 2);
                shadowOpacity = 0.5 + (0.5 * easedDescent);
                shadowOffsetX = -8 * (1 - easedDescent);
                shadowOffsetY = -8 * (1 - easedDescent);
              }
              
              return (
                <div
                  style={{
                    position: "absolute",
                    left: x - PIECE_SIZE / 2,
                    top: y - PIECE_SIZE / 2 + currentYOffset,
                    width: PIECE_SIZE,
                    height: PIECE_SIZE,
                    transition: "none",
                  }}
                >
                  <div
                    style={{
                      ...getPieceStyle(
                        { color: animatingMove.piece.color, type: animatingMove.piece.type },
                        "/assets/shadows/shadows.png"
                      ),
                      position: "absolute",
                      top: 0,
                      left: 0,
                      opacity: shadowOpacity,
                      transform: `translate(${shadowOffsetX}px, ${shadowOffsetY}px)`,
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      ...getPieceStyle(
                        { color: animatingMove.piece.color, type: animatingMove.piece.type },
                        "/assets/pieces/pieces.png"
                      ),
                      position: "relative",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}