import { useState, useCallback } from 'react';

interface MoveData {
  from: string;
  to: string;
  piece: {
    color: 'w' | 'b';
    type: string;
  };
}

export function useMoveAnimation() {
  const [animatingMove, setAnimatingMove] = useState<MoveData | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback((move: MoveData, onComplete?: () => void) => {
    setAnimatingMove(move);
    setAnimationProgress(0);
    setIsAnimating(true);

    const startTime = Date.now();
    const duration = 300; // 300ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      setAnimationProgress(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimationProgress(1);
        setIsAnimating(false);
        if (onComplete) {
          onComplete();
        }
        // Clear animation after a brief delay
        setTimeout(() => {
          setAnimatingMove(null);
        }, 100);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const clearAnimation = useCallback(() => {
    setAnimatingMove(null);
    setAnimationProgress(0);
    setIsAnimating(false);
  }, []);

  return {
    animatingMove,
    animationProgress,
    isAnimating,
    startAnimation,
    clearAnimation,
  };
}