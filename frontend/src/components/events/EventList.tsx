import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  Zoom,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import {
  Search,
  FilterList,
  Event,
  Visibility,
  Star,
  EmojiEvents,
  TrendingUp,
  Info,
  AutoAwesome,
  LocationOn,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/api';
import { Event as EventType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface EventListProps {
  showRegistrationButton?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  maxItems?: number;
}

const EventList: React.FC<EventListProps> = ({
  showRegistrationButton = true,
  showSearch = true,
  showFilters = true,
  maxItems,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', { search: searchTerm, status: statusFilter, page }],
    queryFn: () =>
      eventService.getAllEvents({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        page,
        per_page: maxItems || 12,
      }),
    staleTime: 0,
    gcTime: 0,
  });

  const events = eventsResponse?.data || [];
  const pagination = eventsResponse ? {
    current_page: eventsResponse.current_page,
    last_page: eventsResponse.last_page,
    per_page: eventsResponse.per_page,
    total: eventsResponse.total,
  } : undefined;


  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(searchInput);
    setPage(1);
  };


  const handleStatusFilter = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRegister = async (event: EventType) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Navigate to registration form
    navigate(`/events/${event.id}/register`);
  };


  const getEventStatus = (event: EventType) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    let eventDateTime: Date;
    
    if (event.start_time) {
      eventDateTime = new Date(event.date + 'T' + event.start_time);
    } else {
      eventDateTime = eventDate;
    }

    if (eventDateTime < now) {
      return { status: 'completed', label: 'Selesai', color: 'default' as const };
    } else if (eventDate.toDateString() === now.toDateString()) {
      return { status: 'ongoing', label: 'Sedang Berlangsung', color: 'success' as const };
    } else {
      return { status: 'published', label: 'Dipublikasikan', color: 'success' as const };
    }
  };

  const isRegistrationOpen = (event: EventType) => {
    const now = new Date();
    let eventDateTime: Date;
    
    if (event.start_time) {
      eventDateTime = new Date(event.date + 'T' + event.start_time);
    } else {
      eventDateTime = new Date(event.date);
    }
    
    const registrationDeadline = new Date(event.registration_deadline);
    
    // Registration is open if:
    // 1. Event is in the future AND
    // 2. Current time is before registration deadline
    return eventDateTime > now && now <= registrationDeadline;
  };

  const formatEventDate = (date: string, time?: string) => {
    try {
      let eventDate: Date;
      
      // Handle different date formats from backend
      if (time) {
        // If time is provided, combine date and time
        if (time.includes('T')) {
          // Time already includes T (ISO format)
          eventDate = new Date(date + 'T' + time.split('T')[1]);
        } else {
          // Time is just HH:mm:ss format
        eventDate = new Date(date + 'T' + time);
        }
      } else {
        eventDate = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(eventDate.getTime())) {
        return 'Tanggal tidak valid';
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
      // Handle different time formats
      let timeStr = time;
      if (time.includes('T')) {
        // Extract time part from ISO format
        timeStr = time.split('T')[1];
      }
      
      // Parse and format time
      const timeParts = timeStr.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0]}:${timeParts[1]}`;
      }
      return timeStr;
    } catch (error) {
      console.error('Error formatting time:', error);
    return time;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Gagal memuat data event. Silakan coba lagi.
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#ffffff',
      position: 'relative',
      py: 4,
      overflow: 'hidden'
    }}>
      
      {/* Floating Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '120px',
          height: '120px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
          filter: 'blur(1px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '80px',
          height: '80px',
          background: 'rgba(118, 75, 162, 0.08)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite reverse',
          filter: 'blur(1px)',
        }
      }} />
      
      {/* Geometric Shapes */}
      <Box sx={{
        position: 'absolute',
        top: '15%',
        right: '20%',
        width: '80px',
        height: '80px',
        background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
        borderRadius: '20px',
        animation: 'float 12s ease-in-out infinite',
        zIndex: 1,
        filter: 'blur(1px)',
        transform: 'rotate(45deg)',
      }} />
      
      <Box sx={{
        position: 'absolute',
        top: '40%',
        left: '8%',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
        borderRadius: '50%',
        animation: 'float 15s ease-in-out infinite reverse',
        zIndex: 1,
        filter: 'blur(2px)',
      }} />
      
      <Box sx={{
        position: 'absolute',
        top: '70%',
        right: '10%',
        width: '100px',
        height: '100px',
        background: 'linear-gradient(30deg, rgba(118, 75, 162, 0.15), rgba(102, 126, 234, 0.05))',
        borderRadius: '30px',
        animation: 'float 18s ease-in-out infinite',
        zIndex: 1,
        filter: 'blur(1px)',
        transform: 'rotate(30deg)',
      }} />
      
      {/* Hexagonal Shapes */}
      <Box sx={{
        position: 'absolute',
        top: '25%',
        left: '75%',
        width: '70px',
        height: '70px',
        background: 'rgba(102, 126, 234, 0.08)',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        animation: 'float 14s ease-in-out infinite reverse',
        zIndex: 1,
        filter: 'blur(1px)',
      }} />
      
      {/* Triangle Shapes */}
      <Box sx={{
        position: 'absolute',
        top: '60%',
        left: '15%',
        width: '0',
        height: '0',
        borderLeft: '30px solid transparent',
        borderRight: '30px solid transparent',
        borderBottom: '50px solid rgba(102, 126, 234, 0.1)',
        animation: 'float 16s ease-in-out infinite',
        zIndex: 1,
        filter: 'blur(1px)',
      }} />
      
      {/* Star Shapes */}
      <Box sx={{
        position: 'absolute',
        top: '80%',
        right: '25%',
        width: '50px',
        height: '50px',
        background: 'rgba(118, 75, 162, 0.06)',
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        animation: 'float 20s ease-in-out infinite reverse',
        zIndex: 1,
        filter: 'blur(1px)',
      }} />
      
      {/* Diamond Shapes */}
      <Box sx={{
        position: 'absolute',
        top: '35%',
        right: '40%',
        width: '40px',
        height: '40px',
        background: 'linear-gradient(45deg, rgba(118, 75, 162, 0.2), rgba(102, 126, 234, 0.1))',
        transform: 'rotate(45deg)',
        animation: 'float 22s ease-in-out infinite',
        zIndex: 1,
        filter: 'blur(1px)',
      }} />
      
      {/* Small Floating Dots */}
      <Box sx={{
        position: 'absolute',
        top: '45%',
        left: '85%',
        width: '20px',
        height: '20px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite',
        zIndex: 1,
        filter: 'blur(1px)',
      }} />
      
      <Box sx={{
        position: 'absolute',
        top: '85%',
        left: '25%',
        width: '15px',
        height: '15px',
        background: 'rgba(102, 126, 234, 0.2)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite reverse',
        zIndex: 1,
        filter: 'blur(1px)',
      }} />
      
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '60%',
        width: '25px',
        height: '25px',
        background: 'rgba(118, 75, 162, 0.15)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite',
        zIndex: 1,
        filter: 'blur(1px)',
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
              <AutoAwesome sx={{ 
                fontSize: 48, 
                mr: 2, 
                color: '#9c27b0',
                animation: 'glow 2s ease-in-out infinite alternate',
                '@keyframes glow': {
                  '0%': { filter: 'drop-shadow(0 0 5px rgba(156, 39, 176, 0.3))' },
                  '100%': { filter: 'drop-shadow(0 0 20px rgba(156, 39, 176, 0.6))' },
                }
              }} />
              <Typography variant="h3" component="h1" sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Event Terbaik
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              mb: 4, 
              maxWidth: '600px', 
              mx: 'auto',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              Temukan event menarik dan bergabunglah dengan komunitas
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Star sx={{ color: 'white !important' }} />}
                label="Event Berkualitas"
                sx={{ 
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'white !important'
                  }
                }}
              />
              <Chip
                icon={<EmojiEvents sx={{ color: 'white !important' }} />}
                label="Sertifikat Resmi"
                sx={{ 
                  backgroundColor: '#2196f3',
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'white !important'
                  }
                }}
              />
              <Chip
                icon={<TrendingUp sx={{ color: 'white !important' }} />}
                label="Networking"
                sx={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'white !important'
                  }
                }}
              />
            </Box>
          </Box>
        </Fade>

      {/* Search and Filter Section */}
      {(showSearch || showFilters) && (
          <Slide direction="up" in timeout={1200}>
        <Box sx={{ 
              mb: 6, 
          p: 4, 
              background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 10,
            }}>
              <Typography variant="h4" component="h2" sx={{ 
                fontWeight: 'bold', 
                mb: 4,
                color: 'white',
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
            Cari Event Favorit Anda
          </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, alignItems: 'center' }}>
            {showSearch && (
              <Box>
                <TextField
                  fullWidth
                  placeholder="Cari event berdasarkan judul, deskripsi, atau lokasi..."
                  value={searchInput}
                  onChange={handleSearch}
                  variant="outlined"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: '#667eea' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      '& input': {
                        color: '#333',
                        '&::placeholder': {
                          color: '#666',
                          opacity: 1,
                        },
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Box>
            )}
            {showFilters && (
              <Box>
                <FormControl fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    variant="outlined"
                    displayEmpty
                    startAdornment={<FilterList sx={{ mr: 1, color: '#667eea' }} />}
                    renderValue={(selected) => {
                      if (!selected) {
                        return <span style={{ color: '#667eea', fontWeight: 600 }}>Status Event</span>;
                      }
                      // Convert English values to Indonesian text
                      const statusMap: { [key: string]: string } = {
                        'draft': 'Draft',
                        'pending_approval': 'Menunggu Persetujuan',
                        'approved': 'Disetujui',
                        'published': 'Dipublikasikan',
                        'ongoing': 'Sedang Berlangsung',
                        'completed': 'Selesai',
                        'cancelled': 'Dibatalkan',
                        'rejected': 'Ditolak'
                      };
                      return <span style={{ color: '#667eea', fontWeight: 600 }}>{statusMap[selected] || selected}</span>;
                    }}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      '& .MuiSelect-select': {
                        color: '#333',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        '&:hover': {
                          borderColor: '#667eea',
                        },
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      },
                    }}
                  >
                    <MenuItem value="">Semua Status</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="pending_approval">Menunggu Persetujuan</MenuItem>
                    <MenuItem value="approved">Disetujui</MenuItem>
                    <MenuItem value="published">Dipublikasikan</MenuItem>
                    <MenuItem value="ongoing">Sedang Berlangsung</MenuItem>
                    <MenuItem value="completed">Selesai</MenuItem>
                    <MenuItem value="cancelled">Dibatalkan</MenuItem>
                    <MenuItem value="rejected">Ditolak</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </Box>
          </Slide>
      )}

      {/* Events Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
        gap: 4,
        position: 'relative',
        zIndex: 10
      }}>
        {events.map((event: EventType, index: number) => {
          // Use status from backend if available, otherwise calculate
          const eventStatus = event.status ? {
            status: event.status,
            label: event.status === 'draft' ? 'Draft' :
                   event.status === 'pending_approval' ? 'Menunggu Persetujuan' :
                   event.status === 'approved' ? 'Disetujui' :
                   event.status === 'published' ? 'Dipublikasikan' :
                   event.status === 'ongoing' ? 'Sedang Berlangsung' : 
                   event.status === 'completed' ? 'Selesai' :
                   event.status === 'cancelled' ? 'Dibatalkan' :
                   event.status === 'rejected' ? 'Ditolak' : 'Tidak Diketahui',
            color: event.status === 'draft' ? 'default' as const :
                   event.status === 'pending_approval' ? 'warning' as const :
                   event.status === 'approved' ? 'info' as const :
                   event.status === 'published' ? 'success' as const :
                   event.status === 'ongoing' ? 'success' as const : 
                   event.status === 'completed' ? 'info' as const :
                   event.status === 'cancelled' ? 'error' as const :
                   event.status === 'rejected' ? 'error' as const : 'default' as const
          } : getEventStatus(event);
            // Use backend registration status if available, otherwise calculate
            const registrationOpen = event.is_registration_open !== undefined 
              ? event.is_registration_open 
              : isRegistrationOpen(event);

          return (
            <Box key={event.id}>
                <Zoom in timeout={1000 + index * 200}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)),
                    linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))
                  `,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  pointerEvents: 'auto',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%)
                    `,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 1,
                  },
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 25px 50px rgba(102, 126, 234, 0.3)',
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                    '&::before': {
                      opacity: 1,
                    }
                  },
                }}
              >

                {/* Event Image with Hover Overlay */}
                <Box sx={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                  height: 200,
                  zIndex: 2,
                  '&:hover .hover-overlay': {
                    opacity: 1,
                  }
                }}>
                <CardMedia
                  component="img"
                  height="200"
                    image={event.image ? `${event.image}?v=${Date.now()}` : '/images/default-event.svg'}
                  alt={event.title}
                    sx={{ 
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  
                  {/* Status Badges */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      gap: 1,
                      zIndex: 3,
                    }}
                  >
                    {/* NEW Badge */}
                    <Chip
                      label="NEW"
                      size="small"
                      sx={{
                        backgroundColor: '#2196f3',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                    
                    {/* Calendar Icon */}
                    <Chip
                      icon={<Event sx={{ fontSize: '0.8rem' }} />}
                      size="small"
                      sx={{
                        backgroundColor: '#ff9800',
                        color: 'white',
                        height: 24,
                        '& .MuiChip-icon': {
                          color: 'white',
                        },
                      }}
                    />
                    
                    <Chip
                      label={eventStatus.label}
                      size="small"
                      icon={<Event />}
                      sx={{ 
                        fontWeight: 500,
                        borderRadius: 1.5,
                        backdropFilter: 'blur(10px)',
                        background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        fontSize: '0.75rem',
                        height: 24,
                        '& .MuiChip-icon': {
                          fontSize: '14px',
                          color: 'white',
                        },
                        '& .MuiChip-label': {
                          color: 'white',
                          fontSize: '0.75rem',
                        },
                      }}
                    />
                  </Box>

                  {/* Hover Overlay */}
                  <Box
                    className="hover-overlay"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      top: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 3,
                      zIndex: 2,
                    }}
                  >
                  </Box>
                </Box>

                <CardContent sx={{ 
                  p: 3,
                  position: 'relative',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                  color: 'white',
                  '&:last-child': { pb: 3 },
                }}>
                  {/* Event Title */}
                  <Box sx={{ position: 'relative', mb: 1.5 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: 'white',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                        fontSize: '1rem',
                        position: 'relative',
                    }}
                  >
                    {event.title}
                      </Typography>
                    </Box>

                  {/* Event Description */}
                  <Box sx={{ position: 'relative', mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        position: 'relative',
                        }}
                      >
                      {event.description}
                      </Typography>
                  </Box>

                  {/* Event Date, Time, and Location */}
                  <Box sx={{ mb: 2 }}>
                    {/* Date and Time */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Event sx={{ color: '#9c27b0', mr: 1, fontSize: '1.2rem' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>
                        {new Date(event.date).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })} • {event.start_time?.substring(0, 5)} - {event.end_time?.substring(0, 5)}
                      </Typography>
                    </Box>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ color: '#9c27b0', mr: 1, fontSize: '1.2rem' }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>
                        {event.location}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Event Status - Always Free */}
                  <Box sx={{ mt: 1.5, mb: 1 }}>
                        <Chip 
                      label="GRATIS"
                          size="small"
                          sx={{ 
                            background: 'linear-gradient(135deg, #4caf50, #2196f3)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    mt: 2,
                    position: 'relative',
                    zIndex: 20,
                    pointerEvents: 'auto',
                  }}>
                    {/* Lihat Detail Button */}
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<Visibility />}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/events/${event.id}`);
                      }}
                      sx={{ 
                        flex: 1,
                        borderRadius: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        fontSize: '0.9rem',
                        py: 1.5,
                        position: 'relative',
                        zIndex: 30,
                        pointerEvents: 'auto',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.6)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Lihat Detail
                    </Button>
                    {/* Registration Button */}
                    {showRegistrationButton && isAuthenticated && registrationOpen && (
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<Event />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Daftar button clicked for event:', event.id);
                          handleRegister(event);
                        }}
                        disabled={event.current_participants_count >= event.max_participants}
                        sx={{ 
                          flex: 1.5,
                          borderRadius: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                          color: 'white',
                          boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                          fontSize: '1rem',
                          py: 1.5,
                          position: 'relative',
                          zIndex: 30,
                          pointerEvents: 'auto',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7b1fa2, #1976d2)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(156, 39, 176, 0.5)',
                          },
                          '&:disabled': {
                            backgroundColor: '#e2e8f0',
                            color: '#94a3b8',
                            boxShadow: 'none',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Daftar
                      </Button>
                    )}

                    {showRegistrationButton && !isAuthenticated && registrationOpen && (
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<Info />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Login button clicked');
                          navigate('/login');
                        }}
                        sx={{ 
                          flex: 1.5,
                          borderRadius: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                          backgroundColor: '#9c27b0',
                          boxShadow: '0 2px 8px rgba(156, 39, 176, 0.2)',
                          fontSize: '0.9rem',
                          py: 1,
                          position: 'relative',
                          zIndex: 30,
                          pointerEvents: 'auto',
                          '&:hover': {
                            backgroundColor: '#7b1fa2',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Login
                      </Button>
                    )}

                    {!registrationOpen && (
                      <Button
                        variant="contained"
                        size="medium"
                        disabled
                        sx={{ 
                          flex: 1,
                          borderRadius: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                          backgroundColor: '#fef2f2',
                          color: 'white',
                          fontSize: '0.9rem',
                          py: 1.5,
                          position: 'relative',
                          zIndex: 30,
                          pointerEvents: 'auto',
                          '&:disabled': {
                            backgroundColor: '#fef2f2',
                            color: 'white',
                          },
                        }}
                      >
                        Pendaftaran Ditutup
                      </Button>
                    )}
                  </Box>

                </CardContent>
              </Card>
                </Zoom>
            </Box>
          );
        })}
      </Box>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
          <Fade in timeout={1500}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 6,
              position: 'relative',
              zIndex: 10
            }}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
                border: '1px solid rgba(156, 39, 176, 0.2)',
              }}>
          <Pagination
            count={pagination.last_page}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#9c27b0',
                      '&.Mui-selected': {
                        backgroundColor: '#9c27b0',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#7b1fa2',
                        }
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                      }
                    }
                  }}
                />
              </Paper>
        </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default EventList;
