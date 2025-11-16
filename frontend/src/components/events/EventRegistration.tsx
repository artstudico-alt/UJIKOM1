import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  start_time?: string;
  end_time?: string;
  location: string;
  max_participants?: number;
  current_participants?: number;
  price?: number;
  organizer_name?: string;
  image?: string;
}

interface EventRegistrationProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
  onRegister: (registrationData: RegistrationData) => Promise<void>;
}

interface RegistrationData {
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  notes?: string;
  agree_terms: boolean;
}

const EventRegistration: React.FC<EventRegistrationProps> = ({
  event,
  open,
  onClose,
  onRegister
}) => {
  const [formData, setFormData] = useState<RegistrationData>({
    participant_name: '',
    participant_email: '',
    participant_phone: '',
    notes: '',
    agree_terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof RegistrationData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!event) return;

    // Validation
    if (!formData.participant_name.trim()) {
      setError('Nama lengkap harus diisi');
      return;
    }
    if (!formData.participant_email.trim()) {
      setError('Email harus diisi');
      return;
    }
    if (!formData.participant_phone.trim()) {
      setError('Nomor telepon harus diisi');
      return;
    }
    if (!formData.agree_terms) {
      setError('Anda harus menyetujui syarat dan ketentuan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onRegister(formData);
      // Reset form
      setFormData({
        participant_name: '',
        participant_email: '',
        participant_phone: '',
        notes: '',
        agree_terms: false
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar event');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!event) return null;

  const isEventFull = event.max_participants && event.current_participants && 
    event.current_participants >= event.max_participants;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EventIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            Daftar Event
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Event Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {event.title}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tanggal & Waktu
                </Typography>
                <Typography variant="body1">
                  {formatDate(event.date)}
                </Typography>
                {event.start_time && (
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Lokasi
                </Typography>
                <Typography variant="body1">
                  {event.location}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Peserta
                </Typography>
                <Typography variant="body1">
                  {event.current_participants || 0}
                  {event.max_participants ? ` / ${event.max_participants}` : ''} orang
                </Typography>
              </Box>
            </Box>

            {event.price && event.price > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Biaya
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                    Rp {event.price.toLocaleString('id-ID')}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {event.organizer_name && (
            <Typography variant="body2" color="text.secondary">
              Diselenggarakan oleh: <strong>{event.organizer_name}</strong>
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Registration Form */}
        {isEventFull ? (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="bold">
              Event Sudah Penuh
            </Typography>
            <Typography variant="body2">
              Maaf, event ini sudah mencapai batas maksimal peserta.
            </Typography>
          </Alert>
        ) : (
          <>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Informasi Pendaftar
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                value={formData.participant_name}
                onChange={handleInputChange('participant_name')}
                required
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.participant_email}
                onChange={handleInputChange('participant_email')}
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />

              <TextField
                fullWidth
                label="Nomor Telepon"
                value={formData.participant_phone}
                onChange={handleInputChange('participant_phone')}
                required
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />

              <TextField
                fullWidth
                label="Catatan (Opsional)"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder="Tambahkan catatan atau pertanyaan khusus..."
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agree_terms}
                    onChange={handleInputChange('agree_terms')}
                    required
                  />
                }
                label={
                  <Typography variant="body2">
                    Saya menyetujui <strong>syarat dan ketentuan</strong> serta bersedia mengikuti event ini
                  </Typography>
                }
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Batal
        </Button>
        {!isEventFull && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.agree_terms}
            startIcon={loading ? <CircularProgress size={20} /> : <EventIcon />}
          >
            {loading ? 'Mendaftar...' : 'Daftar Event'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventRegistration;
