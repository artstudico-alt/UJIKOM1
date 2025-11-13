import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Event as OrganizerIcon,
  Person as UserIcon,
} from '@mui/icons-material';

interface LoginCredentialsProps {
  onCredentialSelect: (email: string, password: string) => void;
}

const LoginCredentials: React.FC<LoginCredentialsProps> = ({ onCredentialSelect }) => {
  const credentials = [
    {
      role: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      icon: <AdminIcon />,
      color: '#f44336',
      description: 'Akses penuh ke sistem admin'
    },
    {
      role: 'Event Organizer',
      email: 'organizer@example.com',
      password: 'password123',
      icon: <OrganizerIcon />,
      color: '#4f46e5',
      description: 'Kelola event dan peserta'
    },
    {
      role: 'User',
      email: 'john.doe@example.com',
      password: 'password123',
      icon: <UserIcon />,
      color: '#10b981',
      description: 'Daftar dan ikuti event'
    }
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: 3, background: '#f8f9fa', mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
        🚀 Demo Credentials
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Klik salah satu untuk login otomatis
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {credentials.map((cred, index) => (
          <Card 
            key={index}
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }
            }}
            onClick={() => onCredentialSelect(cred.email, cred.password)}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  color: cred.color,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {cred.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: cred.color }}>
                    {cred.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {cred.description}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                    {cred.email}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    {cred.password}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
        💡 Atau masukkan kredensial manual di form login
      </Typography>
    </Paper>
  );
};

export default LoginCredentials;
