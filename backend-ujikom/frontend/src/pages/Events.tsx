import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Grid,
  Button,
} from '@mui/material';
import { Search, FilterList, Sort } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO, isBefore, isToday } from 'date-fns';
import EventCard from '../components/events/EventCard';
import PromoBanner from '../components/events/PromoBanner';
import { eventService } from '../services/eventService';
import { organizerApiService } from '../services/organizerApiService';

const keyframes = `
  @keyframes drift-1 {
    0% { transform: translate(0, 0); }
    50% { transform: translate(80px, 120px); }
    100% { transform: translate(0, 0); }
  }
  @keyframes drift-2 {
    0% { transform: translate(0, 0); }
    50% { transform: translate(-100px, 60px); }
    100% { transform: translate(0, 0); }
  }
  @keyframes drift-3 {
    0% { transform: translate(0, 0); }
    50% { transform: translate(120px, -80px); }
    100% { transform: translate(0, 0); }
  }
  @keyframes shooting-star {
    0% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(150vw); opacity: 0; }
  }
  @keyframes gradient-spin {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const Events: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load events from database-first approach
  const { data: eventsData = [], isLoading, error } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      try {
        console.log('🔍 Public Events: Starting to load events from database...');
        
        // 1. Try to load from public API database first
        try {
          const publicResponse = await organizerApiService.getEventsWithoutAuth({
            status: 'published',
            per_page: 50
          });
          
          if (publicResponse.data && publicResponse.data.length > 0) {
            console.log('✅ Public Events: Loaded from database:', publicResponse.data.length);
            
            // Convert API events to local format for compatibility
            const databaseEvents = publicResponse.data.map(event => ({
              id: event.id || 0,
              name: event.title || '',
              title: event.title || '',
              description: event.description || '',
              registrationDate: event.registration_date || event.registration_deadline || '',
              eventDate: event.date || '',
              date: event.date || '',
              startTime: event.start_time || '',
              endTime: event.end_time || '',
              location: event.location || '',
              maxParticipants: event.max_participants || 0,
              currentParticipants: 0,
              price: event.price || 0,
              status: 'published' as const,
              category: event.category || '',
              organizer: event.organizer_name || '',
              organizerName: event.organizer_name || '',
              organizerEmail: event.organizer_email || '',
              organizerContact: event.organizer_contact || '',
              image: event.image_url || '',
              createdAt: event.created_at || '',
              submittedAt: event.submitted_at || '',
              approvedAt: event.approved_at || '',
              time: event.start_time || ''
            }));
            
            console.log('✅ Database Events processed:', databaseEvents.length);
            return databaseEvents;
          }
        } catch (apiError) {
          console.warn('📅 Public Events: Database API failed, falling back to localStorage:', apiError);
        }
        
        // 2. Fallback to localStorage if database fails
        const publishedEvents = eventService.getPublishedEvents();
        console.log('✅ Public Events: Loaded from localStorage fallback:', publishedEvents.length);
        
        return publishedEvents;
      } catch (err) {
        console.error('❌ Public Events: Error loading events:', err);
        throw err;
      }
    }
  });

  const events = useMemo(() => {
    if (!eventsData) return [];

    let filteredEvents = eventsData.map((event: any) => {
      // Parse event date - handle both 'date' and 'eventDate' fields
      const eventDateStr = event.eventDate || event.date;
      const eventDate = eventDateStr ? parseISO(eventDateStr) : new Date();
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
      if (isToday(eventDate)) {
        status = 'ongoing';
      } else if (isBefore(eventDate, now)) {
        status = 'completed';
      }

      return {
        ...event,
        title: event.name || event.title, // Handle both 'name' and 'title' fields
        status,
        formattedDate: format(eventDate, 'dd MMMM yyyy'),
        start_time: event.startTime || event.start_time || '00:00',
        end_time: event.endTime || event.end_time || '23:59',
        organizer: event.organizerName || event.organizer, // Show organizer name in public
      };
    });

    // Apply search filter
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.status === statusFilter);
    }

    // Apply sorting
    filteredEvents.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.eventDate || b.date).getTime() - new Date(a.eventDate || a.date).getTime();
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'date_asc':
        default:
          return new Date(a.eventDate || a.date).getTime() - new Date(b.eventDate || b.date).getTime();
      }
    });

    return filteredEvents;
  }, [eventsData, searchTerm, statusFilter, sortBy]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handleRegister = (eventId: number) => {
    navigate(`/events/${eventId}/register`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error">Gagal memuat data event. Silakan coba lagi nanti.</Alert>
      </Box>
    );
  }

  return (
    <React.Fragment>
      <style>{keyframes}</style>
      <Box sx={{ minHeight: '100vh', 
        background: `
          radial-gradient(circle at 15% 50%, rgba(67, 0, 235, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 85% 40%, rgba(235, 0, 255, 0.15) 0%, transparent 40%),
          #f8fafc
        `,
        position: 'relative',
        overflow: 'hidden' // Prevents gradients from overflowing
      }}>
        {/* Decorative Shapes */}
        <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: {xs: 100, md: 200}, height: {xs: 100, md: 200}, bgcolor: 'primary.main', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2, zIndex: 0, animation: 'drift-1 30s infinite ease-in-out alternate' }} />
        <Box sx={{ position: 'absolute', top: '50%', right: '10%', width: {xs: 150, md: 300}, height: {xs: 150, md: 300}, bgcolor: 'secondary.main', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15, zIndex: 0, animation: 'drift-2 35s infinite ease-in-out alternate' }} />

        {/* Shooting Stars */}
        <Box sx={{ position: 'absolute', top: '20%', left: '-50%', width: '150px', height: '2px', background: 'linear-gradient(90deg, rgba(255,255,255,0.8), transparent)', animation: 'shooting-star 10s linear infinite', animationDelay: '1s', transform: 'rotate(-20deg)' }} />
        <Box sx={{ position: 'absolute', top: '60%', left: '-50%', width: '200px', height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.6), transparent)', animation: 'shooting-star 15s linear infinite', animationDelay: '5s', transform: 'rotate(-20deg)' }} />
        <Box sx={{ position: 'absolute', top: '40%', left: '-50%', width: '100px', height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.5), transparent)', animation: 'shooting-star 12s linear infinite', animationDelay: '8s', transform: 'rotate(-20deg)' }} />

        <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
          <PromoBanner />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 6 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Cari event..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  transition: 'background-color 0.3s, box-shadow 0.3s',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  },
                }
              }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl variant="outlined" sx={{ minWidth: { xs: '100%', md: 200 } }}>
              <InputLabel>Status</InputLabel>
              <Select 
                value={statusFilter} 
                label="Status" 
                onChange={handleStatusFilterChange}
                startAdornment={<FilterList sx={{ mr: 1, ml: 1, color: 'text.secondary' }}/>}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  },
                  '.MuiSelect-select': {
                    pl: 0,
                  }
                }}
              >
                <MenuItem value="all">Semua</MenuItem>
                <MenuItem value="upcoming">Akan Datang</MenuItem>
                <MenuItem value="ongoing">Berlangsung</MenuItem>
                <MenuItem value="completed">Selesai</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" sx={{ minWidth: { xs: '100%', md: 200 } }}>
              <InputLabel>Urutkan</InputLabel>
              <Select 
                value={sortBy} 
                label="Urutkan" 
                onChange={handleSortChange}
                startAdornment={<Sort sx={{ mr: 1, ml: 1, color: 'text.secondary' }}/>}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  },
                  '.MuiSelect-select': {
                    pl: 0,
                  }
                }}
              >
                <MenuItem value="date_asc">Tanggal (Terbaru)</MenuItem>
                <MenuItem value="date_desc">Tanggal (Terlama)</MenuItem>
                <MenuItem value="title_asc">Judul (A-Z)</MenuItem>
                <MenuItem value="title_desc">Judul (Z-A)</MenuItem>
              </Select>
            </FormControl>
          </Box>



          {events.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Search sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                Tidak Ada Event Ditemukan
              </Typography>
              <Typography color="text.secondary">
                Coba ubah kata kunci pencarian atau filter Anda.
              </Typography>
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={4}
            >
              {events.map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onViewDetails={() => navigate(`/events/${event.id}`)}
                  onRegister={handleRegister}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </React.Fragment>
  );
};

export default Events;
