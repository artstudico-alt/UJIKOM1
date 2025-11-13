import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
  Fade,
  Slide,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  Phone,
  LocationOn,
  AccessTime,
  AutoAwesome,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook' },
    { icon: <Twitter />, url: '#', label: 'Twitter' },
    { icon: <Instagram />, url: '#', label: 'Instagram' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn' },
    { icon: <YouTube />, url: '#', label: 'YouTube' },
  ];

  const quickLinks = [
    { name: 'Beranda', url: '/' },
    { name: 'Tentang Kami', url: '/about' },
    { name: 'Event', url: '/events' },
    { name: 'Kontak', url: '/contact' },
    { name: 'Pencarian Sertifikat', url: '/certificates/search' },
  ];

  const services = [
    { name: 'Event Management', url: '#' },
    { name: 'Sertifikat Digital', url: '#' },
    { name: 'Attendance System', url: '#' },
    { name: 'Dashboard Analytics', url: '#' },
    { name: 'Export Data', url: '#' },
  ];

  const contactInfo = [
    {
      icon: <LocationOn sx={{ color: 'primary.main' }} />,
      text: 'Jl. Sudirman No. 123, Jakarta Pusat, Indonesia',
    },
    {
      icon: <Phone sx={{ color: 'primary.main' }} />,
      text: '+62 21 1234 5678',
    },
    {
      icon: <Email sx={{ color: 'primary.main' }} />,
      text: 'info@eventhub.com',
    },
    {
      icon: <AccessTime sx={{ color: 'primary.main' }} />,
      text: 'Senin - Jumat: 09:00 - 18:00 WIB',
    },
  ];

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 20s ease-in-out infinite',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Main Footer Content */}
        <Box sx={{ py: 6 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: '2fr 1fr 1fr 2fr',
              },
              gap: 4,
            }}
          >
            {/* Company Info */}
            <Box>
              <Slide direction="up" in timeout={800}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <img 
                      src="/images/logoGOMOMENT.png" 
                      alt="GOMOMENT"
                      style={{
                        height: '48px',
                        width: 'auto',
                        marginRight: '16px'
                      }}
                    />
                  </Box>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, opacity: 0.9 }}>
                    Platform event management terdepan di Indonesia yang menyediakan solusi lengkap untuk 
                    pengelolaan event, sistem sertifikat digital, dan verifikasi kehadiran yang terpercaya.
                  </Typography>
                  
                  {/* Social Media Links */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {socialLinks.map((social, index) => (
                      <Fade in timeout={1000 + index * 200} key={social.label}>
                        <IconButton
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                          aria-label={social.label}
                        >
                          {social.icon}
                        </IconButton>
                      </Fade>
                    ))}
                  </Box>
                </Box>
              </Slide>
            </Box>

            {/* Quick Links */}
            <Box>
              <Slide direction="up" in timeout={1000}>
                <Box>
                  <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 3, color: '#667eea' }}>
                    Quick Links
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {quickLinks.map((link, index) => (
                      <Fade in timeout={1200 + index * 100} key={link.name}>
                        <Link
                          href={link.url}
                          sx={{
                            color: 'white',
                            textDecoration: 'none',
                            opacity: 0.9,
                            '&:hover': {
                              opacity: 1,
                              color: '#667eea',
                              transform: 'translateX(5px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {link.name}
                        </Link>
                      </Fade>
                    ))}
                  </Box>
                </Box>
              </Slide>
            </Box>

            {/* Services */}
            <Box>
              <Slide direction="up" in timeout={1200}>
                <Box>
                  <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 3, color: '#667eea' }}>
                    Layanan
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {services.map((service, index) => (
                      <Fade in timeout={1400 + index * 100} key={service.name}>
                        <Link
                          href={service.url}
                          sx={{
                            color: 'white',
                            textDecoration: 'none',
                            opacity: 0.9,
                            '&:hover': {
                              opacity: 1,
                              color: '#667eea',
                              transform: 'translateX(5px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {service.name}
                        </Link>
                      </Fade>
                    ))}
                  </Box>
                </Box>
              </Slide>
            </Box>

            {/* Contact Info */}
            <Box>
              <Slide direction="up" in timeout={1400}>
                <Box>
                  <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 3, color: '#667eea' }}>
                    Kontak Kami
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {contactInfo.map((contact, index) => (
                      <Fade in timeout={1600 + index * 200} key={contact.text}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Box sx={{ mt: 0.5 }}>
                            {contact.icon}
                          </Box>
                          <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                            {contact.text}
                          </Typography>
                        </Box>
                      </Fade>
                    ))}
                  </Box>
                </Box>
              </Slide>
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Bottom Footer */}
        <Box sx={{ py: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Box>
              <Fade in timeout={1800}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  © {currentYear} GOMOMENT. All rights reserved.
                </Typography>
              </Fade>
            </Box>
            <Box>
              <Fade in timeout={2000}>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 3 }}>
                  <Link
                    href="#"
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      opacity: 0.8,
                      fontSize: '0.875rem',
                      '&:hover': {
                        opacity: 1,
                        color: '#667eea',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="#"
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      opacity: 0.8,
                      fontSize: '0.875rem',
                      '&:hover': {
                        opacity: 1,
                        color: '#667eea',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href="#"
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      opacity: 0.8,
                      fontSize: '0.875rem',
                      '&:hover': {
                        opacity: 1,
                        color: '#667eea',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Cookie Policy
                  </Link>
                </Box>
              </Fade>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Back to Top Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Fade in timeout={2500}>
          <IconButton
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
              },
              transition: 'all 0.3s ease',
            }}
            aria-label="Back to top"
          >
            <AutoAwesome />
          </IconButton>
        </Fade>
      </Box>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Box>
  );
};

export default Footer;
