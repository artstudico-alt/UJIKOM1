import React, { useState, useEffect } from 'react';
import { Box, Typography, Fade, Zoom, Slide } from '@mui/material';
import { keyframes } from '@mui/system';

// Advanced Animation Keyframes
const particleFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(90deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px) translateX(-5px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-30px) translateX(15px) rotate(270deg);
    opacity: 0.9;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const neonGlow = keyframes`
  0%, 100% {
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 15px #0073e6,
      0 0 20px #0073e6,
      0 0 35px #0073e6,
      0 0 40px #0073e6;
  }
  50% {
    text-shadow: 
      0 0 2px #fff,
      0 0 5px #fff,
      0 0 8px #0073e6,
      0 0 12px #0073e6,
      0 0 18px #0073e6,
      0 0 22px #0073e6;
  }
`;

const matrixRain = keyframes`
  0% {
    transform: translateY(-100vh);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
`;

const hologram = keyframes`
  0%, 100% {
    transform: perspective(400px) rotateY(0deg) rotateX(0deg);
    filter: hue-rotate(0deg);
  }
  25% {
    transform: perspective(400px) rotateY(90deg) rotateX(10deg);
    filter: hue-rotate(90deg);
  }
  50% {
    transform: perspective(400px) rotateY(180deg) rotateX(0deg);
    filter: hue-rotate(180deg);
  }
  75% {
    transform: perspective(400px) rotateY(270deg) rotateX(-10deg);
    filter: hue-rotate(270deg);
  }
`;

const liquidMorph = keyframes`
  0%, 100% {
    border-radius: 50% 50% 50% 50%;
    transform: rotate(0deg) scale(1);
  }
  25% {
    border-radius: 60% 40% 60% 40%;
    transform: rotate(90deg) scale(1.1);
  }
  50% {
    border-radius: 40% 60% 40% 60%;
    transform: rotate(180deg) scale(0.9);
  }
  75% {
    border-radius: 50% 50% 50% 50%;
    transform: rotate(270deg) scale(1.05);
  }
`;

const cyberGrid = keyframes`
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
`;

const quantumSpin = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
  25% {
    transform: rotate(90deg) scale(1.2);
    opacity: 0.8;
  }
  50% {
    transform: rotate(180deg) scale(0.8);
    opacity: 0.6;
  }
  75% {
    transform: rotate(270deg) scale(1.1);
    opacity: 0.9;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 1;
  }
