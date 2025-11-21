import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Event,
  LocationOn,
  Schedule,
  CalendarToday,
  Visibility,
  CheckCircle,
  AccessTime,
  School,
  QrCode,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../../services/api';
import { Event as EventType } from '../../types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const MyEvents: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: eventsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => eventService.getMyEvents(),
  });

  console.log('📋 My Events - Full Response:', eventsResponse);
  console.log('📋 My Events - Events Data:', eventsResponse?.data);
  console.log('📋 My Events - Events Count:', eventsResponse?.data?.length || 0);

  const events = eventsResponse?.data || [];

  const getEventStatus = (event: EventType) => {
    const now = new Date();
    const eventDate = new Date(event.date + ' ' + event.start_time);
    
    // Use backend status if available, otherwise calculate locally
    if ((event as any).status) {
      switch ((event as any).status) {
        case 'completed':
          return { label: 'Selesai', color: 'default' as const };
        case 'ongoing':
          return { label: 'Sedang Berlangsung', color: 'success' as const };
        case 'draft':
          return { label: 'Draft', color: 'default' as const };
        case 'pending_approval':
          return { label: 'Menunggu Persetujuan', color: 'warning' as const };
        case 'approved':
          return { label: 'Disetujui', color: 'info' as const };
        case 'published':
          return { label: 'Dipublikasikan', color: 'success' as const };
        case 'cancelled':
          return { label: 'Dibatalkan', color: 'error' as const };
        case 'rejected':
          return { label: 'Ditolak', color: 'error' as const };
        default:
          break;
      }
    }
    
    // Fallback to local calculation
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
      
      // Handle different date formats from backend
      if (date.includes('T')) {
        // ISO format
        eventDate = new Date(date);
      } else if (time) {
        // Combine date and time
        eventDate = new Date(date + ' ' + time);
      } else {
        // Date only
        eventDate = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(eventDate.getTime())) {
        console.error('Invalid date:', date, time);
        return 'Tanggal tidak valid';
      }
      
      return format(eventDate, 'EEEE, dd MMMM yyyy', { locale: id });
    } catch (error) {
      console.error('Error formatting date:', error, date, time);
      return 'Tanggal tidak valid';
    }
  };

  const formatEventTime = (time: string) => {
    try {
      // Handle both time-only format (HH:mm) and full datetime format
      if (time.includes('T')) {
        // Full datetime format (ISO string)
        return format(new Date(time), 'HH:mm', { locale: id });
      } else {
        // Time-only format
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

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Gagal memuat event Anda. Silakan coba lagi.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Event Saya
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Daftar event yang telah Anda daftar
        </Typography>

        {events.length === 0 ? (
          <Alert severity="info">
            Anda belum mendaftar untuk event apapun. 
            <Button
              variant="text"
              onClick={() => navigate('/events')}
              sx={{ ml: 1, textTransform: 'none' }}
            >
              Jelajahi event yang tersedia
            </Button>
          </Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {events.map((event: EventType) => {
              const eventStatus = getEventStatus(event);
              
              // Debug image URL
              console.log('🖼️ Event Image URL:', event.id, event.image);

              return (
                <Box key={event.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      borderRadius: 1.5,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                        zIndex: 1,
                      },
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
                        borderColor: '#cbd5e1',
                        '&::before': {
                          background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                        },
                      },
                    }}
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzY2N2VlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'}
                      alt={event.title}
                      sx={{ 
                        objectFit: 'cover',
                        bgcolor: '#f1f5f9'
                      }}
                      onError={(e: any) => {
                        console.error('❌ Image failed to load:', event.image);
                        // Use embedded SVG as fallback (no internet needed)
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={eventStatus.label}
                          color={eventStatus.color}
                          size="small"
                          icon={<Event />}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 'bold',
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {event.title}
                      </Typography>

                      <Box sx={{ mb: 2, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatEventDate(event.date, event.start_time)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Schedule sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatEventTime(event.start_time)} - {formatEventTime(event.end_time)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {event.location}
                          </Typography>
                        </Box>

                        {/* Attendance Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Token: {(event as any).attendance_token || 'N/A'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircle sx={{ 
                            fontSize: 16, 
                            mr: 1, 
                            color: (event as any).is_attendance_verified ? 'success.main' : 'text.secondary' 
                          }} />
                          <Typography 
                            variant="body2" 
                            color={(event as any).is_attendance_verified ? 'success.main' : 'text.secondary'}
                            sx={{ fontWeight: (event as any).is_attendance_verified ? 'bold' : 'normal' }}
                          >
                            {(event as any).is_attendance_verified ? 'Sudah Hadir' : 'Belum Hadir'}
                          </Typography>
                        </Box>

                        {/* Certificate Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <School sx={{ 
                            fontSize: 16, 
                            mr: 1, 
                            color: (event as any).has_certificate ? 'primary.main' : 'text.secondary' 
                          }} />
                          <Typography 
                            variant="body2" 
                            color={(event as any).has_certificate ? 'primary.main' : 'text.secondary'}
                            sx={{ fontWeight: (event as any).has_certificate ? 'bold' : 'normal' }}
                          >
                            {(event as any).has_certificate ? 'Sertifikat Tersedia' : 'Belum Ada Sertifikat'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event.id}`);
                          }}
                        >
                          Detail
                        </Button>
                        
                        {/* Daftar Hadir Button - Active only on event day after start time */}
                        {(() => {
                          const now = new Date();
                          const eventDate = new Date(event.date);
                          const eventStartTime = new Date(event.date + ' ' + event.start_time);
                          
                          // Check if today is the event day
                          const isEventDay = now.toDateString() === eventDate.toDateString();
                          
                          // Check if current time is after event start time
                          const isAfterStartTime = now >= eventStartTime;
                          
                          // Button is active if: it's event day AND after start time AND user hasn't attended
                          const isActive = isEventDay && isAfterStartTime && !(event as any).is_attendance_verified;
                          
                          // Show button if user hasn't attended yet
                          if (!(event as any).is_attendance_verified) {
                            return (
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<QrCode />}
                                fullWidth
                                disabled={!isActive}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isActive) {
                                    navigate(`/events/${event.id}/attendance`);
                                  }
                                }}
                                sx={{
                                  background: isActive 
                                    ? 'linear-gradient(135deg, #4caf50, #8bc34a)' 
                                    : '#e0e0e0',
                                  color: isActive ? 'white' : '#9e9e9e',
                                  '&:hover': isActive ? {
                                    background: 'linear-gradient(135deg, #388e3c, #689f38)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                                  } : {},
                                  transition: 'all 0.3s ease',
                                  cursor: isActive ? 'pointer' : 'not-allowed',
                                }}
                              >
                                {isActive ? 'Daftar Hadir' : 
                                 !isEventDay ? 'Belum Hari H' : 
                                 !isAfterStartTime ? 'Belum Waktunya' : 'Daftar Hadir'}
                              </Button>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Certificate Button */}
                        {(event as any).has_certificate && (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<School />}
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/my-certificates');
                            }}
                            sx={{
                              background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Sertifikat
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MyEvents;
