// lib/pieces.ts

// Sprite sheet layout (3x4 grid, hver brikke er 23x23 px)
// Rad 0: Svart bonde, dronning, konge
// Rad 1: Svart hest, tårn, løper
// Rad 2: Hvit bonde, dronning, konge
// Rad 3: Hvit hest, tårn, løper

const BASE_SIZE = 23;
const SCALE_FACTOR = 3;
const PIECE_SIZE = BASE_SIZE * SCALE_FACTOR;

const SPRITE_WIDTH = 3 * PIECE_SIZE;
const SPRITE_HEIGHT = 4 * PIECE_SIZE;

// Mapper fra brikketype til posisjon i sprite sheet (kolonne, rad)
const piecePositions: Record<string, { col: number; row: number }> = {
  // Svarte brikker (rad 0-1)
  "bp": { col: 0, row: 0 }, // bonde
  "bq": { col: 1, row: 0 }, // dronning
  "bk": { col: 2, row: 0 }, // konge
  "bn": { col: 0, row: 1 }, // hest
  "br": { col: 1, row: 1 }, // tårn
  "bb": { col: 2, row: 1 }, // løper
  // Hvite brikker (rad 2-3)
  "wp": { col: 0, row: 2 }, // bonde
  "wq": { col: 1, row: 2 }, // dronning
  "wk": { col: 2, row: 2 }, // konge
  "wn": { col: 0, row: 3 }, // hest
  "wr": { col: 1, row: 3 }, // tårn
  "wb": { col: 2, row: 3 }, // løper
};

// Hjelpefunksjon for å hente posisjon for en brikke
export function getPiecePosition(square: any): { col: number; row: number } | null {
  if (!square) return null;
  const key = square.color + square.type;
  return piecePositions[key] || null;
}

// Hjelpefunksjon for å hente CSS for en brikke fra sprite sheet
// `size` lets callers render the piece at any pixel size (e.g. when the board
// is scaled for mobile); the sprite sheet's backgroundSize must scale
// proportionally with `size` or the wrong crop will show.
export function getPieceStyle(
  square: any,
  spritePath: string = "/pieces.png",
  size: number = PIECE_SIZE
): React.CSSProperties {
  if (!square) return {};

  const pos = getPiecePosition(square);
  if (!pos) return {};

  // Scale factor relative to the sprite sheet's native piece size
  const scaleRatio = size / PIECE_SIZE;
  const scaledSpriteWidth = SPRITE_WIDTH * scaleRatio;
  const scaledSpriteHeight = SPRITE_HEIGHT * scaleRatio;

  const x = pos.col * size;
  const y = pos.row * size;

  return {
    width: size,
    height: size,
    backgroundImage: `url(${spritePath})`,
    backgroundPosition: `-${x}px -${y}px`,
    backgroundSize: `${scaledSpriteWidth}px ${scaledSpriteHeight}px`,
    display: "inline-block",
    flexShrink: 0,
    imageRendering: "pixelated",
  };
}

// Konfigurerbar funksjon for å tilpasse brikkestørrelse
export function createPieceStyleFunction(size: number = PIECE_SIZE) {
  return function(square: any, spritePath: string = "/spritesheet.png"): React.CSSProperties {
    if (!square) return {};

    const pos = getPiecePosition(square);
    if (!pos) return {};

    const scaledWidth = size * 3;
    const scaledHeight = size * 4;
    const x = pos.col * size;
    const y = pos.row * size;

    return {
      width: size,
      height: size,
      backgroundImage: `url(${spritePath})`,
      backgroundPosition: `-${x}px -${y}px`,
      backgroundSize: `${scaledWidth}px ${scaledHeight}px`,
      display: "inline-block",
      flexShrink: 0,
      imageRendering: "pixelated",
    };
  };
}

// Eksporter konstanter hvis noen trenger dem
export { PIECE_SIZE, SPRITE_WIDTH, SPRITE_HEIGHT };