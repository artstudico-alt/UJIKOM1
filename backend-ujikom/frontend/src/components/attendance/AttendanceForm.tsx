import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import {
  QrCode,
  CheckCircle,
  Error,
  Event,
  Schedule,
  LocationOn,
} from '@mui/icons-material';
import api from '../../services/api';

interface AttendanceFormProps {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSuccess?: (data: any) => void;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  eventId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  onSuccess
}) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendanceData, setAttendanceData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Masukkan token daftar hadir');
      return;
    }

    if (token.length !== 10) {
      setError('Token harus terdiri dari 10 digit');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/tokens/verify', {
        token: token.trim(),
        event_id: eventId
      });

      if (response.data.status === 'success') {
        setSuccess(response.data.message);
        setAttendanceData(response.data.participant);
        setToken('');
        
        if (onSuccess) {
          onSuccess(response.data.participant);
        }
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      console.error('Attendance verification error:', err);
      setError(err.response?.data?.message || 'Gagal melakukan daftar hadir. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 10) {
      setToken(value);
      setError('');
    }
  };

  // Function to mask email
  const maskEmail = (email: string) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username[0]}***@${domain}`;
    }
    return `${username[0]}${'*'.repeat(username.length - 2)}@${domain}`;
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Card elevation={2} sx={{ 
        borderRadius: 2,
        background: 'white',
        border: '1px solid #e0e0e0',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
          zIndex: 1
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 2, p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              border: '2px solid #e0e0e0'
            }}>
              <QrCode sx={{ fontSize: 30, color: '#666' }} />
            </Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              color: '#333',
              mb: 1
            }}>
              Daftar Hadir
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#666',
              fontWeight: 500
            }}>
              {eventTitle}
            </Typography>
          </Box>

          {/* Event Info */}
          <Paper elevation={1} sx={{ 
            p: 3, 
            mb: 4, 
            background: '#f8f9fa',
            borderRadius: 2
          }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Event sx={{ color: '#666', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    Event
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                    {eventTitle}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Schedule sx={{ color: '#666', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    Waktu
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                    {eventDate} • {eventTime}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOn sx={{ color: '#666', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    Lokasi
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                    {eventLocation}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* Success Message */}
          {success && (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {success}
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert 
              severity="error" 
              icon={<Error />}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Attendance Data Display */}
          {attendanceData && (
            <Paper elevation={1} sx={{ 
              p: 3, 
              mb: 3, 
              background: '#e8f5e8',
              borderRadius: 2,
              border: '1px solid #c8e6c9'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                color: '#2e7d32',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CheckCircle sx={{ color: '#4caf50' }} />
                Kehadiran Berhasil Dikonfirmasi
              </Typography>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Nama:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                    {attendanceData.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Email:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                    {maskEmail(attendanceData.email)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Waktu Daftar Hadir:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                    {new Date().toLocaleString('id-ID')}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Token Input Form */}
          {!attendanceData && (
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ 
                  mb: 2, 
                  color: '#333',
                  fontWeight: 500
                }}>
                  Masukkan token 10 digit yang Anda terima via email:
                </Typography>
                
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Masukkan token 10 digit"
                  value={token}
                  onChange={handleTokenChange}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      letterSpacing: '0.1em',
                      fontFamily: 'monospace',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#4caf50',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4caf50',
                      },
                    },
                  }}
                  inputProps={{
                    maxLength: 10,
                    style: { textAlign: 'center' }
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || token.length !== 10}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #388e3c, #689f38)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#999',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Daftar Hadir'
                )}
              </Button>
            </form>
          )}

          {/* Instructions */}
          <Box sx={{ mt: 4, p: 3, background: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
              <strong>Panduan:</strong> Token dikirim ke email Anda saat mendaftar event. 
              Jika tidak menerima email, periksa folder spam atau hubungi panitia.
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default AttendanceForm;