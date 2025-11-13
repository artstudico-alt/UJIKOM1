import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

interface RibbonPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  direction: 'left' | 'right';
  animationDuration: number;
  delay: number;
}

interface RibbonProps {
  isActive: boolean;
  onComplete?: () => void;
}

const Ribbon: React.FC<RibbonProps> = ({ isActive, onComplete }) => {
  const [pieces, setPieces] = useState<RibbonPiece[]>([]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#FF8E53', '#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4'
  ];

  useEffect(() => {
    if (isActive) {
      // Generate ribbon pieces that shoot from left and right corners
      const newPieces: RibbonPiece[] = [];
      const pieceCount = 80; // Jumlah pita yang menyembur

      for (let i = 0; i < pieceCount; i++) {
        const direction = i % 2 === 0 ? 'left' : 'right'; // Alternating left/right
        const startX = direction === 'left' ? -50 : window.innerWidth + 50;
        const startY = Math.random() * window.innerHeight * 0.6; // Start from top 60% of screen
        
        newPieces.push({
          id: i,
          x: startX,
          y: startY,
          rotation: Math.random() * 360,
          scale: 0.6 + Math.random() * 0.4,
          color: colors[Math.floor(Math.random() * colors.length)],
          direction,
          animationDuration: 2 + Math.random() * 1.5, // 2-3.5 seconds
          delay: Math.random() * 0.3, // Staggered start
        });
      }

      setPieces(newPieces);

      // Auto-hide after animation completes
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {pieces.map((piece) => (
        <Box
          key={piece.id}
          sx={{
            position: 'absolute',
            left: piece.x,
            top: piece.y,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            animation: `${piece.direction === 'left' ? 'shootLeft' : 'shootRight'} ${piece.animationDuration}s ease-out ${piece.delay}s forwards`,
            '&::before': {
              content: '""',
              display: 'block',
              width: '4px',
              height: '20px',
              backgroundColor: piece.color,
              borderRadius: '2px',
              boxShadow: `0 0 8px ${piece.color}`,
              // Add ribbon tail effect
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                backgroundColor: piece.color,
                borderRadius: '50%',
                boxShadow: `0 0 6px ${piece.color}`,
              }
            },
          }}
        />
      ))}

      <style>{`
        @keyframes shootLeft {
          0% {
            transform: translateX(0px) translateY(0px) rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(-200px) translateY(50px) rotate(180deg) scale(0.8);
            opacity: 0;
          }
        }
        @keyframes shootRight {
          0% {
            transform: translateX(0px) translateY(0px) rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(200px) translateY(-50px) rotate(-180deg) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </Box>
  );
};

export default Ribbon;
