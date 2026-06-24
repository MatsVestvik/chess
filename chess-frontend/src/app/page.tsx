"use client";
import { Chess } from "chess.js";
import { useState } from "react";
import { useRef } from "react";

const whitePieces = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" };
const blackPieces = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];


export default function Home() {

  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const board = chessRef.current.board();

  const [selected, setSelected] = useState<string | null>(null);

  function squareName(rowIndex: number, colIndex: number): string {
    return files[colIndex] + (8-(rowIndex))
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 60px)" }}>
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => {

          let isDark = ((rowIndex + colIndex)%2 === 1 ? true:false);

          let squareColor = (isDark ? "#769656" : "#eeeed2");

          let symbol;
          if (square != null){
            if(square.color === "w"){
              symbol = whitePieces[square.type]
            }
            else if(square.color === "b"){
              symbol = blackPieces[square.type]
            }
          }

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => {
                const name = squareName(rowIndex, colIndex);
                if(selected == null){
                  if(square != null){
                   setSelected(name);
                  }
                }
                else{
                  try {
                    chessRef.current.move({ from: selected, to: name });
                    // TODO: trekket gikk gjennom - hva må du gjøre for at
                    // brettet på skjermen skal vise den nye posisjonen?
                  } catch (error) {
                    console.log("Ugyldig trekk");
                  }
                  setSelected(null);
                }
              }}
              style={{
                width: 60,
                height: 60,
                backgroundColor: squareColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
              }}
            >
            {symbol}
            </div>
          );

        })
      )}
    </div>

  );
}