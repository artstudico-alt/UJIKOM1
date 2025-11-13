import React from 'react';
import { Button, ButtonProps, keyframes } from '@mui/material';
import LoadingSpinner from './LoadingSpinner';

// Keyframes untuk animasi
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

interface LoadingButtonProps extends Omit<ButtonProps, 'disabled'> {
  loading?: boolean;
  loadingText?: string;
  loadingVariant?: 'spinner' | 'pulse' | 'gradient' | 'dots' | 'wave';
  shimmer?: boolean;
  disabled?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  loadingVariant = 'spinner',
  shimmer = false,
  disabled = false,
  children,
  sx,
  ...props
}) => {
  const defaultSx = {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...(loading && {
      background: 'linear-gradient(45deg, #667eea, #764ba2)',
      ...(shimmer && {
        animation: `${shimmer} 2s infinite`,
      }),
      '&:hover': {
        background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
        ...(shimmer && {
          animation: `${shimmer} 2s infinite`,
        }),
      },
    }),
    ...(loading && shimmer && {
      '&::before': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
        animation: `${shimmer} 2s infinite`,
      },
    }),
    ...sx,
  };

  return (
    <Button
      {...props}
      disabled={loading || disabled}
      sx={defaultSx}
      startIcon={
        loading ? (
          <LoadingSpinner 
            size="small" 
            variant={loadingVariant} 
          />
        ) : props.startIcon
      }
    >
      {loading ? (loadingText || 'Memuat...') : children}
    </Button>
  );
};

export default LoadingButton;
