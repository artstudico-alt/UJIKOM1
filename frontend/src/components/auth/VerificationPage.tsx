import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/api';

const schema = yup.object().shape({
  email: yup.string().email('Email tidak valid').required('Email wajib diisi'),
  verification_code: yup.string().required('Kode verifikasi wajib diisi'),
});

interface VerificationFormData {
  email: string;
  verification_code: string;
}

const VerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VerificationFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: searchParams.get('email') || '',
      verification_code: '',
    },
  });

  const watchedEmail = watch('email');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerification = async (data: VerificationFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.verifyEmailWithOTP(data);
      setSuccess('Email berhasil diverifikasi! Anda sekarang dapat login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memverifikasi email. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!watchedEmail) {
      setError('Masukkan email terlebih dahulu');
      return;
    }

    setResendLoading(true);
    setError(null);

    try {
      await authService.resendVerificationEmail({ email: watchedEmail });
      setSuccess('Kode verifikasi baru telah dikirim ke email Anda.');
      setCountdown(60); // 60 seconds cooldown
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim kode verifikasi. Silakan coba lagi.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
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
            <CheckCircle sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Verifikasi Email
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Masukkan kode verifikasi yang telah dikirim ke email Anda
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

          <form onSubmit={handleSubmit(handleVerification)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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

              <Controller
                name="verification_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Kode Verifikasi"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.verification_code}
                    helperText={errors.verification_code?.message}
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Verifikasi Email'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleResendCode}
                disabled={resendLoading || countdown > 0}
              >
                {resendLoading ? (
                  <CircularProgress size={20} />
                ) : countdown > 0 ? (
                  `Kirim Ulang (${countdown}s)`
                ) : (
                  'Kirim Ulang Kode'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Sudah punya akun?{' '}
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ textTransform: 'none' }}
                  >
                    Login di sini
                  </Button>
                </Typography>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerificationPage;
