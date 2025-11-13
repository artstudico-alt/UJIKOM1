import React from 'react';
import { Box, keyframes } from '@mui/material';

// Keyframes untuk animasi
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
`;

const gradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'pulse' | 'gradient' | 'dots' | 'wave';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  variant = 'spinner' 
}) => {
  const sizeMap = {
    small: 24,
    medium: 48,
    large: 72
  };

  const currentSize = sizeMap[size];

  if (variant === 'spinner') {
    return (
      <Box
        sx={{
          width: currentSize,
          height: currentSize,
          border: `4px solid rgba(102, 126, 234, 0.2)`,
          borderTop: `4px solid #667eea`,
          borderRadius: '50%',
          animation: `${spin} 1s linear infinite`,
        }}
      />
    );
  }

  if (variant === 'pulse') {
    return (
      <Box
        sx={{
          width: currentSize,
          height: currentSize,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          animation: `${pulse} 1.5s ease-in-out infinite`,
        }}
      />
    );
  }

  if (variant === 'gradient') {
    return (
      <Box
        sx={{
          width: currentSize,
          height: currentSize,
          borderRadius: '50%',
          background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
          backgroundSize: '400% 400%',
          animation: `${gradient} 2s ease infinite, ${spin} 3s linear infinite`,
        }}
      />
    );
  }

  if (variant === 'dots') {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: currentSize / 4,
              height: currentSize / 4,
              borderRadius: '50%',
              background: `linear-gradient(45deg, #667eea, #764ba2)`,
              animation: `${pulse} 1.4s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          />
        ))}
      </Box>
    );
  }

  if (variant === 'wave') {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'end' }}>
        {[0, 1, 2, 3, 4].map((index) => (
          <Box
            key={index}
            sx={{
              width: currentSize / 8,
              height: currentSize / 2,
              background: `linear-gradient(45deg, #667eea, #764ba2)`,
              borderRadius: '2px',
              animation: `${pulse} 1.2s ease-in-out infinite`,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </Box>
    );
  }

  return null;
};

export default LoadingSpinner;