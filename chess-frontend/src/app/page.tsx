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

  const handleSquareClick = (rowIndex: number, colIndex: number, square: any) => {
    const name = squareName(rowIndex, colIndex);
    
    if (selected == null) {
      if (square != null) {
        setSelected(name);
      }
    } else {
      try {
        chessRef.current.move({ from: selected, to: name, promotion: `q` });
        setFen(chessRef.current.fen());
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
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => {
          const isDark = (rowIndex + colIndex) % 2 === 1;
          const isPieceSelected = isSelected(rowIndex, colIndex);

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
              {square && (
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
    </div>
  );
}