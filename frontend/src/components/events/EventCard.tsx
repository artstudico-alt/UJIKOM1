import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tooltip,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  CheckCircle,
  HourglassEmpty,
  Visibility,
  PersonAdd,
  Login,
  TaskAlt,
  Cancel
} from '@mui/icons-material';

interface Event {
  id: number;
  title: string;
  formattedDate: string;
  location: string;
  start_time: string;
  end_time: string;
  image?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'ongoing' | 'completed' | 'cancelled' | 'rejected';
  is_user_registered?: boolean;
  organizer?: string; // Nama penyelenggara - TAMPIL DI PUBLIK
}

interface EventCardProps {
  event: Event;
  onViewDetails: (id: number) => void;
  onRegister?: (id: number) => void;
  isAuthenticated?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails, onRegister, isAuthenticated = false }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.log('🖼️ EventCard: Image error for event:', {
      id: event.id,
      title: event.title,
      image: event.image,
      imageError: imageError
    });
    setImageError(true);
  };
  
  // Debug image data
  React.useEffect(() => {
    console.log('🖼️ EventCard: Image data for event:', {
      id: event.id,
      title: event.title,
      image: event.image,
      hasImage: !!event.image,
      imageError: imageError
    });
  }, [event.id, event.image, imageError]);

  const getStatusChip = () => {
    switch (event.status) {
      case 'ongoing':
        return <Chip label="Sedang Berlangsung" color="success" size="small" icon={<HourglassEmpty />} />;
      case 'completed':
        return <Chip label="Selesai" color="default" size="small" icon={<CheckCircle />} />;
      case 'draft':
        return <Chip label="Draft" color="default" size="small" icon={<CalendarToday />} />;
      case 'pending_approval':
        return <Chip label="Menunggu Persetujuan" color="warning" size="small" icon={<HourglassEmpty />} />;
      case 'approved':
        return <Chip label="Disetujui" color="info" size="small" icon={<CheckCircle />} />;
      case 'published':
        return <Chip label="Dipublikasikan" color="success" size="small" icon={<CheckCircle />} />;
      case 'cancelled':
        return <Chip label="Dibatalkan" color="error" size="small" icon={<Cancel />} />;
      case 'rejected':
        return <Chip label="Ditolak" color="error" size="small" icon={<Cancel />} />;
      default:
        return <Chip label="Tidak Diketahui" color="default" size="small" icon={<CalendarToday />} />;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 0, // Sharp corners
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.03) translateY(-5px)',
          boxShadow: '0 16px 45px 0 rgba(0, 0, 0, 0.2)',
        }
      }}
    >
      <Box sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.75)', 
        backdropFilter: 'blur(10px)', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="240"
          image={imageError || !event.image ? 'https://source.unsplash.com/random/400x300?event' : event.image}
          alt={event.title}
          onError={handleImageError}
        />
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          {getStatusChip()}
        </Box>
        {event.is_user_registered && (
          <Tooltip title="Anda sudah terdaftar di event ini">
            <Chip
              icon={<CheckCircle />}
              label="Terdaftar"
              color="secondary"
              size="small"
              sx={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.6)' }}
            />
          </Tooltip>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography gutterBottom variant="h6" component="div" fontWeight="bold" noWrap color="text.primary">
          {event.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', mb: 1 }}>
          <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="body2" fontWeight={500}>
            {event.formattedDate} • {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'secondary.main', mb: 1 }}>
          <LocationOn sx={{ fontSize: 16, mr: 1 }} />
          <Typography variant="body2" fontWeight={500} noWrap>{event.location}</Typography>
        </Box>
        {event.organizer && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: 'text.secondary',
            bgcolor: '#f8f9fa',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            border: '1px solid #e9ecef'
          }}>
            <Typography variant="caption" fontWeight={600} sx={{ color: '#6c757d' }}>
              Diselenggarakan oleh: <span style={{ color: '#495057', fontWeight: 700 }}>{event.organizer}</span>
            </Typography>
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
        <Tooltip title="Lihat detail event" arrow placement="top">
          <Button
            variant="outlined"
            color="primary"
            onClick={() => onViewDetails(event.id)}
            sx={{ 
              minWidth: 'auto',
              width: 48,
              height: 48,
              borderColor: '#9c27b0',
              color: '#9c27b0',
              borderRadius: 2,
              border: '2px solid rgba(156, 39, 176, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(156, 39, 176, 0.1), transparent)',
                transition: 'left 0.5s ease',
              },
              '&:hover': {
                borderColor: '#7b1fa2',
                color: '#7b1fa2',
                background: 'rgba(156, 39, 176, 0.05)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 15px rgba(156, 39, 176, 0.2)',
                '&::before': {
                  left: '100%',
                }
              },
              '&:active': {
                transform: 'translateY(0px)',
              }
            }}
          >
            <Visibility sx={{ fontSize: '1.2rem' }} />
          </Button>
        </Tooltip>
        {onRegister && !event.is_user_registered && event.status === 'published' && (
          isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onRegister(event.id)}
              sx={{ 
                flex: 1,
                background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 50%, #2196f3 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem',
                py: 1.2,
                borderRadius: 2,
                border: '2px solid rgba(156, 39, 176, 0.3)',
                boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s ease',
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #512da8 50%, #1976d2 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(156, 39, 176, 0.4)',
                  '&::before': {
                    left: '100%',
                  }
                },
                '&:active': {
                  transform: 'translateY(0px)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAdd sx={{ fontSize: '1.1rem' }} />
                <Typography sx={{ fontWeight: 600 }}>Daftar Sekarang</Typography>
              </Box>
            </Button>
          ) : (
            <Tooltip 
              title="Klik untuk login dan mulai mendaftar event gratis!"
              arrow
              placement="top"
            >
              <span style={{ flex: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => window.location.href = '/login'}
                  sx={{ 
                    flex: 1,
                    width: '100%',
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 50%, #e65100 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    py: 1.2,
                    borderRadius: 2,
                    border: '2px solid rgba(255, 152, 0, 0.3)',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f57c00 0%, #e65100 50%, #d84315 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)',
                      '&::before': {
                        left: '100%',
                      }
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Login sx={{ fontSize: '1.1rem' }} />
                    <Typography sx={{ fontWeight: 600 }}>Login untuk Daftar</Typography>
                  </Box>
                </Button>
              </span>
            </Tooltip>
          )
        )}
        {event.is_user_registered && (
          <Tooltip title="Anda sudah terdaftar di event ini" arrow placement="top">
            <span style={{ flex: 1 }}>
              <Button
                variant="contained"
                disabled
                sx={{ 
                  flex: 1,
                  width: '100%',
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 50%, #2e7d32 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  py: 1.2,
                  borderRadius: 2,
                  border: '2px solid rgba(76, 175, 80, 0.3)',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                  '&.Mui-disabled': {
                    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 50%, #2e7d32 100%)',
                    color: 'white',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TaskAlt sx={{ fontSize: '1.1rem' }} />
                  <Typography sx={{ fontWeight: 600 }}>Sudah Terdaftar</Typography>
                </Box>
              </Button>
            </span>
          </Tooltip>
        )}
      </CardActions>
    </Box>
    </Card>
  );
};

export default EventCard;
