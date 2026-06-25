"use client";

interface StartScreenProps {
  onStartGame: () => void;
}

export default function StartScreen({ onStartGame }: StartScreenProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "64px", marginBottom: "10px" }}>Custom Chess</h1>
      <button
        onClick={onStartGame}
        style={{
          padding: "16px 48px",
          fontSize: "20px",
          fontWeight: "bold",
          color: "black",
          background: "#ffffff",
          border: "10px solid transparent",
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "black";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "white";
        }}
      >
        Start Game
      </button>
    </div>
  );
}