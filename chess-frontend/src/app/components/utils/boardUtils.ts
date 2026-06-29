export const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const BOARD_SIZE_SCALE_CONST = 3;

export function getSquareName(rowIndex: number, colIndex: number): string {
  return files[colIndex] + (8 - rowIndex);
}

export function getSquareCoords(
  squareName: string, 
  borderSize: number, 
  squareSize: number
): { x: number; y: number } {
  const col = files.indexOf(squareName[0]);
  const row = 8 - parseInt(squareName[1]);
  return {
    x: borderSize + col * squareSize + squareSize / 2,
    y: borderSize + row * squareSize + squareSize / 2,
  };
}

export function getRowColFromSquare(squareName: string): { row: number; col: number } {
  const col = files.indexOf(squareName[0]);
  const row = 8 - parseInt(squareName[1]);
  return { row, col };
}

export function isValidSquare(squareName: string): boolean {
  if (squareName.length !== 2) return false;
  const file = squareName[0];
  const rank = squareName[1];
  return files.includes(file) && rank >= '1' && rank <= '8';
}

export function getFileFromSquare(squareName: string): string {
  return squareName[0];
}

export function getRankFromSquare(squareName: string): number {
  return parseInt(squareName[1]);
}

export function getSquaresBetween(from: string, to: string): string[] {
  const fromCol = files.indexOf(from[0]);
  const fromRow = parseInt(from[1]);
  const toCol = files.indexOf(to[0]);
  const toRow = parseInt(to[1]);

  const squares: string[] = [];
  const colStep = Math.sign(toCol - fromCol);
  const rowStep = Math.sign(toRow - fromRow);

  let col = fromCol + colStep;
  let row = fromRow + rowStep;

  while (col !== toCol || row !== toRow) {
    squares.push(files[col] + row);
    col += colStep;
    row += rowStep;
  }

  return squares;
}