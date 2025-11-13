import React, { useState, useEffect } from 'react';
import { Box, Typography, keyframes } from '@mui/material';

// Keyframes untuk animasi
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-30px);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

interface AppLoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ 
  onComplete,
  duration = 3000 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('Memulai aplikasi...');

  const loadingTexts = [
    'Memulai aplikasi...',
    'Memuat komponen...',
    'Menyiapkan antarmuka...',
    'Hampir selesai...',
    'Siap digunakan!'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, duration / 50);

    const textInterval = setInterval(() => {
      setCurrentText((prev) => {
        const currentIndex = loadingTexts.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, duration / 5);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, [duration, onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
        backgroundSize: '400% 400%',
        animation: `${gradient} 3s ease infinite`,
        zIndex: 9999,
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: `${float} 4s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          animation: `${float} 3s ease-in-out infinite reverse`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '15%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: `${float} 5s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          right: '20%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.12)',
          animation: `${float} 3.5s ease-in-out infinite reverse`,
        }}
      />

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 2,
          animation: `${slideUp} 1s ease-out`,
        }}
      >
        {/* Logo/Icon */}
        <Box
          sx={{
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(15px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
            animation: `${pulse} 2s ease-in-out infinite`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer Effect */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
              animation: `${shimmer} 2s infinite`,
            }}
          />
          
          {/* Spinning Rings */}
          <Box
            sx={{
              width: 100,
              height: 100,
              border: '4px solid transparent',
              borderTop: '4px solid rgba(255, 255, 255, 0.8)',
              borderRight: '4px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              animation: `${rotate} 2s linear infinite`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 70,
              height: 70,
              border: '3px solid transparent',
              borderBottom: '3px solid rgba(255, 255, 255, 0.7)',
              borderLeft: '3px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              animation: `${rotate} 1.5s linear infinite reverse`,
            }}
          />
          
          {/* Center Dot */}
          <Box
            sx={{
              position: 'absolute',
              width: 25,
              height: 25,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              animation: `${pulse} 1.5s ease-in-out infinite`,
            }}
          />
        </Box>

        {/* App Title */}
        <Typography
          variant="h3"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 2,
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          Event Management
        </Typography>

        {/* Loading Text */}
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            marginBottom: 3,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            minHeight: '1.5em',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          {currentText}
        </Typography>

        {/* Progress Bar */}
        <Box
          sx={{
            width: 300,
            height: 6,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            marginBottom: 2,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))',
              borderRadius: 3,
              transition: 'width 0.3s ease',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                animation: `${shimmer} 2s infinite`,
              },
            }}
          />
        </Box>

        {/* Progress Percentage */}
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        >
          {progress}%
        </Typography>
      </Box>

      {/* Bottom Text */}
      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          bottom: 30,
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          animation: `${pulse} 3s ease-in-out infinite`,
        }}
      >
        © 2024 Event Management System
      </Typography>
    </Box>
  );
};

export default AppLoadingScreen;
