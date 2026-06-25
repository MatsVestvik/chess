"use client";
import { useState } from "react";
import StartScreen from "@/app/components/StartScreen";
import ChessBoard from "@/app/components/ChessBoard";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  return (
    <>
      {!gameStarted ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <ChessBoard onBackToMenu={handleBackToMenu} />
      )}
    </>
  );
}