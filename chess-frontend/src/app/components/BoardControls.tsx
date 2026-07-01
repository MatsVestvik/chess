interface BoardControlsProps {
  onBackToLobby: () => void;
  onFlipBoard: () => void;
  isFlipped: boolean;
  gameOver: boolean;
  gameOverMessage: string;
  opponentDisconnected: boolean;
  isMyTurn: boolean;
  color: 'white' | 'black' | null;
}

export function BoardControls({
  onBackToLobby,
  onFlipBoard,
  isFlipped,
  gameOver,
  gameOverMessage,
  opponentDisconnected,
  isMyTurn,
  color,
}: BoardControlsProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        maxWidth: "600px",
        marginBottom: "20px",
        padding: "0 10px",
      }}
    >
      <button
        onClick={onBackToLobby}
        style={{
          padding: "8px 16px",
          fontSize: "14px",
          color: "white",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "8px",
          cursor: "pointer",
          fontFamily: "'ManaSPC', 'Courier New', monospace",
        }}
      >
        Home
      </button>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          onClick={onFlipBoard}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            color: "white",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "'ManaSPC', 'Courier New', monospace",
          }}
        >
          {isFlipped ? '↻ Normal' : '↻ Flip'}
        </button>

        <div style={{ 
          color: "rgba(255,255,255,0.7)", 
          fontSize: "14px", 
          fontFamily: "'ManaSPC', 'Courier New', monospace" 
        }}>
          {gameOver ? (
            <span style={{ color: "#ffd700" }}>{gameOverMessage}</span>
          ) : opponentDisconnected ? (
            <span style={{ color: "#f44336" }}>Opponent disconnected</span>
          ) : (
            <span>
              {isMyTurn ? 'Your turn' : "Opponent's turn"} • You are {color === 'white' ? '♚' : '♔'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
