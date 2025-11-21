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
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  // Debug authentication status
  console.log('🔐 Events Page Auth Status:', {
    isAuthenticated,
    user: user ? { id: user.id, name: user.name, role: user.role } : null
  });

  // Load events from database-first approach
  const { data: eventsData = [], isLoading, error } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      try {
        console.log('🔍 Public Events: Starting to load events from database...');
        
        // 1. Try to load from public API database first
        try {
          console.log('📡 Public Events: Calling API with params:', { status: 'published', per_page: 50 });
          const publicResponse = await organizerApiService.getEventsWithoutAuth({
            status: 'published',
            per_page: 50
          });
          
          console.log('📡 Public Events: API Response:', publicResponse);
          console.log('📡 Public Events: API Raw Data:', publicResponse.data);

          // Normalize API data shape: support both array and { data: [] } resource collections
          const rawData: any = publicResponse.data as any;
          const apiEvents: any[] = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.data)
              ? rawData.data
              : [];

          console.log('📡 Public Events: Normalized API events length:', apiEvents.length);
          
          if (apiEvents.length > 0) {
            console.log('✅ Public Events: Loaded from database:', apiEvents.length);
            
            // Log each event status and image data
            apiEvents.forEach((event, index) => {
              console.log(`📊 Public Event ${index + 1}:`, {
                id: event.id,
                title: event.title,
                status: event.status,
                approved_at: event.approved_at,
                organizer_type: event.organizer_type,
                image: event.image,
                image_url: event.image_url,
                flyer_path: event.flyer_path
              });
            });
            
            // Convert API events to local format for compatibility
            const databaseEvents = apiEvents.map(event => ({
              id: event.id || 0,
              name: event.title || '',
              title: event.title || '',
              description: event.description || '',
              registrationDate: event.registration_date || event.registration_deadline || '',
              registration_deadline: event.registration_deadline || '', // CRITICAL: Preserve registration_deadline!
              eventDate: event.date || '',
              date: event.date || '',
              startTime: event.start_time || '',
              start_time: event.start_time || '', // Preserve original field name
              endTime: event.end_time || '',
              end_time: event.end_time || '', // Preserve original field name
              location: event.location || '',
              maxParticipants: event.max_participants || 0,
              currentParticipants: 0,
              price: event.price || 0,
              status: event.status || 'published', // Use backend status, don't hardcode!
              category: event.category || '',
              organizer: event.organizer_name || '',
              organizerName: event.organizer_name || '',
              organizerEmail: event.organizer_email || '',
              organizerContact: event.organizer_contact || '',
              // IMPORTANT: Backend EventResource already exposes final image URL in `image`
              // Use that first, then fall back to image_url if ever provided
              image: event.image || event.image_url || '',
              createdAt: event.created_at || '',
              submittedAt: event.submitted_at || '',
              approvedAt: event.approved_at || '',
              time: event.start_time || ''
            }));
            
            console.log('✅ Database Events processed:', databaseEvents.length);
            return databaseEvents;
          } else {
            console.warn('⚠️ Public Events: API returned empty data or no published events found');
            console.log('📊 API Response structure (normalized empty):', {
              status: (publicResponse as any).status,
              rawData,
            });
            // No events in database – return empty list instead of falling back to localStorage
            return [];
          }
        } catch (apiError) {
          console.error('❌ Public Events: Database API failed:', apiError);
          console.warn('📅 Public Events: Falling back to localStorage...');
        }
        
        // 2. Fallback to localStorage only when API fails
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
      // DEBUG: Log raw event data to check registration_deadline
      console.log('🔍 Raw Event Data:', {
        id: event.id,
        title: event.title || event.name,
        registration_deadline: event.registration_deadline,
        date: event.date,
        eventDate: event.eventDate,
      });
      
      // Parse event date - handle both 'date' and 'eventDate' fields
      const eventDateStr = event.eventDate || event.date;
      const eventDate = eventDateStr ? parseISO(eventDateStr) : new Date();
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      let status: 'published' | 'ongoing' | 'completed' = 'published';
      if (isToday(eventDate)) {
        status = 'ongoing';
      } else if (isBefore(eventDate, now)) {
        status = 'completed';
      }

      const mappedEvent = {
        ...event,
        title: event.name || event.title, // Handle both 'name' and 'title' fields
        status,
        formattedDate: format(eventDate, 'dd MMMM yyyy'),
        start_time: event.startTime || event.start_time || '00:00',
        end_time: event.endTime || event.end_time || '23:59',
        organizer: event.organizerName || event.organizer, // Show organizer name in public
        registration_deadline: event.registration_deadline, // Explicitly preserve registration_deadline
        price: event.price || 0, // Explicitly preserve price
      };
      
      // DEBUG: Log mapped event data
      console.log('✅ Mapped Event Data:', {
        id: mappedEvent.id,
        title: mappedEvent.title,
        registration_deadline: mappedEvent.registration_deadline,
      });
      
      return mappedEvent;
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

    // Apply event type filter
    if (eventTypeFilter !== 'all') {
      console.log('🔍 Filtering by event_type:', eventTypeFilter);
      console.log('📊 Events before filter:', filteredEvents.length);
      console.log('📋 Sample event.event_type:', filteredEvents[0]?.event_type);
      console.log('📋 Sample event.category:', filteredEvents[0]?.category);
      
      filteredEvents = filteredEvents.filter(event => {
        const matches = event.event_type === eventTypeFilter || event.category === eventTypeFilter;
        if (!matches) {
          console.log('❌ Event filtered out:', event.title, 'event_type:', event.event_type, 'category:', event.category);
        }
        return matches;
      });
      
      console.log('📊 Events after filter:', filteredEvents.length);
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
  }, [eventsData, searchTerm, statusFilter, eventTypeFilter, sortBy]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
  };

  const handleEventTypeFilterChange = (event: any) => {
    setEventTypeFilter(event.target.value);
  };

  const handleRegister = (eventId: number) => {
    // Always go to registration page first (new flow)
    // For paid events, will redirect to payment after registration
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
              <InputLabel>Tipe Event</InputLabel>
              <Select 
                value={eventTypeFilter} 
                label="Tipe Event" 
                onChange={handleEventTypeFilterChange}
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
                <MenuItem value="all">Semua Tipe</MenuItem>
                <MenuItem value="workshop">🛠️ Workshop</MenuItem>
                <MenuItem value="seminar">🎤 Seminar</MenuItem>
                <MenuItem value="conference">🏢 Conference</MenuItem>
                <MenuItem value="webinar">💻 Webinar</MenuItem>
                <MenuItem value="training">📚 Training</MenuItem>
                <MenuItem value="Hiburan">🎭 Hiburan</MenuItem>
                <MenuItem value="other">🎯 Lainnya</MenuItem>
              </Select>
            </FormControl>
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
                <MenuItem value="all">Semua Status</MenuItem>
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
