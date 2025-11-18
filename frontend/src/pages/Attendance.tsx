import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Event,
  Schedule,
  LocationOn,
  People,
} from '@mui/icons-material';
import AttendanceForm from '../components/attendance/AttendanceForm';
import api from '../services/api';

interface EventData {
  id: number;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  current_participants: number;
  price: number;
  status: string;
}

const Attendance: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${eventId}`);
      
      if (response.data.status === 'success') {
        setEvent(response.data.data);
      } else {
        setError('Event tidak ditemukan');
      }
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError('Gagal memuat data event');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSuccess = (data: any) => {
    setAttendanceSuccess(true);
  };

  const handleBackToEvents = () => {
    navigate('/events');
  };

  // Check if attendance is open (event has started)
  const isAttendanceOpen = () => {
    if (!event) return false;
    
    const now = new Date();
    const eventDateStr = event.date;
    const eventStartTime = event.start_time || '00:00';
    
    // Combine date and time
    const [hours, minutes] = eventStartTime.split(':').map(Number);
    const eventStartDateTime = new Date(eventDateStr);
    eventStartDateTime.setHours(hours, minutes, 0, 0);
    
    // Attendance opens when event starts
    return now >= eventStartDateTime;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={handleBackToEvents}
        >
          Kembali ke Daftar Event
        </Button>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Event tidak ditemukan
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBackToEvents}
            sx={{ mb: 3 }}
          >
            Kembali ke Daftar Event
          </Button>

          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ 
              fontWeight: 'bold', 
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Event sx={{ color: '#667eea', fontSize: 40 }} />
              {event.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {event.description}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ color: '#666' }} />
                <Typography variant="body2">
                  {new Date(event.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} - {event.start_time} - {event.end_time}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#666' }} />
                <Typography variant="body2">{event.location}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People sx={{ color: '#666' }} />
                <Typography variant="body2">
                  {event.current_participants} / {event.max_participants} peserta
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Attendance Form */}
        {isAttendanceOpen() ? (
          <AttendanceForm
            eventId={event.id}
            eventTitle={event.title}
            eventDate={event.date}
            eventTime={`${event.start_time} - ${event.end_time}`}
            eventLocation={event.location}
            onSuccess={handleAttendanceSuccess}
          />
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Daftar Hadir Belum Dibuka
            </Typography>
            <Typography variant="body2">
              Daftar hadir akan dibuka pada saat event dimulai:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
              {new Date(event.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })} pukul {event.start_time}
            </Typography>
          </Alert>
        )}

        {/* Success Message */}
        {attendanceSuccess && (
          <Paper elevation={3} sx={{ 
            p: 3, 
            mt: 4, 
            bgcolor: '#e8f5e8', 
            border: '1px solid #4caf50',
            textAlign: 'center'
          }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              🎉 Daftar Hadir Berhasil!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Terima kasih telah mengkonfirmasi kehadiran Anda. 
              Anda sekarang dapat mengunduh sertifikat dari halaman profil.
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/profile')}
              sx={{ mr: 2 }}
            >
              Lihat Profil
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/events')}
            >
              Lihat Event Lainnya
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Attendance;