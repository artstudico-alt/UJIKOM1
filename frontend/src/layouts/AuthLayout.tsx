import React from 'react';
import { Box, Container, CssBaseline } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Accent Elements */}
      
      {/* Large Background Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%)',
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)',
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.18) 0%, rgba(118, 75, 162, 0.18) 100%)',
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -120,
          right: -120,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.15) 0%, rgba(102, 126, 234, 0.15) 100%)',
          zIndex: 0,
        }}
      />

      {/* Geometric Shapes */}
      {/* Triangle */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: 0,
          height: 0,
          borderLeft: '25px solid transparent',
          borderRight: '25px solid transparent',
          borderBottom: '40px solid rgba(102, 126, 234, 0.3)',
          transform: 'rotate(15deg)',
          zIndex: 0,
        }}
      />

      {/* Square */}
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '12%',
          width: 30,
          height: 30,
          background: 'rgba(118, 75, 162, 0.25)',
          transform: 'rotate(45deg)',
          zIndex: 0,
        }}
      />

      {/* Diamond */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          width: 35,
          height: 35,
          background: 'rgba(102, 126, 234, 0.28)',
          transform: 'rotate(45deg)',
          zIndex: 0,
        }}
      />

      {/* Hexagon */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          right: '5%',
          width: 40,
          height: 40,
          background: 'rgba(118, 75, 162, 0.22)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          zIndex: 0,
        }}
      />

      {/* Floating Elements */}
      {/* Small dots pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(102, 126, 234, 0.6)',
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 20,
            left: 15,
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'rgba(118, 75, 162, 0.5)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 35,
            left: 5,
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: 'rgba(102, 126, 234, 0.4)',
          },
        }}
      />

      {/* More floating dots */}
      <Box
        sx={{
          position: 'absolute',
          top: '45%',
          left: '12%',
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: 'rgba(118, 75, 162, 0.55)',
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 25,
            left: 20,
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: 'rgba(102, 126, 234, 0.45)',
          },
        }}
      />

      {/* Decorative lines */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '10%',
          width: 60,
          height: 2,
          background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.5) 0%, transparent 100%)',
          transform: 'rotate(-45deg)',
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          right: '8%',
          width: 80,
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(118, 75, 162, 0.5) 100%)',
          transform: 'rotate(45deg)',
          zIndex: 0,
        }}
      />

      {/* Additional decorative lines */}
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '15%',
          width: 45,
          height: 1.5,
          background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.4) 0%, transparent 100%)',
          transform: 'rotate(30deg)',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '45%',
          right: '18%',
          width: 55,
          height: 1.5,
          background: 'linear-gradient(90deg, transparent 0%, rgba(118, 75, 162, 0.4) 100%)',
          transform: 'rotate(-30deg)',
          zIndex: 0,
        }}
      />

      {/* Wave-like elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: 80,
          height: 20,
          background: 'rgba(102, 126, 234, 0.15)',
          borderRadius: '50%',
          transform: 'rotate(-20deg)',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '25%',
          width: 100,
          height: 25,
          background: 'rgba(118, 75, 162, 0.15)',
          borderRadius: '50%',
          transform: 'rotate(25deg)',
          zIndex: 0,
        }}
      />

      {/* Subtle grid pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(102, 126, 234, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(102, 126, 234, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 0,
        }}
      />
      
      <CssBaseline />
      <Container 
        component="main" 
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default AuthLayout;
