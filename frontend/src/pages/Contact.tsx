import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  Fade,
  Slide,
  Grow,
  Alert,
  Snackbar,
  IconButton,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Email,
  Phone,
  LocationOn,
  Schedule,
  Send,
  Support,
  AutoAwesome,
  ContactSupport,
  Business,
  AccessTime,
  ExpandMore,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  WhatsApp,
  Telegram,
  Star,
  CheckCircle,
  Speed,
  Security,
  HeadsetMic,
} from '@mui/icons-material';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    setSnackbar({
      open: true,
      message: 'Pesan Anda telah berhasil dikirim! Kami akan segera menghubungi Anda.',
      severity: 'success',
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Email',
      value: 'info@eventhub.com',
      description: 'Kirim email kepada kami',
      color: 'linear-gradient(135deg, #667eea, #764ba2)',
      action: 'mailto:info@eventhub.com',
    },
    {
      icon: <Phone sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Telepon',
      value: '+62 21 1234 5678',
      description: 'Hubungi kami langsung',
      color: 'linear-gradient(135deg, #11998e, #38ef7d)',
      action: 'tel:+622112345678',
    },
    {
      icon: <WhatsApp sx={{ fontSize: 40, color: 'white' }} />,
      title: 'WhatsApp',
      value: '+62 812 3456 7890',
      description: 'Chat dengan kami',
      color: 'linear-gradient(135deg, #25D366, #128C7E)',
      action: 'https://wa.me/6281234567890',
    },
    {
      icon: <LocationOn sx={{ fontSize: 40, color: 'white' }} />,
      title: 'Alamat',
      value: 'Jakarta, Indonesia',
      description: 'Kantor pusat kami',
      color: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
      action: 'https://maps.google.com',
    },
  ];

  const supportChannels = [
    {
      title: 'Live Chat',
      description: 'Dapatkan bantuan instan melalui live chat',
      icon: <HeadsetMic />,
      color: '#9c27b0',
      available: '24/7',
    },
    {
      title: 'Email Support',
      description: 'Kirim email dan dapatkan respon dalam 2 jam',
      icon: <Email />,
      color: '#2196f3',
      available: '24/7',
    },
    {
      title: 'Phone Support',
      description: 'Hubungi kami untuk bantuan langsung',
      icon: <Phone />,
      color: '#4caf50',
      available: '09:00 - 18:00',
    },
    {
      title: 'Video Call',
      description: 'Konsultasi langsung melalui video call',
      icon: <Support />,
      color: '#ff9800',
      available: '09:00 - 17:00',
    },
  ];

  const faqItems = [
    {
      question: 'Bagaimana cara mendaftar event?',
      answer: 'Anda dapat mendaftar event dengan membuat akun terlebih dahulu, kemudian pilih event yang diinginkan dan klik tombol "Daftar". Proses pendaftaran sangat mudah dan cepat.',
    },
    {
      question: 'Apakah ada biaya untuk menggunakan platform?',
      answer: 'Platform GOMOMENT gratis untuk digunakan. Beberapa event mungkin memerlukan biaya pendaftaran sesuai dengan penyelenggara event. Semua biaya akan ditampilkan dengan jelas sebelum pendaftaran.',
    },
    {
      question: 'Bagaimana cara mendapatkan sertifikat?',
      answer: 'Sertifikat akan otomatis dikirim ke email Anda setelah mengikuti event dan mengisi daftar hadir dengan token yang diberikan. Sertifikat dapat diunduh dalam format PDF.',
    },
    {
      question: 'Apakah data saya aman?',
      answer: 'Ya, kami menggunakan enkripsi tingkat tinggi untuk melindungi data pribadi Anda dan tidak akan membagikan informasi kepada pihak ketiga. Keamanan data adalah prioritas utama kami.',
    },
    {
      question: 'Bagaimana cara membatalkan pendaftaran?',
      answer: 'Anda dapat membatalkan pendaftaran melalui dashboard pribadi Anda. Batas waktu pembatalan tergantung pada kebijakan event yang diikuti.',
    },
    {
      question: 'Apakah ada aplikasi mobile?',
      answer: 'Ya, kami sedang mengembangkan aplikasi mobile untuk iOS dan Android. Saat ini platform dapat diakses melalui browser mobile dengan tampilan yang responsif.',
    },
  ];

  const socialLinks = [
    { icon: <Facebook />, url: '#', label: 'Facebook', color: '#1877f2' },
    { icon: <Twitter />, url: '#', label: 'Twitter', color: '#1da1f2' },
    { icon: <Instagram />, url: '#', label: 'Instagram', color: '#e4405f' },
    { icon: <LinkedIn />, url: '#', label: 'LinkedIn', color: '#0077b5' },
    { icon: <YouTube />, url: '#', label: 'YouTube', color: '#ff0000' },
    { icon: <Telegram />, url: '#', label: 'Telegram', color: '#0088cc' },
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
              <ContactSupport sx={{ 
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
                    Hubungi Kami
                  </Typography>
                </Box>
            <Typography variant="h5" sx={{ 
              color: '#666', 
              mb: 4,
                    maxWidth: 800,
                    mx: 'auto',
                    lineHeight: 1.6,
            }}>
                  Tim kami siap membantu Anda dengan pertanyaan, saran, atau dukungan teknis. 
                  Jangan ragu untuk menghubungi kami kapan saja.
                </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Star sx={{ color: '#ffd700' }} />}
                label="24/7 Support"
                sx={{ 
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2,
                }}
              />
              <Chip
                icon={<Speed sx={{ color: 'white' }} />}
                label="Respon Cepat"
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
                label="Aman & Terpercaya"
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

      {/* Contact Info Section */}
        <Slide direction="up" in timeout={1200}>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" sx={{ 
              fontWeight: 'bold', 
              mb: 6,
              color: '#9c27b0',
              textAlign: 'center'
            }}>
                Informasi Kontak
              </Typography>
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 4,
            }}>
              {contactInfo.map((info, index) => (
                <Box key={index}>
                  <Grow in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 4,
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                        border: '1px solid rgba(156, 39, 176, 0.2)',
                        boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 20px 40px rgba(156, 39, 176, 0.25)',
                        },
                      }}
                      onClick={() => window.open(info.action, '_blank')}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: info.color,
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
                          }}
                        >
                          {info.icon}
                        </Box>
                        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold" color="primary">
                          {info.title}
                        </Typography>
                        <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
                          {info.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {info.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grow>
                </Box>
              ))}
            </Box>
          </Box>
        </Slide>

        {/* Support Channels Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" sx={{ 
            fontWeight: 'bold', 
            mb: 6,
            color: '#9c27b0',
            textAlign: 'center'
          }}>
            Saluran Dukungan
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4,
          }}>
            {supportChannels.map((channel, index) => (
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
                        color: channel.color, 
                        mb: 3, 
                        display: 'flex', 
                        justifyContent: 'center' 
                      }}>
                        {channel.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#1e293b' }}>
                        {channel.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {channel.description}
                      </Typography>
                      <Chip 
                        label={channel.available} 
                        size="small"
                        sx={{ 
                          backgroundColor: channel.color,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </CardContent>
                  </Card>
                </Slide>
              </Box>
            ))}
          </Box>
        </Box>

      {/* Contact Form Section */}
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
                    Kirim Pesan
                  </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 6, textAlign: 'center', lineHeight: 1.6 }}>
                    Isi formulir di bawah ini dan kami akan segera menghubungi Anda. 
                    Tim support kami siap membantu 24/7.
                  </Typography>

              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                gap: 6,
              }}>
                <Box>
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Support sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        Dukungan 24/7
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Tim kami siap membantu Anda kapan saja dengan respon cepat dan solusi terbaik.
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Business sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        Profesional
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Didukung oleh tim yang berpengalaman dan berdedikasi untuk memberikan layanan terbaik.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
                      Ikuti Kami
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {socialLinks.map((social, index) => (
                        <IconButton
                          key={index}
                          sx={{
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            color: social.color,
                            '&:hover': {
                              backgroundColor: social.color,
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
            </Box>

            <Box>
                  <form onSubmit={handleSubmit}>
                    <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        gap: 3,
                    }}>
                      <Box>
                        <TextField
                          fullWidth
                          label="Nama Lengkap"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                      <Box>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                        <TextField
                          fullWidth
                          label="Subjek"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                        <TextField
                          fullWidth
                          label="Pesan"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          multiline
                          rows={4}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<Send />}
                          sx={{
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #7b1fa2, #1976d2)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Kirim Pesan
                        </Button>
                      </Box>
                    </Box>
                  </form>
            </Box>
          </Box>
            </CardContent>
          </Card>
        </Fade>

      {/* FAQ Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" sx={{ 
            fontWeight: 'bold', 
            mb: 6,
            color: '#9c27b0',
            textAlign: 'center'
          }}>
            Pertanyaan Umum
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
            Jawaban untuk pertanyaan yang sering diajukan
          </Typography>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
          }}>
          {faqItems.map((faq, index) => (
            <Box key={index}>
              <Fade in timeout={1000 + index * 200}>
                  <Accordion sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                    '&:before': {
                      display: 'none',
                    },
                    '&.Mui-expanded': {
                      margin: 0,
                    },
                  }}>
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: '#9c27b0' }} />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          margin: '16px 0',
                    },
                  }}
                >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AutoAwesome sx={{ color: 'primary.main', mr: 2 }} />
                        <Typography variant="h6" fontWeight="bold" color="primary">
                        {faq.question}
                      </Typography>
                    </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {faq.answer}
                    </Typography>
                    </AccordionDetails>
                  </Accordion>
              </Fade>
            </Box>
          ))}
          </Box>
        </Box>

      {/* Snackbar for form submission */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default Contact;

