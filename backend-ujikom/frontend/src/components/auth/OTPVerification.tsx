import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  CircularProgress,
} from '@mui/material';
import {
  Security,
  ArrowBack,
  Refresh,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(300); // 5 minutes in seconds
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();

  // Get email from location state or localStorage
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Start countdown for resend
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown, email, navigate]);

  // OTP expiry countdown
  useEffect(() => {
    if (otpExpiry > 0) {
      const timer = setTimeout(() => setOtpExpiry(otpExpiry - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpiry]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Masukkan 6 digit kode OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await verifyOTP(email, otpString);
      setSuccess('✅ Verifikasi berhasil! Mengalihkan ke halaman beranda...');
      localStorage.removeItem('pendingVerificationEmail');
      
      // Redirect after 2 seconds to show success message
      setTimeout(() => {
        navigate('/', { 
          state: { message: 'Akun berhasil diverifikasi! Selamat datang di platform kami.' }
        });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal verifikasi OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await resendOTP(email);
      setSuccess('📧 Kode OTP baru telah dikirim ke email Anda!');
      setCountdown(60);
      setResendDisabled(true);
      setOtpExpiry(300); // Reset OTP expiry to 5 minutes
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim ulang OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegister = () => {
    navigate('/register');
  };

  return (
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
          <Security sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            Verifikasi Email
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
            Kami telah mengirim kode verifikasi 6 digit ke
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main', mt: 1 }}>
            {email}
          </Typography>
          
          {/* Beautiful User Instructions - Purple Transparent */}
          <Box sx={{ 
            mt: 3, 
            p: 3, 
            background: 'rgba(156, 39, 176, 0.08)',
            borderRadius: 3, 
            width: '100%', 
            border: '1px solid rgba(156, 39, 176, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(156, 39, 176, 0.1)',
              opacity: 0.4
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(156, 39, 176, 0.08)',
              opacity: 0.3
            }} />
            
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              mb: 2, 
              color: 'rgba(156, 39, 176, 0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              📧 Periksa Email Anda
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 1.5,
                bgcolor: 'rgba(156, 39, 176, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(156, 39, 176, 0.15)'
              }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(156, 39, 176, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: 'rgba(156, 39, 176, 0.9)',
                  fontWeight: 'bold'
                }}>
                  1
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(156, 39, 176, 0.8)', fontWeight: 'medium' }}>
                  Cek folder <strong>Inbox</strong> atau <strong>Spam</strong>
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 1.5,
                bgcolor: 'rgba(156, 39, 176, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(156, 39, 176, 0.15)'
              }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(156, 39, 176, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: 'rgba(156, 39, 176, 0.9)',
                  fontWeight: 'bold'
                }}>
                  2
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(156, 39, 176, 0.8)', fontWeight: 'medium' }}>
                  Kode OTP berlaku selama <strong>5 menit</strong>
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 1.5,
                bgcolor: 'rgba(156, 39, 176, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(156, 39, 176, 0.15)'
              }}>
                <Box sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(156, 39, 176, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: 'rgba(156, 39, 176, 0.9)',
                  fontWeight: 'bold'
                }}>
                  3
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(156, 39, 176, 0.8)', fontWeight: 'medium' }}>
                  Jika tidak menerima email, klik tombol <strong>"Kirim ulang kode"</strong>
                </Typography>
              </Box>
            </Box>
            
            {/* Additional Info */}
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid rgba(156, 39, 176, 0.2)',
              textAlign: 'center'
            }}>
              <Typography variant="caption" sx={{ 
                color: 'rgba(156, 39, 176, 0.7)',
                fontStyle: 'italic'
              }}>
                💡 Tips: Pastikan email yang didaftarkan sudah benar
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* OTP Input */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
            Masukkan kode OTP yang telah dikirim
          </Typography>
          
          {/* Countdown Timer - No Background, Purple Numbers */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 3,
            p: 2
          }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Waktu tersisa:
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                color: 'rgba(156, 39, 176, 0.9)',
                fontFamily: 'monospace'
              }}
            >
              {formatTime(otpExpiry)}
            </Typography>
                          {otpExpiry <= 60 && otpExpiry > 0 && (
                <Typography variant="caption" color="error.main" sx={{ fontStyle: 'italic' }}>
                  ⚠️ Hampir habis! Masukkan OTP segera
                </Typography>
              )}
              {otpExpiry === 0 && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                  borderRadius: 2,
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" color="error.main" sx={{ 
                    fontWeight: 'bold',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    ⏰ Durasi OTP Telah Habis
                  </Typography>
                  <Typography variant="caption" color="error.main" sx={{ 
                    display: 'block',
                    fontStyle: 'italic'
                  }}>
                    Kode OTP yang Anda masukkan sudah tidak berlaku. Silakan klik tombol "Kirim ulang kode" untuk mendapatkan kode baru.
                  </Typography>
                </Box>
              )}
            </Box>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
            {otp.map((digit, index) => (
              <TextField
                key={index}
                id={`otp-${index}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                variant="outlined"
                size="small"
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }
                }}
                sx={{
                  width: '50px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: digit ? 'primary.main' : 'grey.300',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isLoading || otp.join('').length !== 6 || otpExpiry === 0}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              mb: 2,
              color: 'white',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.38)',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : otpExpiry === 0 ? (
              <span style={{ color: 'inherit' }}>OTP Telah Habis</span>
            ) : (
              <span style={{ color: 'white' }}>Verifikasi OTP</span>
            )}
          </Button>
        </Box>

        {/* Resend OTP */}
        <Box sx={{ width: '100%', textAlign: 'center', mb: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Tidak menerima kode?
          </Typography>
          <Button
            variant="text"
            startIcon={<Refresh />}
            onClick={handleResendOTP}
            disabled={resendDisabled || isLoading}
            sx={{ fontWeight: 'bold' }}
          >
            {resendDisabled 
              ? `Kirim ulang dalam ${countdown}s` 
              : 'Kirim ulang kode'
            }
          </Button>
        </Box>

        {/* Back to Register */}
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={handleBackToRegister}
            disabled={isLoading}
            sx={{ fontWeight: 'bold' }}
          >
            Kembali ke Registrasi
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OTPVerification;
