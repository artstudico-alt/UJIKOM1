import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  ContactSupport,
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSnackbar({
      open: true,
      message: 'Pesan Anda telah berhasil dikirim! Kami akan segera menghubungi Anda.',
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <Email />,
      title: 'Email',
      value: 'info@gomoment.com',
    },
    {
      icon: <Phone />,
      title: 'Telepon',
      value: '+62 21 1234 5678',
    },
    {
      icon: <LocationOn />,
      title: 'Alamat',
      value: 'Jakarta, Indonesia',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <ContactSupport sx={{ fontSize: 48, color: '#9c27b0', mb: 2 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#9c27b0', mb: 2 }}>
            Hubungi Kami
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', maxWidth: 700, mx: 'auto' }}>
            Tim kami siap membantu Anda dengan pertanyaan, saran, atau dukungan teknis
          </Typography>
        </Box>

        {/* Contact Info */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3,
          }}>
            {contactInfo.map((info, index) => (
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
                    {info.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    {info.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {info.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Contact Form */}
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 4, textAlign: 'center' }}>
              Kirim Pesan
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gap: 3 }}>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 3,
                }}>
                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Subjek"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Pesan"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  sx={{ py: 1.5 }}
                >
                  Kirim Pesan
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Contact;
