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

  function squareName(rowIndex: number, colIndex: number): string {
    return files[colIndex] + (8 - rowIndex);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 90px)" }}>
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => {
          let isDark = (rowIndex + colIndex) % 2 === 1;
          let squareColor = isDark ? "#769656" : "#eeeed2";

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
                width: 90,
                height: 90,
                backgroundColor: squareColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                cursor: "pointer",
              }}
            >
              {square && (
                <div 
                  style={{
                    ...getPieceStyle(square),
                    margin: "auto",
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