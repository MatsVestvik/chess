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
        background: "#1a1a2e",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "64px", marginBottom: "10px" }}>♛ Chess</h1>
      <button
        onClick={onStartGame}
        style={{
          padding: "16px 48px",
          fontSize: "20px",
          fontWeight: "bold",
          color: "white",
          background: "#f7971e",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Start Game
      </button>
    </div>
  );
}