`;

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

interface AdvancedLoadingScreenProps {
  variant?: 'cyber' | 'hologram' | 'matrix' | 'quantum' | 'liquid' | 'neon' | 'particle';
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const AdvancedLoadingScreen: React.FC<AdvancedLoadingScreenProps> = ({
  variant = 'cyber',
  message = 'Loading...',
  size = 80,
  fullScreen = true
}) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    const textInterval = setInterval(() => {
      const texts = [
        'Memuat sistem...',
        'Menyiapkan data...',
        'Mengoptimalkan performa...',
        'Hampir selesai...',
        'Siap digunakan!'
      ];
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);

  const renderLoadingContent = () => {
    switch (variant) {
      case 'cyber':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(45deg, #0a0a0a, #1a1a2e, #16213e)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Cyber Grid Background */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                  linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                animation: `${cyberGrid} 10s linear infinite`,
              }}
            />
            
            {/* Cyber Particles */}
            {[...Array(20)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: 2,
                  height: 2,
                  background: '#00ffff',
                  borderRadius: '50%',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `${particleFloat} ${3 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`,
                  boxShadow: '0 0 10px #00ffff',
                }}
              />
            ))}
            
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    border: '2px solid #00ffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: `${quantumSpin} 2s linear infinite`,
                    mb: 3,
                    position: 'relative',
                    boxShadow: '0 0 20px #00ffff',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: size * 0.6,
                      height: size * 0.6,
                      border: '1px solid #00ffff',
                      borderTop: '1px solid transparent',
                      borderRadius: '50%',
                      animation: `${quantumSpin} 1s linear infinite reverse`,
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#00ffff',
                    fontWeight: 600,
                    mb: 1,
                    animation: `${neonGlow} 2s ease-in-out infinite`,
                    fontFamily: 'monospace',
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#00ffff',
                    fontFamily: 'monospace',
                    mb: 2,
                  }}
                >
                  {loadingText}
                </Typography>
                <Box
                  sx={{
                    width: 200,
                    height: 4,
                    background: 'rgba(0, 255, 255, 0.2)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #00ffff, #0080ff)',
                      borderRadius: 2,
                      boxShadow: '0 0 10px #00ffff',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#00ffff',
                    fontFamily: 'monospace',
                    mt: 1,
                    display: 'block',
                  }}
                >
                  {Math.round(progress)}%
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'hologram':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e)',
              position: 'relative',
            }}
          >
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    background: 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00)',
                    borderRadius: '50%',
                    animation: `${hologram} 3s ease-in-out infinite`,
                    mb: 3,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: size * 0.7,
                      height: size * 0.7,
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '50%',
                      animation: `${pulse} 2s ease-in-out infinite`,
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#ff00ff',
                    fontWeight: 600,
                    mb: 1,
                    textShadow: '0 0 10px #ff00ff',
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#00ffff',
                    mb: 2,
                  }}
                >
                  {loadingText}
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'matrix':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: '#000',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Matrix Rain Effect */}
            {[...Array(50)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  top: '-100px',
                  left: `${i * 2}%`,
                  width: 2,
                  height: 20,
                  background: '#00ff00',
                  animation: `${matrixRain} ${2 + Math.random() * 3}s linear infinite ${Math.random() * 2}s`,
                  opacity: 0.7,
                }}
              />
            ))}
            
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    border: '2px solid #00ff00',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: `${quantumSpin} 1s linear infinite`,
                    mb: 3,
                    boxShadow: '0 0 20px #00ff00',
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: '#00ff00',
                    fontWeight: 600,
                    mb: 1,
                    fontFamily: 'monospace',
                    textShadow: '0 0 10px #00ff00',
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#00ff00',
                    fontFamily: 'monospace',
                    mb: 2,
                  }}
                >
                  {loadingText}
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'quantum':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
              position: 'relative',
            }}
          >
            {/* Quantum Particles */}
            {[...Array(15)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  background: '#ff6b6b',
                  borderRadius: '50%',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `${particleFloat} ${2 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`,
                  boxShadow: '0 0 15px #ff6b6b',
                }}
              />
            ))}
            
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
                    borderRadius: '50%',
                    animation: `${quantumSpin} 2s ease-in-out infinite`,
                    mb: 3,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: size * 0.6,
                      height: size * 0.6,
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '50%',
                      animation: `${pulse} 1.5s ease-in-out infinite`,
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#ff6b6b',
                    fontWeight: 600,
                    mb: 1,
                    textShadow: '0 0 10px #ff6b6b',
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#4ecdc4',
                    mb: 2,
                  }}
                >
                  {loadingText}
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'liquid':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              position: 'relative',
            }}
          >
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                    animation: `${liquidMorph} 3s ease-in-out infinite`,
                    mb: 3,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: size * 0.7,
                      height: size * 0.7,
                      background: 'rgba(255, 255, 255, 0.3)',
                      animation: `${liquidMorph} 2s ease-in-out infinite reverse`,
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  {loadingText}
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'neon':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
              position: 'relative',
            }}
          >
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    border: '3px solid #ff0080',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: `${quantumSpin} 1s linear infinite`,
                    mb: 3,
                    boxShadow: '0 0 30px #ff0080',
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: '#ff0080',
                    fontWeight: 600,
                    mb: 1,
                    animation: `${neonGlow} 2s ease-in-out infinite`,
                    fontFamily: 'monospace',
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#00ffff',
                    fontFamily: 'monospace',
                    mb: 2,
                  }}
                >
                  {loadingText}
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'particle':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Floating Particles */}
            {[...Array(30)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: 3,
                  height: 3,
                  background: 'white',
                  borderRadius: '50%',
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `${particleFloat} ${3 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`,
                  opacity: 0.7,
                }}
              />
            ))}
            
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: `${quantumSpin} 1s linear infinite`,
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  {loadingText}
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              position: 'relative',
            }}
          >
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: `${quantumSpin} 1s linear infinite`,
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  {loadingText}
                </Typography>
              </Box>
            </Fade>
          </Box>
        );
    }
  };

  return renderLoadingContent();
};

export default AdvancedLoadingScreen;
