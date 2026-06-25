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
  const BOARD_IMAGE_SIZE = 202 * BOARD_SIZE_SCALE_CONST; // Total størrelse på bildet med kanter
  const BOARD_SIZE = 184 * BOARD_SIZE_SCALE_CONST; // Størrelse på selve brettet
  const BORDER_SIZE = (BOARD_IMAGE_SIZE - BOARD_SIZE) / 2; // 9px
  const SQUARE_SIZE = BOARD_SIZE / 8; // 23px

  function squareName(rowIndex: number, colIndex: number): string {
    return files[colIndex] + (8 - rowIndex);
  }

  return (
    <div 
      style={{
        width: BOARD_IMAGE_SIZE,
        height: BOARD_IMAGE_SIZE,
        backgroundImage: "url('/board.png')", // Sett riktig filnavn
        backgroundSize: `${BOARD_IMAGE_SIZE}px ${BOARD_IMAGE_SIZE}px`,
        backgroundPosition: "0 0",
        display: "grid",
        gridTemplateColumns: `repeat(8, ${SQUARE_SIZE}px)`,
        gap: 0,
        padding: `${BORDER_SIZE}px`, // 9px padding på alle kanter
        boxSizing: "border-box",
        imageRendering: "pixelated",
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => {
          // Vi trenger ikke backgroundColor lenger siden bakgrunnsbildet har det
          // Men vi kan ha gjennomsiktige ruter for interaksjon
          const isDark = (rowIndex + colIndex) % 2 === 1;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => {
                const name = squareName(rowIndex, colIndex);
                if (selected == null) {
                  if (square != null) {
                    setSelected(name);
                  }
                } else {
                  try {
                    chessRef.current.move({ from: selected, to: name });
                    setFen(chessRef.current.fen());
                  } catch (error) {
                    console.log("Ugyldig trekk");
                  }
                  setSelected(null);
                }
              }}
              style={{
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                cursor: "pointer",
                outline: selected === squareName(rowIndex, colIndex) ? "3px solid yellow" : "none",
                outlineOffset: "-3px",
              }}
            >
              {square && (
                <div 
                  style={{
                    ...getPieceStyle(square, "/pieces.png"),
                    transform: "translateY(-15px)",
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}