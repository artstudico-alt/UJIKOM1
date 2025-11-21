import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Business,
  School,
  People,
  AutoAwesome,
  Star,
  TrendingUp,
  Security,
} from '@mui/icons-material';

const About: React.FC = () => {
  const stats = [
    { number: '500+', label: 'Events', icon: <Business /> },
    { number: '10K+', label: 'Peserta', icon: <People /> },
    { number: '99%', label: 'Kepuasan', icon: <Star /> },
  ];

  const features = [
    {
      title: 'Event Management',
      description: 'Kelola event dengan mudah',
      icon: <Business />,
    },
    {
      title: 'Sertifikat Digital',
      description: 'Generate sertifikat otomatis',
      icon: <School />,
    },
    {
      title: 'Absensi Digital',
      description: 'Sistem absensi modern',
      icon: <People />,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <AutoAwesome sx={{ fontSize: 48, color: '#9c27b0', mb: 2 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#9c27b0', mb: 2 }}>
            Tentang GOMOMENT
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', mb: 4, maxWidth: 700, mx: 'auto' }}>
            Platform manajemen event profesional untuk seminar, workshop, dan kegiatan lainnya
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip icon={<Star />} label="Terpercaya" color="primary" />
            <Chip icon={<TrendingUp />} label="Inovatif" color="primary" />
            <Chip icon={<Security />} label="Aman" color="primary" />
          </Box>
        </Box>

        {/* Stats Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3,
          }}>
            {stats.map((stat, index) => (
              <Card key={index} sx={{ textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Box sx={{ color: '#9c27b0', mb: 2 }}>{stat.icon}</Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9c27b0', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Mission */}
        <Card sx={{ mb: 8, p: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 3, textAlign: 'center' }}>
              Misi Kami
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.8 }}>
              Menyediakan platform yang mudah digunakan untuk mengelola event, absensi, dan sertifikat digital. 
              Kami berkomitmen memberikan pengalaman terbaik bagi penyelenggara event dan peserta.
            </Typography>
          </CardContent>
        </Card>

        {/* Features */}
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 4, textAlign: 'center' }}>
            Fitur Unggulan
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3,
          }}>
            {features.map((feature, index) => (
              <Card key={index} sx={{ textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Box sx={{ 
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: 'white',
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
