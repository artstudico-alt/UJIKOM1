import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Divider,
  Paper,
  IconButton,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  CalendarToday,
  LocationOn,
  Person,
  Email,
  Phone,
  ArrowBack,
  Home,
  Event,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  emergency_contact: string;
  emergency_phone: string;
  special_needs?: string;
}

interface EventData {
  id: number;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
}

interface RegistrationSuccessData {
  participant_id: number;
  event_title: string;
  registration_number: string;
  registration_date: string;
}

const RegistrationSuccess: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // Get data from navigation state
  const registrationData: RegistrationData = location.state?.registrationData;
  const event: EventData = location.state?.event;
  const successData: RegistrationSuccessData = location.state?.successData;

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/events');
    }
  }, [countdown, navigate]);

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, dd MMMM yyyy', { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  const formatEventTime = (timeString: string) => {
    try {
      const time = new Date(timeString);
      return format(time, 'HH:mm', { locale: id });
    } catch (error) {
      return timeString;
    }
  };

  if (!registrationData || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Data pendaftaran tidak ditemukan. Silakan coba lagi.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/events')}
          startIcon={<ArrowBack />}
        >
          Kembali ke Daftar Event
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircle 
          sx={{ 
            fontSize: 80, 
            color: 'success.main',
            mb: 2,
            animation: 'pulse 2s infinite'
          }} 
        />
        <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
          Pendaftaran Berhasil!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Terima kasih telah mendaftar untuk event ini
        </Typography>
      </Box>

      {/* Main Content Card */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Event Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
              {event.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {event.description}
            </Typography>

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Tanggal
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {formatEventDate(event.date)}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Waktu
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {formatEventTime(event.start_time)} - {formatEventTime(event.end_time)}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Lokasi
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {event.location}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Registration Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Detail Pendaftaran
            </Typography>

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Nama Lengkap
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {registrationData.name}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {registrationData.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Nomor Telepon
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {registrationData.phone}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Kontak Darurat
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {registrationData.emergency_contact}
                  </Typography>
                </Box>
              </Box>
            </Stack>

            {successData?.registration_number && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nomor Pendaftaran
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {successData.registration_number}
                </Typography>
              </Paper>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Status Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Status Pendaftaran
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<CheckCircle />}
                label="Terdaftar"
                color="success"
                variant="filled"
              />
              <Chip
                label="Gratis"
                color="info"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Important Notes */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Catatan Penting:</strong>
              <br />
              • Simpan nomor pendaftaran Anda untuk referensi
              <br />
              • Event akan muncul di halaman "My Events" Anda
              <br />
              • Pastikan untuk hadir tepat waktu pada hari event
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/events/${eventId}`)}
        >
          Lihat Detail Event
        </Button>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<Event />}
          onClick={() => navigate('/my-events')}
        >
          Lihat My Events
        </Button>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate('/events')}
        >
          Kembali ke Daftar Event
        </Button>
      </Box>

      {/* Auto Redirect Notice */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Otomatis kembali ke daftar event dalam {countdown} detik
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={() => setCountdown(0)}
          sx={{ mt: 1 }}
        >
          Langsung ke Daftar Event
        </Button>
      </Box>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </Container>
  );
};

export default RegistrationSuccess;
