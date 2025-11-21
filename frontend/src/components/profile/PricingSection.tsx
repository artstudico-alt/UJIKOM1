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
      title: 'Basic',
      price: 'Gratis',
      description: [
        'Akses ke semua event publik',
        'Pendaftaran event tanpa batas',
        'Download sertifikat digital',
        'Notifikasi event',
        'Dukungan email',
      ],
      buttonText: user ? (user.role === 'user' ? 'Paket Anda Saat Ini' : 'Pilih Paket') : 'Mulai Gratis',
      buttonVariant: 'outlined',
      isCurrent: user?.role === 'user',
    },
    {
      title: 'Event Organizer',
      subheader: 'Paling Populer',
      price: '99.000',
      unit: '/ bulan',
      description: [
        'Semua fitur Basic',
        'Buat & kelola unlimited event',
        'Dashboard analitik lengkap',
        'Manajemen peserta & sertifikat',
        'QR Code check-in',
        'Export data peserta',
        'Dukungan prioritas',
      ],
      buttonText: user ? (user.role === 'event_organizer' ? 'Paket Anda Saat Ini' : 'Upgrade Sekarang') : 'Upgrade Sekarang',
      buttonVariant: 'contained',
      isCurrent: user?.role === 'event_organizer',
    },
    {
      title: 'Enterprise',
      price: '499.000',
      unit: '/ bulan',
      description: [
        'Semua fitur Event Organizer',
        'Multi-user & team management',
        'White-label branding',
        'Custom domain',
        'API access & integrasi',
        'Dedicated account manager',
        'Support 24/7',
      ],
      buttonText: user ? (user.role === 'admin' ? 'Paket Anda Saat Ini' : 'Hubungi Sales') : 'Hubungi Sales',
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
        <Box>
          <Chip
            icon={<WorkspacePremium />}
            label="Jadilah Event Organizer"
            sx={{
              mb: 3,
              fontSize: '0.95rem',
              fontWeight: 600,
              px: 3,
              py: 2.5,
              bgcolor: '#667eea',
              color: 'white',
            }}
          />
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: '#667eea',
            }}
          >
            Paket Harga Event Organizer
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
            Pilih paket yang sesuai dengan kebutuhan Anda
          </Typography>
        </Box>
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
            <Card
              key={tier.title}
              sx={{
                borderRadius: 3,
                border: tier.title === 'Event Organizer' ? '2px solid #667eea' : '1px solid rgba(0, 0, 0, 0.12)',
                transform: tier.title === 'Event Organizer' ? 'scale(1.03)' : 'none',
                boxShadow: tier.title === 'Event Organizer'
                    ? '0 8px 24px rgba(102, 126, 234, 0.15)'
                    : '0 2px 8px rgba(0, 0, 0, 0.08)',
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
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 600,
                    bgcolor: '#667eea',
                    color: 'white',
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
                        // Redirect to payment upgrade page
                        navigate('/payment/upgrade');
                      }
                    } else if (tier.title === 'Enterprise') {
                      // Contact sales untuk enterprise
                      window.location.href = 'mailto:sales@gomoment.com?subject=Enterprise%20Plan%20Inquiry';
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
        ))}
      </Box>
    </Paper>
  );
};

export default PricingSection;
