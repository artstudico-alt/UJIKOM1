import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Fade,
  Slide,
  Zoom,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Business,
  School,
  People,
  AutoAwesome,
  LocationOn,
  Email,
  Phone,
  Star,
  TrendingUp,
  Security,
  Speed,
  Support,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
} from '@mui/icons-material';

const About: React.FC = () => {
  const eventTypes = [
    {
      name: 'Seminar & Workshop',
      icon: '🎓',
      description: 'Event edukatif untuk meningkatkan pengetahuan dan keterampilan peserta',
      features: ['Materi berkualitas', 'Sertifikat resmi', 'Networking'],
      color: '#4CAF50'
    },
    {
      name: 'Konferensi',
      icon: '🏢',
      description: 'Pertemuan besar untuk membahas topik-topik penting dan terkini',
      features: ['Speaker ahli', 'Panel diskusi', 'Q&A session'],
      color: '#2196F3'
    },
    {
      name: 'Pelatihan',
      icon: '💼',
      description: 'Program pelatihan intensif untuk pengembangan profesional',
      features: ['Hands-on practice', 'Mentoring', 'Portfolio building'],
      color: '#FF9800'
    },
    {
      name: 'Webinar',
      icon: '💻',
      description: 'Event online yang dapat diikuti dari mana saja',
      features: ['Akses global', 'Recording tersedia', 'Interaktif'],
      color: '#9C27B0'
    },
    {
      name: 'Networking',
      icon: '🤝',
      description: 'Kesempatan untuk membangun jaringan profesional',
      features: ['Meet & greet', 'Business matching', 'Partnership'],
      color: '#E91E63'
    },
    {
      name: 'Exhibition',
      icon: '🎪',
      description: 'Pameran untuk showcase produk dan layanan',
      features: ['Booth display', 'Demo produk', 'Lead generation'],
      color: '#00BCD4'
    }
  ];

  const features = [
    {
      title: 'Event Management',
      description: 'Kelola event dengan mudah dan efisien',
      icon: <Business />,
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
      stats: '500+ Events',
    },
    {
      title: 'Sertifikat Digital',
      description: 'Generate sertifikat otomatis untuk peserta',
      icon: <School />,
      color: 'linear-gradient(135deg, #11998e, #38ef7d)',
      stats: '10K+ Certificates',
    },
    {
      title: 'Absensi Digital',
      description: 'Sistem absensi modern dengan token unik',
      icon: <People />,
      color: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
      stats: '50K+ Participants',
    },
    {
      title: 'Dashboard Analytics',
      description: 'Laporan dan statistik lengkap',
      icon: <AutoAwesome />,
      color: 'linear-gradient(135deg, #a8edea, #fed6e3)',
      stats: 'Real-time Data',
    },
  ];

  const stats = [
    { number: '500+', label: 'Events Terselenggara', icon: <Business /> },
    { number: '10K+', label: 'Peserta Terdaftar', icon: <People /> },
    { number: '50+', label: 'Kota di Indonesia', icon: <LocationOn /> },
    { number: '99%', label: 'Tingkat Kepuasan', icon: <Star /> },
  ];

  const values = [
    {
      title: 'Kemudahan',
      description: 'Platform yang mudah digunakan untuk mengelola event dari awal hingga selesai',
      icon: <AutoAwesome />,
    },
    {
      title: 'Keamanan Data',
      description: 'Data peserta dan event terlindungi dengan sistem keamanan berlapis',
      icon: <Security />,
    },
    {
      title: 'Efisiensi',
      description: 'Proses pendaftaran, absensi, dan sertifikat yang otomatis dan cepat',
      icon: <Speed />,
    },
    {
      title: 'Dukungan Penuh',
      description: 'Tim support siap membantu setiap tahap penyelenggaraan event',
      icon: <Support />,
    },
  ];

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Twitter />, url: '#', label: 'Twitter' },
    { icon: <Instagram />, url: '#', label: 'Instagram' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn' },
    { icon: <YouTube />, url: '#', label: 'YouTube' },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 20%, rgba(156, 39, 176, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(33, 150, 243, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(244, 67, 54, 0.08) 0%, transparent 50%),
        #f8f9fa
      `,
          position: 'relative',
          overflow: 'hidden',
    }}>
      {/* Background Decorative Elements */}
      <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        zIndex: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(156, 39, 176, 0.1), rgba(33, 150, 243, 0.1))',
          animation: 'float 8s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '15%',
          left: '3%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(244, 67, 54, 0.08), rgba(156, 39, 176, 0.08))',
          animation: 'float 10s ease-in-out infinite reverse',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(180deg)' },
        }
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
        {/* Hero Section */}
            <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <AutoAwesome sx={{ 
                fontSize: 48, 
                mr: 2, 
                color: '#9c27b0',
                animation: 'glow 2s ease-in-out infinite alternate',
                '@keyframes glow': {
                  '0%': { filter: 'drop-shadow(0 0 5px rgba(156, 39, 176, 0.3))' },
                  '100%': { filter: 'drop-shadow(0 0 20px rgba(156, 39, 176, 0.6))' },
                }
              }} />
              <Typography variant="h2" component="h1" sx={{ 
                fontWeight: 'bold', 
                color: '#9c27b0',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}>
                    Tentang Platform Event Management
                  </Typography>
                </Box>
            <Typography variant="h5" sx={{ 
              color: '#666', 
              mb: 4,
                    maxWidth: 800,
                    mx: 'auto',
                    lineHeight: 1.6,
            }}>
              Solusi lengkap untuk mengelola event, seminar, workshop, dan kegiatan lainnya dengan sistem pendaftaran, absensi digital, dan sertifikat otomatis
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Star sx={{ color: '#ffd700' }} />}
                label="Terpercaya"
                sx={{ 
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2,
                }}
              />
              <Chip
                icon={<TrendingUp sx={{ color: 'white' }} />}
                label="Inovatif"
                sx={{ 
                  backgroundColor: '#2196f3',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2,
                }}
              />
              <Chip
                icon={<Security sx={{ color: 'white' }} />}
                label="Aman"
                sx={{ 
                  backgroundColor: '#4caf50',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2,
                }}
              />
              </Box>
          </Box>
        </Fade>

      {/* Stats Section */}
        <Slide direction="up" in timeout={1200}>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" sx={{ 
              fontWeight: 'bold', 
              mb: 6,
              color: '#9c27b0',
              textAlign: 'center'
            }}>
                Pencapaian Kami
              </Typography>
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 4,
            }}>
              {stats.map((stat, index) => (
                <Box key={index}>
                  <Zoom in timeout={1000 + index * 200}>
                    <Card sx={{
                        textAlign: 'center',
                      p: 4,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                      border: '1px solid rgba(156, 39, 176, 0.2)',
                      boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(156, 39, 176, 0.25)',
                        },
                    }}>
                      <CardContent>
                        <Box sx={{ 
                          color: '#9c27b0', 
                          mb: 2, 
                            display: 'flex',
                          justifyContent: 'center' 
                        }}>
                          {stat.icon}
                        </Box>
                        <Typography variant="h3" component="div" sx={{ 
                          fontWeight: 'bold', 
                          color: '#9c27b0',
                          mb: 1,
                        }}>
                          {stat.number}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#666' }}>
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Box>
              ))}
            </Box>
          </Box>
        </Slide>

        {/* Mission Section */}
        <Fade in timeout={1400}>
          <Card sx={{ 
            mb: 8, 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(156, 39, 176, 0.2)',
            boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #9c27b0, #2196f3, #f44336)',
            },
          }}>
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 4, textAlign: 'center' }}>
                Misi Kami
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ 
                textAlign: 'center', 
                lineHeight: 1.8,
                maxWidth: 800,
                mx: 'auto',
              }}>
                Menyediakan platform yang mudah digunakan untuk mengelola event, absensi, dan sertifikat digital. 
                Kami berkomitmen untuk memberikan pengalaman terbaik bagi penyelenggara event dan peserta.
              </Typography>
            </CardContent>
          </Card>
        </Fade>

      {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 6, textAlign: 'center' }}>
            Fitur Unggulan
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4,
          }}>
          {features.map((feature, index) => (
            <Box key={index}>
                <Zoom in timeout={1000 + index * 200}>
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(156, 39, 176, 0.25)',
                    },
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ 
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: feature.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(5deg)',
                          transition: 'all 0.3s ease',
                        },
                      }}>
                      {feature.icon}
                    </Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                      {feature.title}
                    </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                      <Chip 
                        label={feature.stats} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#9c27b0',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                  </CardContent>
                </Card>
                </Zoom>
            </Box>
          ))}
          </Box>
        </Box>

        {/* Values Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 6, textAlign: 'center' }}>
            Nilai-Nilai Kami
            </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4,
          }}>
            {values.map((value, index) => (
              <Box key={index}>
                <Slide direction="up" in timeout={1000 + index * 200}>
                  <Card sx={{
                    textAlign: 'center',
                    p: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                      borderRadius: 3,
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      boxShadow: '0 15px 35px rgba(156, 39, 176, 0.2)',
                    },
                  }}>
                    <CardContent>
                      <Box sx={{ 
                        color: '#9c27b0', 
                        mb: 3, 
                        display: 'flex', 
                        justifyContent: 'center' 
                      }}>
                        {value.icon}
                    </Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                        {value.title}
                    </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {value.description}
                    </Typography>
                    </CardContent>
                  </Card>
                </Slide>
              </Box>
            ))}
          </Box>
      </Box>

        {/* Event Types Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 6, textAlign: 'center' }}>
            Jenis Event yang Didukung
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 4,
            justifyContent: 'center',
            maxWidth: 1200,
            mx: 'auto',
          }}>
            {eventTypes.map((eventType, index) => (
              <Box key={index}>
                <Zoom in timeout={1000 + index * 200}>
                  <Card sx={{ 
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(156, 39, 176, 0.25)',
                    },
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ 
                        fontSize: '3rem', 
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${eventType.color}20, ${eventType.color}40)`,
                        border: `2px solid ${eventType.color}`,
                        boxShadow: `0 10px 30px ${eventType.color}30`,
                      }}>
                        {eventType.icon}
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1, color: '#1e293b' }}>
                        {eventType.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {eventType.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {eventType.features.map((feature, featureIndex) => (
                          <Chip 
                            key={featureIndex}
                            label={feature} 
                            size="small"
                            sx={{ 
                              background: `linear-gradient(135deg, ${eventType.color}, ${eventType.color}CC)`,
                              color: 'white',
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Contact Section */}
        <Fade in timeout={1600}>
          <Card sx={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(156, 39, 176, 0.2)',
            boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #9c27b0, #2196f3, #f44336)',
            },
          }}>
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 4, textAlign: 'center' }}>
                Hubungi Kami
              </Typography>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 4,
              }}>
                <Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <LocationOn sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Alamat Kantor
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Jl. Teknologi No. 123<br />
                      Jakarta, Indonesia
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Email
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      info@eventmanagement.com
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Telepon
                  </Typography>
          </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      +62 21 1234 5678
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
                  Ikuti Kami
                  </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {socialLinks.map((social, index) => (
                    <IconButton
                      key={index}
                      sx={{
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        color: '#9c27b0',
                        '&:hover': {
                          backgroundColor: '#9c27b0',
                          color: 'white',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Box>
              </Box>
                </CardContent>
              </Card>
            </Fade>
      </Container>
    </Box>
  );
};

export default About;