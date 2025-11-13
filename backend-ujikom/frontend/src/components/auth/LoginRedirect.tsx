import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoginRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'event_organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/'); // Redirect to Home page for regular users
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Redirecting...
      </Typography>
    </Box>
  );
};

export default LoginRedirect;
