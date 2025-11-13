import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StarsIcon from '@mui/icons-material/Stars';
import { useNavigate } from 'react-router-dom';

const PromoBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 6,
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
        boxShadow: '0 16px 40px rgba(0,0,0,0.1)',
        padding: '2px', // Space for the gradient border
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(120deg, #eb00ff, #4300eb, #eb00ff)',
          backgroundSize: '200% 200%',
          zIndex: 1,
          animation: 'gradient-spin 4s linear infinite',
        }
      }}
    >
      <Box sx={{
        p: 4,
        borderRadius: '15px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 2,
      }}>
        <Box sx={{ position: 'absolute', top: -20, left: -20, opacity: 0.1 }}>
          <StarsIcon sx={{ fontSize: '150px', color: 'primary.main' }} />
        </Box>
        <Box sx={{ position: 'absolute', bottom: -30, right: -20, opacity: 0.8, transform: 'rotate(-30deg)' }}>
          <RocketLaunchIcon sx={{ fontSize: '120px', color: 'secondary.light', opacity: 0.2 }} />
        </Box>
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold" 
            sx={{ 
              mb: 1,
              background: 'linear-gradient(45deg, #4300eb, #eb00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Jelajahi Dunia Event
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Temukan workshop, seminar, dan konferensi terbaik untuk meningkatkan skill dan memperluas jaringan Anda.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default PromoBanner;
