import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  School,
  LocationOn,
  PersonAdd,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../common/LoadingButton';
import LoadingScreen from '../common/LoadingScreen';
import PasswordRequirements from './PasswordRequirements';

// Validation schema
const schema = yup.object({
  name: yup.string().required('Nama lengkap harus diisi'),
  email: yup
    .string()
    .email('Email harus valid')
    .required('Email harus diisi'),
  phone: yup.string().nullable(),
  education: yup.string().nullable(),
  address: yup.string().nullable(),
  password: yup
    .string()
    .required('Password harus diisi')
    .min(8, 'Password minimal 8 karakter')
    .matches(/[A-Z]/, 'Password harus mengandung minimal 1 huruf kapital')
    .matches(/[0-9]/, 'Password harus mengandung minimal 1 angka')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password harus mengandung minimal 1 karakter khusus'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Password tidak cocok')
    .required('Konfirmasi password harus diisi'),
});

interface RegisterFormData {
  name: string;
  email: string;
  phone?: string | null;
  education?: string | null;
  address?: string | null;
  password: string;
  password_confirmation: string;
}

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      education: '',
      address: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser(data);
      // Save email for OTP verification
      localStorage.setItem('pendingVerificationEmail', data.email);
      navigate('/verification', { state: { email: data.email } });
    } catch (error) {
      // Error already handled by auth context
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const educationOptions = [
    'SD',
    'SMP',
    'SMA/SMK',
    'D3',
    'S1',
    'S2',
    'S3',
  ];

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <PersonAdd sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
              Daftar Akun Baru
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Lengkapi data diri Anda untuk membuat akun
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            {/* Personal Information */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Informasi Pribadi
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
              <Box>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nama Lengkap"
                      variant="outlined"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nomor Telepon"
                      variant="outlined"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.education}>
                    <InputLabel>Pendidikan Terakhir</InputLabel>
                    <Select
                      {...field}
                      label="Pendidikan Terakhir"
                      startAdornment={
                        <InputAdornment position="start">
                          <School />
                        </InputAdornment>
                      }
                    >
                      {educationOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.education && (
                      <Typography variant="caption" color="error">
                        {errors.education.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Alamat Lengkap"
                    variant="outlined"
                    multiline
                    rows={3}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            {/* Account Information */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Informasi Akun
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    error={!!errors.password}
                    onChange={(e) => {
                      field.onChange(e);
                      setPassword(e.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
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
            </Box>

            <Box sx={{ mb: 4 }}>
              <Controller
                name="password_confirmation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Konfirmasi Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    variant="outlined"
                    error={!!errors.password_confirmation}
                    helperText={errors.password_confirmation?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
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
            </Box>

            <LoadingButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={isLoading}
              loadingText="Mendaftar..."
              loadingVariant="gradient"
              shimmer={true}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                },
              }}
            >
              Daftar Sekarang
            </LoadingButton>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  variant="body2"
                  sx={{ fontWeight: 'bold', textDecoration: 'none' }}
                >
                  Masuk di sini
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* Loading Screen */}
      {isLoading && (
        <LoadingScreen 
          message="Sedang memproses pendaftaran..." 
          variant="gradient"
        />
      )}
    </Container>
  );
};

export default RegisterForm;
