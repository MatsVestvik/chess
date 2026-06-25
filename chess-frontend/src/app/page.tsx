"use client";
import { useState } from "react";
import { GameProvider } from "@/app/context/GameContext";
import Lobby from "@/app/components/Lobby";
import MultiplayerChessBoard from "@/app/components/MultiplayerChessBoard";

export default function Home() {
  const [gameReady, setGameReady] = useState(false);

  const handleBackToLobby = () => {
    setGameReady(false);
  };

  return (
    <GameProvider>
      {!gameReady ? (
        <Lobby onGameReady={() => setGameReady(true)} />
      ) : (
        <MultiplayerChessBoard onBackToLobby={handleBackToLobby} />
      )}
    </GameProvider>
  );
}