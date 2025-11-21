import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  ArrowBack,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim email reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        background: 'white',
      }}
    >
      {/* Background Decorations */}
      {/* Large Background Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%)',
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)',
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.18) 0%, rgba(118, 75, 162, 0.18) 100%)',
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -120,
          right: -120,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.15) 0%, rgba(102, 126, 234, 0.15) 100%)',
          zIndex: 0,
        }}
      />

      {/* Geometric Shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: 0,
          height: 0,
          borderLeft: '25px solid transparent',
          borderRight: '25px solid transparent',
          borderBottom: '40px solid rgba(102, 126, 234, 0.3)',
          transform: 'rotate(15deg)',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '12%',
          width: 30,
          height: 30,
          background: 'rgba(118, 75, 162, 0.25)',
          transform: 'rotate(45deg)',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          width: 35,
          height: 35,
          background: 'rgba(102, 126, 234, 0.28)',
          transform: 'rotate(45deg)',
          zIndex: 0,
        }}
      />

      {/* Subtle grid pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(102, 126, 234, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(102, 126, 234, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Lupa Password?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password
            </Typography>
          </Box>

          {/* Success Message */}
          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                ✅ Email reset password telah dikirim! Silakan cek inbox Anda.
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Kami telah mengirimkan link reset password ke <strong>{email}</strong>.
                Link akan kadaluarsa dalam 60 menit.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tidak menerima email? Cek folder spam atau klik tombol di bawah untuk kirim ulang.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSuccess(false)}
                sx={{ mb: 2 }}
              >
                Kirim Ulang Email
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Email Field */}
              <TextField
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Kirim Link Reset Password'
                )}
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              component={Link}
              to="/login"
              startIcon={<ArrowBack />}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  background: 'transparent',
                  color: 'primary.main',
                },
              }}
            >
              Kembali ke Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
