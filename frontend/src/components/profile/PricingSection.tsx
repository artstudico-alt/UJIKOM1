import React from 'react';
import {
  Paper,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Zoom,
  Grid,
} from '@mui/material';
import { Star, CheckCircle, WorkspacePremium } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PricingSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tiers = [
    {
      title: 'User',
      price: '0',
      description: [
        'Akses ke semua event publik',
        'Pendaftaran event tanpa batas',
        'Download sertifikat',
        'Dukungan standar',
      ],
      buttonText: user ? (user.role === 'user' ? 'Paket Anda Saat Ini' : 'Pilih Paket') : 'Mulai Sekarang',
      buttonVariant: 'outlined',
      isCurrent: user?.role === 'user',
    },
    {
      title: 'Event Organizer',
      subheader: 'Paling Populer',
      price: '75K',
      unit: '/ bulan',
      description: [
        'Semua fitur di paket User',
        'Upload dan kelola event Anda sendiri',
        'Dashboard analitik event',
        'Promosikan event Anda',
        'Dukungan prioritas',
      ],
      buttonText: user ? (user.role === 'event_organizer' ? 'Paket Anda Saat Ini' : 'Tingkatkan ke Pro') : 'Tingkatkan ke Pro',
      buttonVariant: 'contained',
      isCurrent: user?.role === 'event_organizer',
    },
    {
      title: 'Enterprise',
      price: 'Custom',
      description: [
        'Semua fitur di paket Event Organizer',
        'Manajemen tim & role',
        'Branding kustom',
        'API akses & integrasi',
        'Dukungan khusus 24/7',
      ],
      buttonText: user ? (user.role === 'admin' ? 'Paket Anda Saat Ini' : 'Hubungi Kami') : 'Hubungi Kami',
      buttonVariant: 'outlined',
      isCurrent: user?.role === 'admin',
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mt: 6,
        background: 'transparent',
        borderRadius: 3,
        border: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Zoom in timeout={500}>
          <Box>
            <Chip
              icon={<WorkspacePremium />}
              label="Jadilah Event Organizer"
              color="primary"
              sx={{
                mb: 2,
                fontSize: '1rem',
                fontWeight: 'bold',
                p: 2.5,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
              }}
            />
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Tingkatkan Potensi Anda
            </Typography>
            <Typography variant="h6" sx={{ color: '#666' }}>
              Pilih paket yang tepat untuk mulai membuat dan mengelola event Anda sendiri.
            </Typography>
          </Box>
        </Zoom>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: 4,
          alignItems: 'stretch',
          justifyContent: 'center',
        }}
      >
        {tiers.map((tier, index) => (
          <Zoom in timeout={700 + index * 200} key={tier.title}>
            <Card
              sx={{
                borderRadius: 4,
                border: tier.title === 'Event Organizer' ? '2px solid' : '1px solid',
                borderColor:
                  tier.title === 'Event Organizer'
                    ? 'primary.main'
                    : 'rgba(0, 0, 0, 0.12)',
                transform: tier.title === 'Event Organizer' ? 'scale(1.05)' : 'none',
                boxShadow: tier.title === 'Event Organizer'
                    ? '0 16px 40px rgba(156, 39, 176, 0.2)'
                    : '0 4px 12px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'visible',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {tier.subheader && (
                <Chip
                  icon={<Star />}
                  label={tier.subheader}
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #ff9800, #ff5722)',
                  }}
                />
              )}
              <CardHeader
                title={tier.title}
                titleTypographyProps={{ align: 'center', variant: 'h5', fontWeight: 'bold' }}
                sx={{ pb: 0, pt: tier.subheader ? 4 : 2 }}
              />
              <CardContent sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', my: 2 }}>
                  <Typography component="h2" variant="h3" color="text.primary">
                    {tier.price}
                  </Typography>
                  {tier.unit && (
                    <Typography variant="h6" color="text.secondary">
                      {tier.unit}
                    </Typography>
                  )}
                </Box>
                <List sx={{ mb: 2, flexGrow: 1 }}>
                  {tier.description.map((line) => (
                    <ListItem key={line} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary={line} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant={tier.buttonVariant as 'outlined' | 'contained'}
                  disabled={tier.title !== 'Event Organizer' && tier.isCurrent}
                  sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 2,
                  }}
                  onClick={() => {
                    if (tier.title === 'Event Organizer') {
                      if (user?.role === 'event_organizer' || user?.role === 'admin') {
                        navigate('/organizer/dashboard');
                      } else {
                        navigate('/pricing');
                      }
                    } else {
                      navigate('/events');
                    }
                  }}
                >
                  {tier.title === 'Event Organizer'
                    ? (user?.role === 'event_organizer' || user?.role === 'admin')
                      ? 'Buka Organizer Dashboard'
                      : 'Tingkatkan ke Pro'
                    : tier.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Zoom>
        ))}
      </Box>
    </Paper>
  );
};

export default PricingSection;
