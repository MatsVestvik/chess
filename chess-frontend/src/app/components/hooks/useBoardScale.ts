import { useState, useEffect } from 'react';

const BOARD_IMAGE_SIZE_BASE = 184;
const BOARD_SIZE_BASE = 184;

export function useBoardScale(scaleConstant: number) {
  const BOARD_IMAGE_SIZE = BOARD_IMAGE_SIZE_BASE * scaleConstant;
  const BOARD_SIZE = BOARD_SIZE_BASE * scaleConstant;
  
  const [scale, setScale] = useState(1);
  const [boardSize, setBoardSize] = useState(BOARD_IMAGE_SIZE);
  const [squareSize, setSquareSize] = useState(BOARD_SIZE / 8);
  const [borderSize, setBorderSize] = useState((BOARD_IMAGE_SIZE - BOARD_SIZE) / 2);
  const [pieceSize, setPieceSize] = useState(BOARD_SIZE / 8);

  useEffect(() => {
    function updateScale() {
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight;
      const nextScale = Math.min(1, maxWidth / BOARD_IMAGE_SIZE, maxHeight / BOARD_IMAGE_SIZE);
      
      setScale(nextScale);
      setBoardSize(BOARD_IMAGE_SIZE * nextScale);
      setSquareSize((BOARD_SIZE / 8) * nextScale);
      setBorderSize(((BOARD_IMAGE_SIZE - BOARD_SIZE) / 2) * nextScale);
      setPieceSize((BOARD_SIZE / 8) * nextScale);
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, [scaleConstant, BOARD_IMAGE_SIZE, BOARD_SIZE]);

  return {
    scale,
    boardSize,
    squareSize,
    borderSize,
    pieceSize,
  };
}