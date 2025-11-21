import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  CheckCircle,
  Cancel,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/api';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const ResetPasswordWithToken: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = window.location.pathname.split('/reset-password/')[1];
  const email = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });

  // Password requirements
  const passwordRequirements: PasswordRequirement[] = [
    {
      label: 'Minimal 8 karakter',
      test: (pwd) => pwd.length >= 8,
    },
    {
      label: 'Mengandung huruf besar (A-Z)',
      test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
      label: 'Mengandung huruf kecil (a-z)',
      test: (pwd) => /[a-z]/.test(pwd),
    },
    {
      label: 'Mengandung angka (0-9)',
      test: (pwd) => /[0-9]/.test(pwd),
    },
    {
      label: 'Mengandung karakter spesial (!@#$%^&*)',
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ];

  useEffect(() => {
    if (!token || !email) {
      setError('Link reset password tidak valid');
    }
  }, [token, email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const togglePasswordVisibility = (field: 'password' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = (password: string): boolean => {
    return passwordRequirements.every(req => req.test(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.password) {
      setError('Password harus diisi');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password tidak memenuhi syarat keamanan');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email: email,
        token: token,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal reset password. Link mungkin sudah kadaluarsa.');
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

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Buat password baru untuk akun Anda
            </Typography>
          </Box>

          {/* Success Message */}
          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                ✅ Password berhasil direset! Anda akan diarahkan ke halaman login...
              </Alert>
              <CircularProgress />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Email Field (Read-only) */}
              <TextField
                fullWidth
                label="Email"
                value={email}
                disabled
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* New Password */}
              <TextField
                fullWidth
                type={showPasswords.password ? 'text' : 'password'}
                label="Password Baru"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('password')}
                        edge="end"
                      >
                        {showPasswords.password ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password Requirements */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Syarat Password:
                </Typography>
                <List dense>
                  {passwordRequirements.map((req, index) => {
                    const isMet = req.test(formData.password);
                    return (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {isMet ? (
                            <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                          ) : (
                            <Cancel sx={{ fontSize: 20, color: 'text.disabled' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={req.label}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: isMet ? 'success.main' : 'text.secondary',
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>

              {/* Confirm Password */}
              <TextField
                fullWidth
                type={showPasswords.confirm ? 'text' : 'password'}
                label="Konfirmasi Password Baru"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                error={
                  formData.confirmPassword !== '' &&
                  formData.password !== formData.confirmPassword
                }
                helperText={
                  formData.confirmPassword !== '' &&
                  formData.password !== formData.confirmPassword
                    ? 'Password tidak cocok'
                    : ''
                }
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !validatePassword(formData.password)}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Reset Password'
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

export default ResetPasswordWithToken;
