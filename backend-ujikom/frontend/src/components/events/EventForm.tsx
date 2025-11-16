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
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
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
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { organizerApiService, OrganizerEvent } from '../../services/organizerApiService';
import { EventFormData } from '../../types';

const schema = yup.object().shape({
  title: yup.string().required('Judul event wajib diisi'),
  description: yup.string().required('Deskripsi event wajib diisi'),
  date: yup.string().required('Tanggal event wajib diisi'),
  time: yup.string().required('Waktu event wajib diisi'),
  location: yup.string().required('Lokasi event wajib diisi'),
  max_participants: yup.number().min(1, 'Minimal 1 peserta').required('Maksimal peserta wajib diisi'),
});

interface EventFormProps {
  isCreate?: boolean;
  isEdit?: boolean;
  isOrganizer?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ isCreate = false, isEdit = false, isOrganizer = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificateEnabled, setCertificateEnabled] = useState(false);
  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      max_participants: 50,
      organizer_name: '',
    },
  });

  // Load existing event data when editing
  useEffect(() => {
    const loadEvent = async () => {
      if (!isEdit || !id) return;

      try {
        setIsLoading(true);
        const response = await organizerApiService.getEvent(Number(id));
        const event = response.data;
        if (!event) return;

        setValue('title', event.title || '');
        setValue('description', event.description || '');
        setValue('date', event.date || '');
        // assume time stored as HH:MM:SS
        const time = (event.start_time || '').toString().slice(0, 5);
        setValue('time', time);
        setValue('location', event.location || '');
        setValue('max_participants', event.max_participants || 50);
        setValue('organizer_name', event.organizer_name || (event as any).organizer || '');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data event.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [isEdit, id, setValue]);

  const handleSave = async (data: EventFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isCreate) {
        // Samakan payload admin & organizer ke API backend
        const today = new Date().toISOString().split('T')[0];

        // Hitung registration_deadline = 1 hari sebelum tanggal event
        let registrationDeadline = data.date;
        if (data.date) {
          const eventDate = new Date(data.date);
          if (!isNaN(eventDate.getTime())) {
            const deadlineDate = new Date(eventDate);
            deadlineDate.setDate(deadlineDate.getDate() - 1);
            registrationDeadline = deadlineDate.toISOString().split('T')[0];
          }
        }

        const organizerName = data.organizer_name || user?.name || (isOrganizer ? 'Event Organizer' : 'Admin Utama');
        const organizerEmail = user?.email || (isOrganizer ? 'organizer@example.com' : 'admin@gomoment.com');
        const organizerContact = (user as any)?.phone || undefined;

        const status: OrganizerEvent['status'] = isOrganizer ? 'pending_approval' : 'published';

        const payload: OrganizerEvent = {
          title: data.title,
          description: data.description,
          date: data.date,
          start_time: data.time,
          end_time: data.time,
          location: data.location,
          max_participants: data.max_participants,
          // gunakan tanggal event sebagai deadline default jika belum ada field khusus di form
          registration_deadline: registrationDeadline,
          organizer_name: organizerName,
          organizer_email: organizerEmail,
          organizer_contact: organizerContact,
          // sementara kategori & harga default; bisa dihubungkan ke master kategori nanti
          category: 'Umum',
          price: 0,
          registration_date: today,
          organizer_type: isOrganizer ? 'organizer' : 'admin',
          status,
        };
        await organizerApiService.createEvent(payload);
      } else if (isEdit && id) {
        const updatePayload: Partial<OrganizerEvent> = {
          title: data.title,
          description: data.description,
          date: data.date,
          start_time: data.time,
          end_time: data.time,
          location: data.location,
          max_participants: data.max_participants,
          registration_deadline: data.date,
          organizer_name: data.organizer_name,
        };

        await organizerApiService.updateEvent(Number(id), updatePayload);
      }

      navigate(isOrganizer ? '/organizer/events' : '/admin/events');
    } catch (err: any) {
      // organizerApiService sudah melempar Error(message), jadi gunakan err.message
      setError(err.message || 'Gagal menyimpan event. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(isOrganizer ? '/organizer/events' : '/admin/events');
  };

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
          <form onSubmit={handleSubmit(handleSave)}>
            {/* Basic Information Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(79, 70, 229, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#4f46e5' }}>
                      📝 Informasi Dasar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Masukkan informasi dasar tentang event
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

                  {isOrganizer && (
                    <Controller
                      name="organizer_name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Nama Penyelenggara"
                          placeholder="Masukkan nama penyelenggara event"
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
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Tanggal Event"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.date}
                        helperText={errors.date?.message}
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
                    name="time"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Waktu Event"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.time}
                        helperText={errors.time?.message}
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
                      <TextField
                        {...field}
                        fullWidth
                        label="Lokasi Event"
                        placeholder="Masukkan alamat lengkap atau platform online"
                        error={!!errors.location}
                        helperText={errors.location?.message}
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
                  inputProps={{ accept: 'image/jpeg,image/jpg,image/png,image/gif' }}
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
      </Container>
    </Box>
  );
};

export default EventForm;
