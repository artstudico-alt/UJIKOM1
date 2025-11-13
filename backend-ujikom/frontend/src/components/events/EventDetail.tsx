import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Fade,
  Slide,
  Zoom,
  LinearProgress,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Event,
  LocationOn,
  Schedule,
  People,
  CalendarToday,
  CheckCircle,
  Cancel,
  Info,
  School,
  Visibility,
  Star,
  EmojiEvents,
  TrendingUp,
  AccessTime,
  Group,
  Place,
  DateRange,
  AutoAwesome,
  Share,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../../services/api';
import { Event as EventType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const EventDetail: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [registrationDialog, setRegistrationDialog] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Fetch event details
  const {
    data: eventResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEventById(parseInt(eventId!)),
    enabled: !!eventId,
    staleTime: 0,
    gcTime: 0,
  });

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: (data: any) => eventService.registerForEvent(Number(eventId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      setRegistrationDialog(false);
    },
  });

  const event = eventResponse?.data;

  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Navigate to registration form
    navigate(`/events/${eventId}/register`);
  };

  const handleConfirmRegistration = async () => {
    if (!eventId) return;
    
    setRegistrationLoading(true);
    try {
      await registerMutation.mutateAsync(parseInt(eventId));
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const getEventStatus = (event: EventType) => {
    const now = new Date();
    const eventDate = new Date(event.date + ' ' + event.start_time);
    
    if (eventDate < now) {
      return { label: 'Selesai', color: 'default' as const };
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { label: 'Sedang Berlangsung', color: 'success' as const };
    } else {
      return { label: 'Akan Datang', color: 'primary' as const };
    }
  };

  const formatEventDate = (date: string, time?: string) => {
    try {
      let eventDate: Date;
      
      // Handle ISO date string (e.g., "2025-09-24T00:00:00.000000Z")
      if (date.includes('T')) {
        // Extract just the date part (YYYY-MM-DD)
        const dateOnly = date.split('T')[0];
        if (time) {
          eventDate = new Date(dateOnly + ' ' + time);
        } else {
          eventDate = new Date(dateOnly);
        }
      } else {
        // Handle regular date string (e.g., "2025-09-24")
        if (time) {
          eventDate = new Date(date + ' ' + time);
        } else {
          eventDate = new Date(date);
        }
      }
      
      return format(eventDate, 'EEEE, dd MMMM yyyy', { locale: id });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tanggal tidak valid';
    }
  };

  const formatEventTime = (time?: string) => {
    if (!time) return 'Waktu tidak ditentukan';
    try {
      // Handle both time-only format (HH:mm) and full datetime format
      if (time.includes('T')) {
        // Full datetime format (ISO string)
        return format(new Date(time), 'HH:mm', { locale: id });
      } else if (time.includes(':')) {
        // Time-only format (HH:mm) - return as is
        return time;
      } else {
        // Fallback for other formats
        return format(new Date('2000-01-01 ' + time), 'HH:mm', { locale: id });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Waktu tidak valid';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Gagal memuat detail event. Silakan coba lagi.
        </Alert>
      </Container>
    );
  }

  const eventStatus = getEventStatus(event);
  const isRegistrationOpen = event.is_registration_open;
  const isUserRegistered = event.is_user_registered || false;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 20%, rgba(156, 39, 176, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(33, 150, 243, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(244, 67, 54, 0.06) 0%, transparent 50%),
        #f8f9fa
      `,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'linear-gradient(45deg, rgba(156, 39, 176, 0.1), rgba(33, 150, 243, 0.1))',
        animation: 'float 8s ease-in-out infinite',
        zIndex: 0,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '15%',
        left: '3%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'linear-gradient(45deg, rgba(244, 67, 54, 0.08), rgba(156, 39, 176, 0.08))',
        animation: 'float 10s ease-in-out infinite reverse',
        zIndex: 0,
      },
      '@keyframes float': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(-30px) rotate(180deg)' },
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Subtle Decorative Elements */}
        <Box sx={{
          position: 'absolute',
          top: '15%',
          left: '8%',
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05))',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0,
        }} />
        <Box sx={{
          position: 'absolute',
          top: '60%',
          right: '12%',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(99, 102, 241, 0.04))',
          borderRadius: '50%',
          filter: 'blur(30px)',
          zIndex: 0,
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.07), rgba(59, 130, 246, 0.04))',
          borderRadius: '50%',
          filter: 'blur(35px)',
          zIndex: 0,
        }} />
        
        <Box sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Event Header */}
        <Fade in timeout={1000}>
          <Paper elevation={0} sx={{ 
            p: 5, 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(156, 39, 176, 0.2)',
            boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #9c27b0, #2196f3, #f44336)',
            }
          }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 4 }}>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / 9' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={eventStatus.label}
                  color={eventStatus.color}
                  icon={<Event />}
                    sx={{ 
                      fontWeight: 600,
                      borderRadius: 2,
                      background: eventStatus.color === 'primary' ? 'linear-gradient(135deg, #9c27b0, #2196f3)' : undefined,
                      color: eventStatus.color === 'primary' ? 'white' : undefined,
                    }}
                />
                {isRegistrationOpen && (
                  <Chip
                    label="Pendaftaran Terbuka"
                    color="primary"
                    icon={<CheckCircle />}
                      sx={{ 
                        fontWeight: 600,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                      }}
                    />
                  )}
                  <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    <Tooltip title="Bagikan">
                      <IconButton sx={{ 
                        color: '#4f46e5',
                        '&:hover': { 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}>
                        <Share />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Simpan">
                      <IconButton sx={{ 
                        color: '#4f46e5',
                        '&:hover': { 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}>
                        <BookmarkBorder />
                      </IconButton>
                    </Tooltip>
                  </Box>
              </Box>

                <Typography variant="h2" component="h1" sx={{ 
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2,
                }}>
                {event.title}
              </Typography>

                <Typography variant="h6" sx={{ 
                  color: '#666', 
                  mb: 4,
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}>
                {event.description}
              </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05), rgba(33, 150, 243, 0.05))',
                      border: '1px solid rgba(156, 39, 176, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08), rgba(33, 150, 243, 0.08))',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2, 
                        background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                        boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                      }}>
                        <DateRange />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                          Tanggal Event
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                          {formatEventDate(event.date, event.start_time)}
                  </Typography>
                </Box>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(244, 67, 54, 0.05))',
                      border: '1px solid rgba(33, 150, 243, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.08), rgba(244, 67, 54, 0.08))',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2, 
                        background: 'linear-gradient(135deg, #2196f3, #f44336)',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                      }}>
                        <AccessTime />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                          Waktu Event
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                          {formatEventTime(event.start_time)} - {formatEventTime(event.end_time)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05), rgba(156, 39, 176, 0.05))',
                      border: '1px solid rgba(244, 67, 54, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.08), rgba(156, 39, 176, 0.08))',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2, 
                        background: 'linear-gradient(135deg, #f44336, #9c27b0)',
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                      }}>
                        <Place />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                          Lokasi
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                          {event.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(33, 150, 243, 0.05))',
                      border: '1px solid rgba(76, 175, 80, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(33, 150, 243, 0.08))',
                        transform: 'translateX(4px)',
                      }
                    }}>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 2, 
                        background: 'linear-gradient(135deg, #4caf50, #2196f3)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                      }}>
                        <Group />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                          Peserta
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
                          {event.current_participants_count} / {event.max_participants} peserta
                  </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(event.current_participants_count / event.max_participants) * 100}
                          sx={{ 
                            mt: 1, 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #9c27b0, #2196f3)',
                            }
                          }}
                        />
                </Box>
                    </Box>
                  </Box>
                </Box>
            </Box>

            <Box sx={{ gridColumn: { xs: '1', md: '9 / 13' } }}>
                <Zoom in timeout={1200}>
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #9c27b0, #2196f3, #f44336)',
                    }
                  }}>
                    <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                        image={event.image ? `${event.image}?v=${Date.now()}` : '/images/default-event.svg'}
                  alt={event.title}
                        sx={{ 
                          width: '100%',
                          height: 'auto',
                          minHeight: '250px',
                          maxHeight: '350px',
                          objectFit: 'cover',
                          backgroundColor: '#f8fafc',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 2,
                        }}
                      >
                        <Chip
                          label={eventStatus.label}
                          color={eventStatus.color}
                          size="small"
                          icon={<Event />}
                          sx={{ 
                            fontWeight: 600,
                            borderRadius: 2,
                            backdropFilter: 'blur(10px)',
                            backgroundColor: eventStatus.color === 'primary' ? 'rgba(79, 70, 229, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                            color: eventStatus.color === 'primary' ? 'white' : undefined,
                            boxShadow: eventStatus.color === 'primary' ? '0 4px 12px rgba(79, 70, 229, 0.3)' : undefined,
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          opacity: 0.8,
                          animation: 'sparkle 2s ease-in-out infinite',
                          '@keyframes sparkle': {
                            '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
                            '50%': { opacity: 1, transform: 'scale(1.1)' },
                          }
                        }}
                      >
                        <AutoAwesome sx={{ color: '#ffd700', fontSize: 24 }} />
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" gutterBottom sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 3
                      }}>
                        Pendaftaran Event
                  </Typography>
                  
                  {isUserRegistered ? (
                        <Alert severity="success" sx={{ 
                          mb: 3,
                          borderRadius: 2,
                          '& .MuiAlert-icon': {
                            color: '#4caf50'
                          }
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Anda sudah terdaftar untuk event ini
                          </Typography>
                    </Alert>
                  ) : (
                        <Alert severity="info" sx={{ 
                          mb: 3,
                          borderRadius: 2,
                          backgroundColor: isRegistrationOpen ? 'rgba(79, 70, 229, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                          border: isRegistrationOpen ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(148, 163, 184, 0.2)',
                          '& .MuiAlert-icon': {
                            color: isRegistrationOpen ? '#4f46e5' : '#94a3b8'
                          },
                          '& .MuiAlert-message': {
                            color: isRegistrationOpen ? '#4f46e5' : '#64748b'
                          }
                        }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600,
                            color: isRegistrationOpen ? '#4f46e5' : '#64748b'
                          }}>
                      {isRegistrationOpen 
                        ? '🎉 Pendaftaran masih terbuka'
                        : '⏰ Pendaftaran sudah ditutup'
                      }
                          </Typography>
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={!isRegistrationOpen || isUserRegistered}
                    onClick={handleRegister}
                        sx={{ 
                          mb: 2,
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                          boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #3730a3, #2563eb)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4)',
                          },
                          '&:disabled': {
                            background: '#e2e8f0',
                            color: '#94a3b8',
                            boxShadow: 'none',
                          },
                          transition: 'all 0.3s ease',
                        }}
                  >
                    {isUserRegistered ? 'Sudah Terdaftar' : 'Daftar Event'}
                  </Button>

                      {isUserRegistered && (
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={() => navigate(`/events/${event.id}/attendance`)}
                          sx={{ 
                            mb: 2,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
                            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #388e3c, #689f38)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Daftar Hadir
                        </Button>
                      )}

                  <Button
                    fullWidth
                    variant="outlined"
                        size="large"
                    onClick={() => navigate('/events')}
                        sx={{ 
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          borderColor: 'rgba(79, 70, 229, 0.3)',
                          color: '#4f46e5',
                          '&:hover': {
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.05)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                  >
                    Kembali ke Daftar Event
                  </Button>
                </CardContent>
              </Card>
                </Zoom>
            </Box>
          </Box>
        </Paper>
        </Fade>

        {/* Event Details */}
        <Slide direction="up" in timeout={1400}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 4 }}>
          <Box sx={{ gridColumn: { xs: '1', md: '1 / 9' } }}>
              <Paper elevation={0} sx={{ 
                p: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(156, 39, 176, 0.2)',
                boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #9c27b0, #2196f3, #f44336)',
                }
              }}>
                <Typography variant="h4" gutterBottom sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3
                }}>
                Detail Event
              </Typography>
                
                <Typography variant="body1" paragraph sx={{ 
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  color: '#555',
                  mb: 4
                }}>
                {event.description}
              </Typography>

                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 700,
                  color: '#333',
                  mb: 3
                }}>
                Informasi Penting:
              </Typography>
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05), rgba(33, 150, 243, 0.05))',
                    border: '1px solid rgba(156, 39, 176, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08), rgba(33, 150, 243, 0.08))',
                      transform: 'translateX(4px)',
                    }
                  }}>
                  <ListItemIcon>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                        boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                      }}>
                        <Info />
                      </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                          Pastikan Anda hadir tepat waktu
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                          Keterlambatan dapat mempengaruhi kelayakan sertifikat
                        </Typography>
                      }
                  />
                </ListItem>
                  <ListItem sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(244, 67, 54, 0.05))',
                    border: '1px solid rgba(33, 150, 243, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.08), rgba(244, 67, 54, 0.08))',
                      transform: 'translateX(4px)',
                    }
                  }}>
                  <ListItemIcon>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #2196f3, #f44336)',
                        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                      }}>
                        <School />
                      </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                          Sertifikat akan diberikan
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                          Setelah mengisi daftar hadir dan mengikuti event
                        </Typography>
                      }
                  />
                </ListItem>
                  <ListItem sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05), rgba(156, 39, 176, 0.05))',
                    border: '1px solid rgba(244, 67, 54, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.08), rgba(156, 39, 176, 0.08))',
                      transform: 'translateX(4px)',
                    }
                  }}>
                  <ListItemIcon>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #f44336, #9c27b0)',
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                      }}>
                        <Visibility />
                      </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>
                          Dress code
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                          Pakaian rapi dan sopan
                        </Typography>
                      }
                  />
                </ListItem>
                </List>

              </Paper>
            </Box>

            <Box sx={{ gridColumn: { xs: '1', md: '9 / 13' } }}>
              <Zoom in timeout={1600}>
                <Paper elevation={0} sx={{ 
                  p: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(156, 39, 176, 0.2)',
                  boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #9c27b0, #2196f3, #f44336)',
                  }
                }}>
                  <Typography variant="h4" gutterBottom sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 4
                  }}>
                    Statistik Event
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, p: 2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05), rgba(33, 150, 243, 0.05))', border: '1px solid rgba(156, 39, 176, 0.1)' }}>
                    <Avatar sx={{ 
                      width: 50, 
                      height: 50,
                      background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                      boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                    }}>
                      <People />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                        Peserta Terdaftar
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#333' }}>
                        {event.current_participants_count}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, p: 2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(244, 67, 54, 0.05))', border: '1px solid rgba(33, 150, 243, 0.1)' }}>
                    <Avatar sx={{ 
                      width: 50, 
                      height: 50,
                      background: 'linear-gradient(135deg, #2196f3, #f44336)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                    }}>
                      <Event />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                        Kapasitas Maksimal
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#333' }}>
                        {event.max_participants}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(33, 150, 243, 0.05))', border: '1px solid rgba(76, 175, 80, 0.1)' }}>
                    <Avatar sx={{ 
                      width: 50, 
                      height: 50,
                      background: 'linear-gradient(135deg, #4caf50, #2196f3)',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                    }}>
                      <School />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                        Sertifikat
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#333' }}>
                        Tersedia
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Zoom>
            </Box>
          </Box>
        </Slide>
      </Box>

      {/* Registration Confirmation Dialog */}
      <Dialog open={registrationDialog} onClose={() => setRegistrationDialog(false)}>
        <DialogTitle>Konfirmasi Pendaftaran</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin mendaftar untuk event "{event.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Setelah mendaftar, Anda akan menerima email konfirmasi dengan token kehadiran.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationDialog(false)}>
            Batal
          </Button>
          <Button
            onClick={handleConfirmRegistration}
            variant="contained"
            disabled={registrationLoading}
          >
            {registrationLoading ? <CircularProgress size={20} /> : 'Daftar'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
    </Box>
  );
};

export default EventDetail;
