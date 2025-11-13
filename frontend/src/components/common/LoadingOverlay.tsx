import React from 'react';
import { Box, Backdrop, keyframes } from '@mui/material';
import LoadingSpinner from './LoadingSpinner';

// Keyframes untuk animasi
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  variant?: 'backdrop' | 'overlay';
  spinnerVariant?: 'spinner' | 'pulse' | 'gradient' | 'dots' | 'wave';
  transparent?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'Memuat...',
  variant = 'backdrop',
  spinnerVariant = 'gradient',
  transparent = false,
}) => {
  if (!open) return null;

  if (variant === 'backdrop') {
    return (
      <Backdrop
        open={open}
        sx={{
          zIndex: 9999,
          background: transparent 
            ? 'rgba(0, 0, 0, 0.1)' 
            : 'rgba(102, 126, 234, 0.1)',
          backdropFilter: 'blur(4px)',
          animation: `${fadeIn} 0.3s ease-in-out`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            animation: `${slideIn} 0.3s ease-in-out`,
          }}
        >
          <LoadingSpinner size="large" variant={spinnerVariant} />
          {message && (
            <Box
              sx={{
                color: '#667eea',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '1.1rem',
              }}
            >
              {message}
            </Box>
          )}
        </Box>
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: transparent 
          ? 'rgba(255, 255, 255, 0.8)' 
          : 'rgba(102, 126, 234, 0.05)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        animation: `${fadeIn} 0.3s ease-in-out`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          padding: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 2,
          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
          animation: `${slideIn} 0.3s ease-in-out`,
        }}
      >
        <LoadingSpinner size="medium" variant={spinnerVariant} />
        {message && (
          <Box
            sx={{
              color: '#667eea',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: '0.9rem',
            }}
          >
            {message}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LoadingOverlay;
