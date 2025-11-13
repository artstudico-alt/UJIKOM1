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
} from '@mui/material';
import {
  Email,
  ArrowBack,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const schema = yup.object().shape({
  email: yup.string().email('Email tidak valid').required('Email wajib diisi'),
});

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.forgotPassword(data.email);
      setSuccess('Link reset password telah dikirim ke email Anda. Silakan cek email Anda.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim link reset password. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
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
              Lupa Password
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Masukkan email Anda untuk menerima link reset password
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

          <form onSubmit={handleSubmit(handleForgotPassword)}>
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
                        <Email color="action" />
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
              {isLoading ? <CircularProgress size={24} /> : 'Kirim Link Reset Password'}
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

export default ForgotPasswordForm;
