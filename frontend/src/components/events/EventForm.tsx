import React, { useState, useCallback } from 'react';
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
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Save,
  Cancel,
  Event as EventIcon,
  School as CertificateIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Person as OrganizerIcon,
  Category as CategoryIcon,
  MonetizationOn as PriceIcon,
  Map as MapIcon,
  MyLocation as MyLocationIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { EventFormData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// Dynamic schema based on user role
const createSchema = (isOrganizer: boolean) => {
  // Calculate minimum date (H-3)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateString = minDate.toISOString().split('T')[0];

  const baseSchema: any = {
    title: yup.string().required('Judul event wajib diisi'),
    description: yup.string().required('Deskripsi event wajib diisi'),
    date: yup.string()
      .required('Tanggal event wajib diisi')
      .test('min-date', `Tanggal event minimal H-3 dari hari ini (${minDateString})`, function(value) {
        if (!value) return false;
        const eventDate = new Date(value);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 3;
      }),
    start_time: yup.string().required('Waktu mulai wajib diisi'),
    end_time: yup.string()
      .required('Waktu selesai wajib diisi')
      .test('is-after-start', 'Waktu selesai harus setelah waktu mulai', function(value) {
        const { start_time } = this.parent;
        if (!start_time || !value) return true;
        return value > start_time;
      }),
    location: yup.string().required('Lokasi event wajib diisi'),
    max_participants: yup.number().min(1, 'Minimal 1 peserta').required('Maksimal peserta wajib diisi'),
    registration_deadline: yup.string()
      .required('Deadline pendaftaran wajib diisi')
      .test('before-event', 'Deadline pendaftaran harus sebelum tanggal event', function(value) {
        const { date } = this.parent;
        if (!date || !value) return true;
        return new Date(value) < new Date(date);
      }),
    registration_date: yup.string()
      .required('Tanggal pendaftaran wajib diisi')
      .test('before-event', 'Tanggal pendaftaran harus sebelum tanggal event', function(value) {
        const { date } = this.parent;
        if (!date || !value) return true;
        return new Date(value) < new Date(date);
      }),
    price: yup.number().min(0, 'Harga tidak boleh negatif').optional(),
  };

  // Add organizer-specific fields for EO
  if (isOrganizer) {
    baseSchema.organizer_name = yup.string().required('Nama organizer wajib diisi');
    baseSchema.organizer_email = yup.string().email('Format email tidak valid').required('Email organizer wajib diisi');
    baseSchema.organizer_contact = yup.string().required('Kontak organizer wajib diisi');
    baseSchema.event_type = yup.string().required('Tipe event wajib dipilih');
    baseSchema.category = yup.string().required('Kategori event wajib dipilih');
  }

  return yup.object().shape(baseSchema);
};

interface EventFormProps {
  isCreate?: boolean;
  isEdit?: boolean;
  isOrganizer?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ isCreate = false, isEdit = false, isOrganizer = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificateEnabled, setCertificateEnabled] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);

  // Create schema based on user role
  const schema = createSchema(isOrganizer);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      max_participants: 50,
      registration_deadline: '',
      registration_date: '',
      price: 0,
      // EO specific defaults
      organizer_name: isOrganizer ? user?.name || '' : '',
      organizer_email: isOrganizer ? user?.email || '' : '',
      organizer_contact: isOrganizer ? user?.phone || '' : '',
      event_type: isOrganizer ? 'workshop' : undefined,
      category: isOrganizer ? '' : undefined,
      flyer: undefined,
      // Set status based on role
      status: isOrganizer ? 'pending_approval' : 'published',
      created_by_role: isOrganizer ? 'event_organizer' : 'admin',
    } as any,
  });

  const handleSave = async (data: EventFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Saving event:', data);
      
      if (isOrganizer) {
        // Use organizer API service
        const { organizerApiService } = await import('../../services/organizerApiService');
        
        // Create event object for API
        const eventData: any = {
          title: data.title,
          description: data.description,
          date: data.date,
          start_time: data.start_time || '',
          end_time: data.end_time || '',
          location: data.location,
          max_participants: data.max_participants,
          registration_deadline: data.registration_deadline || '',
          registration_date: data.registration_date || data.registration_deadline || data.date,
          price: data.price || 0,
          organizer_name: data.organizer_name || '',
          organizer_email: data.organizer_email || '',
          organizer_contact: data.organizer_contact || '',
          category: data.category || ''
        };
        
        // Add file if exists
        if (data.flyer) {
          eventData.flyer = data.flyer;
        }
        
        console.log('Event data to send:', eventData);
        
        const response = await organizerApiService.createEvent(eventData);
        console.log('Create event response:', response);
        
        if (response.status === 'success') {
          console.log('✅ Event created successfully:', response.data);
          
          // Multiple strategies to ensure auto-refresh
          try {
            // 1. Clear any cached data
            localStorage.removeItem('cached_events');
            
            // 2. Set refresh flag in localStorage for immediate pickup
            localStorage.setItem('force_refresh_events', JSON.stringify({
              timestamp: Date.now(),
              newEventId: response.data?.id,
              message: 'Event berhasil dibuat dan menunggu persetujuan admin'
            }));
            
            // 3. Navigate with state AND query param for double assurance
            const refreshParam = `?refresh=${Date.now()}`;
            navigate(`/organizer/events${refreshParam}`, { 
              state: { 
                refresh: true, 
                newEventId: response.data?.id,
                message: 'Event berhasil dibuat dan menunggu persetujuan admin',
                timestamp: Date.now()
              },
              replace: true // Replace current history entry
            });
            
            console.log('✅ Navigation triggered with auto-refresh');
            
            // Dispatch custom event to notify dashboard
            window.dispatchEvent(new CustomEvent('eventCreated', {
              detail: { eventId: response.data?.id }
            }));
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback: force page reload
            window.location.href = '/organizer/events?refresh=true';
          }
        } else {
          console.error('❌ Event creation failed:', response);
          throw new Error(response.message || 'Failed to create event');
        }
      } else {
        // Admin event creation logic
        navigate('/admin/events');
      }
    } catch (err: any) {
      console.error('Error saving event:', err);
      setError(err.message || 'Gagal menyimpan event. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(isOrganizer ? '/organizer/events' : '/admin/events');
  };

  // Location picker functions
  const handleLocationSelect = useCallback((location: {lat: number, lng: number, address: string}) => {
    setSelectedLocation(location);
    setMapDialogOpen(false);
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect({ 
            lat: latitude, 
            lng: longitude, 
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Tidak dapat mengakses lokasi. Pastikan izin lokasi telah diberikan.');
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser ini.');
    }
  }, [handleLocationSelect]);

  // Simple map component
  const MapPicker = () => (
    <Box sx={{ height: 400, width: '100%', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '2px dashed #ddd', borderRadius: 2 }}>
      <MapIcon sx={{ fontSize: 64, color: '#999', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Peta Interaktif
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Klik pada peta untuk memilih lokasi event
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<MyLocationIcon />}
          onClick={getCurrentLocation}
          sx={{ bgcolor: '#4f46e5' }}
        >
          Gunakan Lokasi Saat Ini
        </Button>
        <Button 
          variant="outlined"
          onClick={() => {
            handleLocationSelect({
              lat: -6.2088,
              lng: 106.8456,
              address: 'Jakarta Pusat, DKI Jakarta, Indonesia'
            });
          }}
        >
          Pilih Jakarta Pusat
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
        * Integrasi peta penuh akan tersedia setelah konfigurasi API key
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#f8fafc', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: '#4f46e5', 
              width: 48, 
              height: 48,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}>
              <EventIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
                color: '#1e293b',
                background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {isCreate ? '📅 Tambah Event Baru' : '✏️ Edit Event'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isCreate ? 'Buat event baru untuk ditampilkan di platform GOMOMENT' : 'Edit informasi event yang sudah ada'}
              </Typography>
            </Box>
          </Box>
          
          {/* Status Chips */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Chip 
              label={isCreate ? "Mode: Tambah Baru" : "Mode: Edit"} 
              color="primary" 
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={certificateEnabled ? "🎓 Certificate: Aktif" : "🎓 Certificate: Nonaktif"} 
              color={certificateEnabled ? "success" : "default"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.1)'
        }}>
          <form onSubmit={handleSubmit(handleSave as any)}>
            {/* Basic Information Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(79, 70, 229, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#4f46e5' }}>
                      📝 Informasi Event
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Masukkan informasi lengkap tentang event
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Judul Event"
                        placeholder="Masukkan judul event yang menarik"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4f46e5',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Deskripsi Event"
                        placeholder="Jelaskan detail event, agenda, dan informasi penting lainnya"
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4f46e5',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />

                  {/* EO-specific fields in basic info */}
                  {isOrganizer && (
                    <>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                        <Controller
                          name="event_type"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth error={!!errors.event_type}>
                              <InputLabel>Tipe Event</InputLabel>
                              <Select
                                {...field}
                                label="Tipe Event"
                                sx={{
                                  borderRadius: 2,
                                  '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#4f46e5',
                                    }
                                  }
                                }}
                              >
                                <MenuItem value="workshop">🛠️ Workshop</MenuItem>
                                <MenuItem value="seminar">🎤 Seminar</MenuItem>
                                <MenuItem value="conference">🏢 Conference</MenuItem>
                                <MenuItem value="webinar">💻 Webinar</MenuItem>
                                <MenuItem value="training">📚 Training</MenuItem>
                                <MenuItem value="other">🎯 Lainnya</MenuItem>
                              </Select>
                              {errors.event_type && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                  {errors.event_type.message}
                                </Typography>
                              )}
                            </FormControl>
                          )}
                        />

                        <Controller
                          name="category"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Kategori Event"
                              placeholder="Teknologi, Bisnis, Pendidikan, dll"
                              error={!!errors.category}
                              helperText={errors.category?.message}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#4f46e5',
                                    }
                                  }
                                }
                              }}
                            />
                          )}
                        />
                      </Box>

                      <Controller
                        name="price"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Harga Tiket (IDR)"
                            type="number"
                            placeholder="0 untuk gratis"
                            error={!!errors.price}
                            helperText={errors.price?.message || "Masukkan 0 jika event gratis"}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#4f46e5',
                                  }
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Date & Time Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#8b5cf6', width: 40, height: 40 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#6366f1' }}>
                      🕒 Waktu & Lokasi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tentukan kapan dan dimana event akan berlangsung
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => {
                      const minDate = new Date();
                      minDate.setDate(minDate.getDate() + 3);
                      const minDateString = minDate.toISOString().split('T')[0];
                      
                      return (
                        <TextField
                          {...field}
                          fullWidth
                          label="Tanggal Event"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: minDateString }}
                          error={!!errors.date}
                          helperText={errors.date?.message || `Minimal H-3 dari hari ini (${minDateString})`}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#6366f1',
                                }
                              }
                            }
                          }}
                        />
                      );
                    }}
                  />

                  <Controller
                    name="start_time"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Waktu Mulai"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.start_time}
                        helperText={errors.start_time?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="end_time"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Waktu Selesai"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.end_time}
                        helperText={errors.end_time?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <TextField
                          {...field}
                          value={selectedLocation ? selectedLocation.address : field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!selectedLocation) {
                              // Clear selected location if user types manually
                              setSelectedLocation(null);
                            }
                          }}
                          fullWidth
                          label="Lokasi Event"
                          placeholder="Masukkan alamat lengkap event atau pilih dari peta"
                          error={!!errors.location}
                          helperText={errors.location?.message || "Klik tombol peta untuk memilih lokasi dengan mudah"}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#6366f1',
                                }
                              }
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <IconButton 
                                onClick={() => setMapDialogOpen(true)}
                                sx={{ color: '#6366f1' }}
                                title="Pilih lokasi dari peta"
                              >
                                <MapIcon />
                              </IconButton>
                            )
                          }}
                        />
                        {selectedLocation && (
                          <Typography variant="caption" sx={{ color: '#059669', mt: 1, display: 'block' }}>
                            📍 Koordinat: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                          </Typography>
                        )}
                      </Box>
                    )}
                  />

                  <Controller
                    name="registration_deadline"
                    control={control}
                    render={({ field }) => {
                      const today = new Date().toISOString().split('T')[0];
                      
                      return (
                        <TextField
                          {...field}
                          fullWidth
                          label="Deadline Pendaftaran"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: today }}
                          error={!!errors.registration_deadline}
                          helperText={errors.registration_deadline?.message || "Harus sebelum tanggal event"}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#6366f1',
                                }
                              }
                            }
                          }}
                        />
                      );
                    }}
                  />

                  <Controller
                    name="max_participants"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Maksimal Peserta"
                        type="number"
                        placeholder="Contoh: 100"
                        error={!!errors.max_participants}
                        helperText={errors.max_participants?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Certificate Settings Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(139, 92, 246, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#a855f7', width: 40, height: 40 }}>
                    <CertificateIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#8b5cf6' }}>
                      🎓 Pengaturan Sertifikat
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aktifkan sertifikat untuk peserta yang menyelesaikan event
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  p: 3, 
                  bgcolor: certificateEnabled ? 'rgba(139, 92, 246, 0.05)' : 'rgba(148, 163, 184, 0.05)', 
                  borderRadius: 2,
                  border: certificateEnabled ? '2px solid rgba(139, 92, 246, 0.2)' : '2px solid rgba(148, 163, 184, 0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={certificateEnabled}
                        onChange={(e) => setCertificateEnabled(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#8b5cf6',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body1" fontWeight="bold" sx={{ 
                          color: certificateEnabled ? '#8b5cf6' : '#64748b' 
                        }}>
                          {certificateEnabled ? '🎓 Sertifikat Diaktifkan' : '🎓 Sertifikat Dinonaktifkan'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {certificateEnabled 
                            ? 'Peserta akan mendapatkan sertifikat setelah menyelesaikan event' 
                            : 'Peserta tidak akan mendapatkan sertifikat untuk event ini'
                          }
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {certificateEnabled && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 600, mb: 1 }}>
                        ✨ Fitur Sertifikat Aktif:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Sertifikat otomatis digenerate setelah event selesai
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Peserta dapat download sertifikat dari dashboard mereka
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Template sertifikat dapat dikustomisasi di pengaturan
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* EO-Specific Organizer Information Section */}
            {isOrganizer && (
              <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(244, 114, 182, 0.2)', bgcolor: 'rgba(244, 114, 182, 0.02)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ bgcolor: '#f472b6', width: 40, height: 40 }}>
                      <OrganizerIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#f472b6' }}>
                        👤 Informasi Penyelenggara (EO)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Masukkan informasi lengkap penyelenggara event
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    <Controller
                      name="organizer_name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Nama Penyelenggara"
                          placeholder="Masukkan nama lengkap atau organisasi penyelenggara"
                          error={!!errors.organizer_name}
                          helperText={errors.organizer_name?.message}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#f472b6',
                                }
                              }
                            }
                          }}
                        />
                      )}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                      <Controller
                        name="organizer_email"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Email Penyelenggara"
                            type="email"
                            placeholder="email@organizer.com"
                            error={!!errors.organizer_email}
                            helperText={errors.organizer_email?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#f472b6',
                                  }
                                }
                              }
                            }}
                          />
                        )}
                      />

                      <Controller
                        name="organizer_contact"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Kontak Penyelenggara"
                            placeholder="+62812345678 atau nomor WhatsApp"
                            error={!!errors.organizer_contact}
                            helperText={errors.organizer_contact?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#f472b6',
                                  }
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* Status Information for EO */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600, mb: 1 }}>
                      ⚠️ Informasi Penting untuk Event Organizer:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Event yang Anda buat akan masuk ke status "Menunggu Persetujuan"
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Admin akan meninjau dan menyetujui event sebelum dipublikasikan
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        Anda akan mendapat notifikasi setelah event disetujui atau ditolak
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Image Upload Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(168, 85, 247, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
                    <ImageIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#a855f7' }}>
                      🖼️ Upload Media
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload flyer atau poster untuk menarik peserta
                    </Typography>
                  </Box>
                </Box>
                
                <TextField
                  label="Upload Flyer/Poster Event"
                  type="file"
                  inputProps={{ 
                    accept: 'image/jpeg,image/jpg,image/png,image/gif',
                    onChange: (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('🖼️ EventForm: File selected:', {
                          name: file.name,
                          size: file.size,
                          type: file.type
                        });
                        setValue('flyer', file);
                      }
                    }
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#a855f7',
                        }
                      }
                    }
                  }}
                />
                
                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: '#4f46e5' }}>
                    📸 Panduan Upload Image:
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>📁 Format:</strong> JPEG, JPG, PNG, GIF
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>📏 Ukuran Max:</strong> 5MB (5,000 KB)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>📐 Rasio:</strong> 16:9 (landscape)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>🖥️ Resolusi:</strong> 1920x1080px+
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>⚡ Kualitas:</strong> 85-90%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>🎨 Tips:</strong> Gunakan gambar berkualitas tinggi
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                sx={{
                  borderColor: '#64748b',
                  color: '#64748b',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#475569',
                    bgcolor: 'rgba(100, 116, 139, 0.05)'
                  }
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={16} /> : <Save />}
                disabled={isLoading}
                sx={{
                  bgcolor: '#4f46e5',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  '&:hover': {
                    bgcolor: '#3730a3',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)'
                  },
                  '&:disabled': {
                    bgcolor: '#94a3b8',
                    transform: 'none',
                    boxShadow: 'none'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Event'}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Map Dialog */}
        <Dialog 
          open={mapDialogOpen} 
          onClose={() => setMapDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon sx={{ color: '#4f46e5' }} />
              <Typography variant="h6">Pilih Lokasi Event</Typography>
            </Box>
            <IconButton onClick={() => setMapDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <MapPicker />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMapDialogOpen(false)}>Batal</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default EventForm;
