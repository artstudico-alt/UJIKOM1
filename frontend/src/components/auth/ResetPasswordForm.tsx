import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/api';
import PasswordRequirements from './PasswordRequirements';

const schema = yup.object().shape({
  email: yup.string().email('Email tidak valid').required('Email wajib diisi'),
  token: yup.string().required('Token wajib diisi'),
  password: yup
    .string()
    .min(8, 'Password minimal 8 karakter')
    .matches(/[A-Z]/, 'Password harus mengandung minimal 1 huruf kapital')
    .matches(/[0-9]/, 'Password harus mengandung minimal 1 angka')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password harus mengandung minimal 1 karakter khusus')
    .required('Password wajib diisi'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
});

interface ResetPasswordFormData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: searchParams.get('email') || '',
      token: searchParams.get('token') || '',
      password: '',
      password_confirmation: '',
    },
  });

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.resetPassword(data);
      setSuccess('Password berhasil direset! Anda sekarang dapat login dengan password baru.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal reset password. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Reset Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Masukkan password baru Anda
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit(handleResetPassword)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="token"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Token"
                  error={!!errors.token}
                  helperText={errors.token?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password Baru"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  onChange={(e) => {
                    field.onChange(e);
                    setPassword(e.target.value);
                  }}
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
                          onClick={handleShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <PasswordRequirements password={password} />

            <Controller
              name="password_confirmation"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Konfirmasi Password Baru"
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!errors.password_confirmation}
                  helperText={errors.password_confirmation?.message}
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
                          onClick={handleShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/login')}
            >
              Kembali ke Login
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordForm;
