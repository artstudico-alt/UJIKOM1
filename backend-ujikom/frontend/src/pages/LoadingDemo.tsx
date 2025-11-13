import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Paper,
} from '@mui/material';
import LoadingScreen from '../components/common/LoadingScreen';
import AdvancedLoadingScreen from '../components/common/AdvancedLoadingScreen';
import LoginLoadingScreen from '../components/common/LoginLoadingScreen';

const LoadingDemo: React.FC = () => {
  const [activeLoading, setActiveLoading] = useState<string | null>(null);

  const basicVariants = [
    { key: 'default', name: 'Default', description: 'Loading screen dengan shimmer effect' },
    { key: 'gradient', name: 'Gradient', description: 'Background gradient yang berubah-ubah' },
    { key: 'minimal', name: 'Minimal', description: 'Desain sederhana dan clean' },
    { key: 'sparkle', name: 'Sparkle', description: 'Efek bintang berkelap-kelip' },
    { key: 'floating', name: 'Floating', description: 'Elemen yang mengambang' },
    { key: 'wave', name: 'Wave', description: 'Efek gelombang di bagian bawah' },
    { key: 'glow', name: 'Glow', description: 'Efek cahaya yang berkedip' },
    { key: 'bounce', name: 'Bounce', description: 'Animasi bouncing' },
    { key: 'morphing', name: 'Morphing', description: 'Bentuk yang berubah-ubah' },
  ];

  const advancedVariants = [
    { key: 'cyber', name: 'Cyber', description: 'Tema cyberpunk dengan grid dan neon' },
    { key: 'hologram', name: 'Hologram', description: 'Efek hologram 3D' },
    { key: 'matrix', name: 'Matrix', description: 'Efek hujan kode seperti di film Matrix' },
    { key: 'quantum', name: 'Quantum', description: 'Partikel quantum yang bergerak' },
    { key: 'liquid', name: 'Liquid', description: 'Bentuk cair yang berubah' },
    { key: 'neon', name: 'Neon', description: 'Efek neon yang menyala' },
    { key: 'particle', name: 'Particle', description: 'Partikel yang mengambang' },
  ];

  const loginVariants = [
    { key: 'purple', name: 'Purple', description: 'Tema ungu dengan gradient' },
    { key: 'blue', name: 'Blue', description: 'Tema biru yang elegan' },
    { key: 'gradient', name: 'Gradient', description: 'Gradient yang berubah-ubah' },
    { key: 'minimal', name: 'Minimal', description: 'Desain minimalis' },
  ];

  const handleShowLoading = (type: string, variant: string) => {
    setActiveLoading(`${type}-${variant}`);
    setTimeout(() => {
      setActiveLoading(null);
    }, 3000);
  };

  const renderLoadingScreen = () => {
    if (!activeLoading) return null;

    const [type, variant] = activeLoading.split('-');

    switch (type) {
      case 'basic':
        return (
          <LoadingScreen
            variant={variant as any}
            message={`Loading ${variant}...`}
            fullScreen={true}
          />
        );
      case 'advanced':
        return (
          <AdvancedLoadingScreen
            variant={variant as any}
            message={`Loading ${variant}...`}
            fullScreen={true}
          />
        );
      case 'login':
        return (
          <LoginLoadingScreen
            variant={variant as any}
            message={`Loading ${variant}...`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        🎨 Loading Screen Gallery
      </Typography>
      
      <Typography variant="body1" align="center" sx={{ mb: 6, color: 'text.secondary' }}>
        Koleksi loading screen yang indah dan modern untuk aplikasi Anda
      </Typography>

      {/* Basic Loading Screens */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
          🎯 Basic Loading Screens
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {basicVariants.map((variant) => (
            <Box key={variant.key} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {variant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {variant.description}
                  </Typography>
                  <Chip 
                    label="Basic" 
                    color="primary" 
                    size="small" 
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleShowLoading('basic', variant.key)}
                    disabled={activeLoading !== null}
                  >
                    Preview
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Advanced Loading Screens */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
          🚀 Advanced Loading Screens
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {advancedVariants.map((variant) => (
            <Box key={variant.key} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {variant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {variant.description}
                  </Typography>
                  <Chip 
                    label="Advanced" 
                    color="secondary" 
                    size="small" 
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    onClick={() => handleShowLoading('advanced', variant.key)}
                    disabled={activeLoading !== null}
                  >
                    Preview
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Login Loading Screens */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
          🔐 Login Loading Screens
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {loginVariants.map((variant) => (
            <Box key={variant.key} sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {variant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {variant.description}
                  </Typography>
                  <Chip 
                    label="Login" 
                    color="success" 
                    size="small" 
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleShowLoading('login', variant.key)}
                    disabled={activeLoading !== null}
                  >
                    Preview
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Usage Instructions */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          📖 Cara Penggunaan
        </Typography>
        <Typography variant="body1" paragraph>
          Loading screen ini dapat digunakan di berbagai bagian aplikasi:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Basic Loading Screens:</strong> Untuk loading umum di halaman atau komponen
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Advanced Loading Screens:</strong> Untuk loading yang membutuhkan efek visual yang menakjubkan
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Login Loading Screens:</strong> Khusus untuk proses login dan autentikasi
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Klik tombol "Preview" untuk melihat animasi loading screen. Setiap preview akan berlangsung selama 3 detik.
        </Typography>
      </Paper>

      {/* Render Active Loading Screen */}
      {renderLoadingScreen()}
    </Container>
  );
};

export default LoadingDemo;
