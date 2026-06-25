"use client";
import { Chess } from "chess.js";
import { useState, useRef, useEffect } from "react";
import { useGame } from "@/app/context/GameContext";
import { getPieceStyle } from "@/app/lib/pieces";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface MultiplayerChessBoardProps {
  onBackToLobby: () => void;
}

interface MoveData {
  from: string;
  to: string;
  piece: {
    color: 'w' | 'b';
    type: string;
  };
}

export default function MultiplayerChessBoard({ onBackToLobby }: MultiplayerChessBoardProps) {
  const { socket, gameId, color, makeMove, getGameState, opponentDisconnected, leaveQueue } = useGame();
  const [fen, setFen] = useState("start");
  const [board, setBoard] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [animatingMove, setAnimatingMove] = useState<MoveData | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const chessRef = useRef(new Chess());

  // Board configuration
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

  // Update board when FEN changes
  useEffect(() => {
    if (fen === "start") {
      const chess = new Chess();
      chessRef.current = chess;
      setBoard(chess.board());
      setIsMyTurn((color === 'white' && chess.turn() === 'w') || (color === 'black' && chess.turn() === 'b'));
    } else {
      try {
        const chess = new Chess(fen);
        chessRef.current = chess;
        setBoard(chess.board());
        setIsMyTurn((color === 'white' && chess.turn() === 'w') || (color === 'black' && chess.turn() === 'b'));
      } catch (error) {
        console.error('Invalid FEN:', fen);
      }
    }
  }, [fen, color]);

  // Listen for game events
  useEffect(() => {
    if (!socket) return;

    const handleMoveMade = (data: any) => {
      // Animate the move
      const move = data.move;
      setAnimatingMove({
        from: move.from,
        to: move.to,
        piece: { color: move.color, type: move.piece }
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
          setFen(data.fen);
          
          if (data.gameOver) {
            setGameOver(true);
            setGameOverMessage(data.gameOverMessage);
          }
        }
      };

      requestAnimationFrame(animate);
    };

    const handleGameStarted = (data: any) => {
      setFen(data.fen);
      setGameOver(false);
      setGameOverMessage("");
    };

    socket.on('moveMade', handleMoveMade);
    socket.on('gameStarted', handleGameStarted);

    // Get initial game state
    getGameState().then((state) => {
      if (state) {
        setFen(state.fen);
        setIsMyTurn((color === 'white' && state.turn === 'w') || (color === 'black' && state.turn === 'b'));
      }
    }).catch((error) => {
      console.error('Failed to get game state:', error);
    });

    return () => {
      socket.off('moveMade', handleMoveMade);
      socket.off('gameStarted', handleGameStarted);
    };
  }, [socket, getGameState, color]);

  const handleSquareClick = async (rowIndex: number, colIndex: number, square: any) => {
    if (gameOver || !isMyTurn || opponentDisconnected) return;

    const name = squareName(rowIndex, colIndex);

    if (selected == null) {
      if (square != null) {
        // Check if this is the player's piece
        const isMyPiece = (color === 'white' && square.color === 'w') || (color === 'black' && square.color === 'b');
        if (isMyPiece) {
          setSelected(name);
        }
      }
    } else {
      try {
        const result = await makeMove(selected, name, 'q');
        if (result.success) {
          setSelected(null);
        }
      } catch (error: any) {
        console.error('Move failed:', error.message);
        setSelected(null);
      }
    }
  };

  const isSelected = (rowIndex: number, colIndex: number) => {
    return selected === squareName(rowIndex, colIndex);
  };

  // Handle back to lobby with queue cleanup
  const handleBackToLobby = () => {
    leaveQueue();
    onBackToLobby();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100vh",
        background: "#1a1a2e",
        margin: 0,
        padding: 0,
        cursor: "default",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: BOARD_IMAGE_SIZE,
          marginBottom: "20px",
          padding: "0 10px",
        }}
      >
        <button
          onClick={handleBackToLobby}
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
          ← Lobby
        </button>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", fontFamily: "'ManaSPC', 'Courier New', monospace" }}>
          {gameOver ? (
            <span style={{ color: "#ffd700" }}>{gameOverMessage}</span>
          ) : opponentDisconnected ? (
            <span style={{ color: "#f44336" }}>Opponent disconnected</span>
          ) : (
            <span>
              {isMyTurn ? 'Your turn' : "Opponent's turn"} • You are {color === 'white' ? '♔' : '♚'}
            </span>
          )}
        </div>
      </div>

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
        {board.map((row: any, rowIndex: number) =>
          row.map((square: any, colIndex: number) => {
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
                  cursor: (isMyTurn && !gameOver && !opponentDisconnected) ? "pointer" : "default",
                  outline: isPieceSelected ? "3px solid yellow" : "none",
                  outlineOffset: "-3px",
                  position: "relative",
                }}
              >
                {square && !isAnimatingFrom && !isAnimatingTo && (
                  <div
                    style={{
                      position: "relative",
                      width: PIECE_SIZE,
                      height: PIECE_SIZE,
                      transform: isPieceSelected ? "translateY(-30px)" : "translateY(-15px)",
                      transition: "transform 0.2s ease-out",
                    }}
                  >
                    <div
                      style={{
                        ...getPieceStyle(square, "/assets/shadows/shadows.png"),
                        position: "absolute",
                        top: 0,
                        left: 0,
                        transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
                        transform: isPieceSelected ? "translate(-8px, -8px)" : "translate(0, 0)",
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
                currentYOffset = -30 + 15 * easedDescent;
              }

              let shadowOpacity = 0.5;
              let shadowOffsetX = -8;
              let shadowOffsetY = -8;

              if (animationProgress > descentStart) {
                const descentProgress = (animationProgress - descentStart) / (1 - descentStart);
                const easedDescent = 1 - Math.pow(1 - descentProgress, 2);
                shadowOpacity = 0.5 + 0.5 * easedDescent;
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