export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface ChessPiece {
  color: PieceColor;
  type: PieceType;
}

export interface MoveData {
  from: string;
  to: string;
  piece: ChessPiece;
  promotion?: PieceType;
}

export interface GameState {
  fen: string;
  turn: PieceColor;
  gameOver: boolean;
  gameOverMessage?: string;
  moveHistory: string[];
  capturedPieces: {
    white: PieceType[];
    black: PieceType[];
  };
}

export interface BoardSquare {
  type: PieceType;
  color: PieceColor;
}

export type ChessBoard = (BoardSquare | null)[][];