import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Link,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingButton from '../common/LoadingButton';
import LoginLoadingScreen from '../common/LoginLoadingScreen';

// Validation schema
const schema = yup.object({
  email: yup
    .string()
    .email('Email harus valid')
    .required('Email harus diisi'),
  password: yup
    .string()
    .required('Password harus diisi')
    .min(8, 'Password minimal 8 karakter'),
  remember: yup.boolean(),
});

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      clearError();
      await login(data.email, data.password, data.remember);
      // Redirect will be handled by LoginRedirect component
      // User will be redirected to /events or /admin based on role
    } catch (error) {
      // Error already handled by auth context
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <LoginIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography component="h1" variant="h4" fontWeight="bold">
              Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Masuk ke akun Anda
            </Typography>
          </Box>

          {/* Success Message from OTP Verification */}
          {location.state?.message && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {location.state.message}
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            {/* Email Field */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              )}
            />

            {/* Remember Me & Forgot Password */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="primary"
                      />
                    }
                    label="Ingat saya"
                  />
                )}
              />
              <Link href="/forgot-password" variant="body2" underline="hover">
                Lupa password?
              </Link>
            </Box>

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={isLoading}
              loadingText="Memproses..."
              loadingVariant="gradient"
              shimmer={true}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                },
              }}
            >
              Login
            </LoadingButton>

            {/* Register Link */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Belum punya akun?{' '}
                <Link href="/register" variant="body2" underline="hover" fontWeight="bold">
                  Daftar di sini
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* Loading Screen */}
      {isLoading && (
        <LoginLoadingScreen 
          message="Sedang memproses login..." 
          variant="purple"
        />
      )}
    </Container>
  );
};

export default LoginForm;
