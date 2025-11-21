import React, { useState } from 'react';
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
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const ResetPassword: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
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

    // Validation
    if (!formData.currentPassword) {
      setError('Password lama harus diisi');
      return;
    }

    if (!formData.newPassword) {
      setError('Password baru harus diisi');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setError('Password baru tidak memenuhi syarat keamanan');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('Password baru harus berbeda dengan password lama');
      return;
    }

    setLoading(true);

    try {
      // Call API to change password
      const response = await authService.changePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword,
      });

      if (response.status === 'success') {
        setSuccess(true);
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengubah password. Pastikan password lama benar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ubah Password
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Pastikan password baru Anda aman dan mudah diingat
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Password berhasil diubah! Silakan gunakan password baru Anda untuk login.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Email Field (Read-only) */}
        <TextField
          fullWidth
          label="Email"
          value={user?.email || ''}
          disabled
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
          helperText="Email tidak dapat diubah"
        />

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <TextField
            fullWidth
            type={showPasswords.current ? 'text' : 'password'}
            label="Password Lama"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* New Password */}
          <TextField
            fullWidth
            type={showPasswords.new ? 'text' : 'password'}
            label="Password Baru"
            name="newPassword"
            value={formData.newPassword}
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
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
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
                const isMet = req.test(formData.newPassword);
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
              formData.newPassword !== formData.confirmPassword
            }
            helperText={
              formData.confirmPassword !== '' &&
              formData.newPassword !== formData.confirmPassword
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
            disabled={loading || !validatePassword(formData.newPassword)}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Mengubah Password...' : 'Ubah Password'}
          </Button>
        </form>

        {/* Security Tips */}
        <Box sx={{ mt: 4, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            💡 Tips Keamanan:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Jangan gunakan password yang sama dengan akun lain
            <br />
            • Hindari menggunakan informasi pribadi (nama, tanggal lahir)
            <br />
            • Ubah password secara berkala (minimal 3 bulan sekali)
            <br />
            • Jangan bagikan password Anda kepada siapapun
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
