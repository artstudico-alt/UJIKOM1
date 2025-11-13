import React from 'react';
import { Box, Typography, CircularProgress, Fade, Zoom } from '@mui/material';
import { keyframes } from '@mui/system';

// Animation keyframes
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
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
    transform: translateY(-20px);
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

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const wave = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
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

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const morphing = keyframes`
  0%, 100% {
    border-radius: 50%;
    transform: rotate(0deg);
  }
  25% {
    border-radius: 20%;
    transform: rotate(90deg);
  }
  50% {
    border-radius: 50%;
    transform: rotate(180deg);
  }
  75% {
    border-radius: 20%;
    transform: rotate(270deg);
  }
`;

interface LoadingScreenProps {
  variant?: 'default' | 'gradient' | 'minimal' | 'sparkle' | 'floating' | 'wave' | 'glow' | 'bounce' | 'morphing';
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  variant = 'default',
  message = 'Loading...',
  size = 60,
  fullScreen = true
}) => {
  const renderLoadingContent = () => {
    switch (variant) {
      case 'gradient':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
              backgroundSize: '400% 400%',
              animation: `${gradient} 3s ease infinite`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animated background elements */}
            <Box
              sx={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: `${float} 3s ease-in-out infinite`,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '60%',
                right: '15%',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: `${float} 3s ease-in-out infinite 1.5s`,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '20%',
                left: '20%',
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: `${float} 3s ease-in-out infinite 0.5s`,
              }}
            />
            
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <CircularProgress
                  size={size}
                  thickness={4}
                  sx={{
                    color: 'white',
                    mb: 3,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Mohon tunggu sebentar...
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'sparkle':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Sparkle effects */}
            {[...Array(8)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: 6,
                  height: 6,
                  background: 'white',
                  borderRadius: '50%',
                  top: `${15 + i * 12}%`,
                  left: `${10 + i * 10}%`,
                  animation: `${sparkle} 2s ease-in-out infinite ${i * 0.2}s`,
                }}
              />
            ))}
            
            <Zoom in timeout={800}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '4px solid white',
                    borderRadius: '50%',
                    animation: `${rotate} 1s linear infinite`,
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Sedang memproses...
                </Typography>
              </Box>
            </Zoom>
          </Box>
        );

      case 'floating':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              position: 'relative',
            }}
          >
            {/* Floating elements */}
            <Box
              sx={{
                position: 'absolute',
                top: '10%',
                left: '10%',
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
                top: '20%',
                right: '20%',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: `${float} 4s ease-in-out infinite 1s`,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '20%',
                left: '30%',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: `${float} 4s ease-in-out infinite 2s`,
              }}
            />
            
            <Fade in timeout={1200}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: `${rotate} 1.5s linear infinite`,
                    mb: 3,
                    position: 'relative',
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
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: `${rotate} 1s linear infinite reverse`,
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Memuat konten...
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'wave':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Wave elements */}
            {[...Array(5)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: `${i * 20}%`,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  animation: `${wave} 3s ease-in-out infinite ${i * 0.5}s`,
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
                    animation: `${rotate} 1s linear infinite`,
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Memuat konten...
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'glow':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    animation: `${rotate} 1s linear infinite, ${glow} 2s ease-in-out infinite`,
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Memuat konten...
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'bounce':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    animation: `${bounce} 1s ease-in-out infinite`,
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                    animation: `${bounce} 1s ease-in-out infinite 0.1s`,
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    animation: `${bounce} 1s ease-in-out infinite 0.2s`,
                  }}
                >
                  Memuat konten...
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'morphing':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative',
            }}
          >
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    animation: `${morphing} 3s ease-in-out infinite`,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: size * 0.6,
                      height: size * 0.6,
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '50%',
                      animation: `${pulse} 1.5s ease-in-out infinite`,
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Memuat konten...
                </Typography>
              </Box>
            </Fade>
          </Box>
        );

      case 'minimal':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: fullScreen ? '100vh' : '200px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <Fade in timeout={800}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: size,
                    height: size,
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: `${rotate} 1s linear infinite`,
                    mb: 3,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 500,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {message}
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative',
            }}
          >
            {/* Shimmer effect */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                backgroundSize: '200px 100%',
                animation: `${shimmer} 2s infinite`,
              }}
            />
            
            <Fade in timeout={1000}>
              <Box sx={{ textAlign: 'center', zIndex: 1 }}>
                <CircularProgress
                  size={size}
                  thickness={4}
                  sx={{
                    color: 'white',
                    mb: 3,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 1,
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  Mohon tunggu sebentar...
                </Typography>
              </Box>
            </Fade>
          </Box>
        );
    }
  };

  return renderLoadingContent();
};

export default LoadingScreen;