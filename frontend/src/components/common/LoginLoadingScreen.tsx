import React from 'react';
import { Box, Typography, Fade, Zoom } from '@mui/material';
import { keyframes } from '@mui/system';

// Animation keyframes
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
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

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
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

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 255, 255, 0.6);
  }
`;

const textGlow = keyframes`
  0%, 100% {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  }
`;

interface LoginLoadingScreenProps {
  message?: string;
  size?: number;
  variant?: 'purple' | 'blue' | 'gradient' | 'minimal';
}

const LoginLoadingScreen: React.FC<LoginLoadingScreenProps> = ({
  message = 'Memuat...',
  size = 60,
  variant = 'purple'
}) => {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'blue':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };
      case 'gradient':
        return {
          background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
          backgroundSize: '400% 400%',
          animation: `${gradient} 3s ease infinite`,
        };
      case 'minimal':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };
      default: // purple
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };
    }
  };

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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        ...getBackgroundStyle(),
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: `${float} 3s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '15%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          animation: `${float} 2.5s ease-in-out infinite reverse`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '20%',
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: `${float} 4s ease-in-out infinite`,
        }}
      />

      {/* Main Loading Content */}
      <Fade in timeout={1000}>
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          {/* Logo/Icon Container */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 3,
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
            
            {/* Spinning Ring */}
            <Box
              sx={{
                width: 80,
                height: 80,
                border: '3px solid transparent',
                borderTop: '3px solid rgba(255, 255, 255, 0.8)',
                borderRight: '3px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                animation: `${rotate} 1s linear infinite`,
              }}
            />
            
            {/* Inner Dot */}
            <Box
              sx={{
                position: 'absolute',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)',
                animation: `${pulse} 1.5s ease-in-out infinite`,
              }}
            />
          </Box>

          {/* Loading Text */}
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 1,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              animation: `${textGlow} 2s ease-in-out infinite`,
            }}
          >
            {message}
          </Typography>

          {/* Loading Dots */}
          <Box sx={{ display: 'flex', gap: 1, marginTop: 2, justifyContent: 'center' }}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.8)',
                  animation: `${pulse} 1.4s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </Box>

          {/* Progress Bar */}
          <Box
            sx={{
              width: 200,
              height: 4,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              marginTop: 3,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                animation: `${shimmer} 2s infinite`,
              }}
            />
          </Box>
        </Box>
      </Fade>

      {/* Bottom Text */}
      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          bottom: 30,
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
          animation: `${pulse} 3s ease-in-out infinite`,
        }}
      >
        Mohon tunggu sebentar...
      </Typography>
    </Box>
  );
};

export default LoginLoadingScreen;
