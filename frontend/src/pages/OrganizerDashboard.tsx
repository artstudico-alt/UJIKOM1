import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Event as EventIcon,
  Group as GroupIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  CalendarToday,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// eventService removed - now 100% using database API
import { organizerApiService } from '../services/organizerApiService';

interface OrganizerEvent {
  id: number;
  name: string;
  date: string;
  participants: number;
  maxParticipants: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'ongoing' | 'completed' | 'cancelled' | 'rejected';
  revenue: number;
}

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { label: 'Total Events', value: '0', icon: <EventIcon fontSize="large" color="primary" />, color: '#4f46e5' },
    { label: 'Total Participants', value: '0', icon: <GroupIcon fontSize="large" color="secondary" />, color: '#06b6d4' },
    { label: 'Upcoming Events', value: '0', icon: <TrendingUpIcon fontSize="large" color="success" />, color: '#10b981' },
    { label: 'Revenue', value: 'Rp 0', icon: <MonetizationOnIcon fontSize="large" color="warning" />, color: '#f59e0b' },
  ]);

  const [recentEvents, setRecentEvents] = useState<OrganizerEvent[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load real data from API and localStorage
    const loadDashboardData = async () => {
      console.log('🔍 Organizer Dashboard: Loading events...');
      setLoading(true);
      
      let events: Event[] = [];
      
      // Try to load from API first
      try {
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
          console.log('🔍 Organizer Dashboard: Loading from API...');
          const response = await organizerApiService.getEvents();
          const apiEvents = response.data || [];
          
          // Convert API events to Event format
          events = apiEvents.map(event => ({
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
            status: event.status || 'draft', // Use original API status
            category: event.category || '',
            organizer: event.organizer_name || '',
            organizerName: event.organizer_name || '',
            organizerEmail: event.organizer_email || '',
            organizerContact: event.organizer_contact || '',
            // Use processed image URL from backend EventResource first
            image: event.image || event.image_url || '',
            createdAt: event.created_at || '',
            submittedAt: event.submitted_at || '',
            approvedAt: event.approved_at || '',
            rejectedAt: event.rejected_at || '',
          }));
          
          console.log('✅ Organizer Dashboard: Loaded from API:', events.length);
        } else {
          throw new Error('No auth token');
        }
      } catch (error) {
        console.error('❌ Organizer Dashboard: Failed to load from database:', error);
        // No localStorage fallback
        events = [];
      }
      
      console.log('🔍 Organizer Dashboard: Found events:', events.length);
      
      // Filter events for current organizer (you might want to add organizer filtering logic)
      const organizerEvents = events.filter(event => 
        event.organizerName && event.organizerName !== 'Admin Utama'
      );
      
      setAllEvents(organizerEvents);
      
      // Convert to OrganizerEvent format for display
      const convertedEvents: OrganizerEvent[] = organizerEvents.slice(0, 5).map(event => ({
        id: typeof event.id === 'string' ? parseInt(event.id) : event.id,
        name: event.name || event.title || '',
        date: event.eventDate || event.date || '',
        participants: event.currentParticipants || 0,
        maxParticipants: event.maxParticipants || 0,
        status: event.status as any, // Use original API status
        revenue: (event.price || 0) * (event.currentParticipants || 0)
      }));
      
      setRecentEvents(convertedEvents);
      
      // Calculate statistics
      const totalEvents = organizerEvents.length;
      const totalParticipants = organizerEvents.reduce((sum, event) => sum + (event.currentParticipants || 0), 0);
      const upcomingEvents = organizerEvents.filter(event => 
        event.status === 'published' || event.status === 'pending_approval'
      ).length;
      const totalRevenue = organizerEvents.reduce((sum, event) => 
        sum + ((event.price || 0) * (event.currentParticipants || 0)), 0
      );

      setStats([
        { label: 'Total Events', value: totalEvents.toString(), icon: <EventIcon fontSize="large" color="primary" />, color: '#4f46e5' },
        { label: 'Total Participants', value: totalParticipants.toString(), icon: <GroupIcon fontSize="large" color="secondary" />, color: '#06b6d4' },
        { label: 'Upcoming Events', value: upcomingEvents.toString(), icon: <TrendingUpIcon fontSize="large" color="success" />, color: '#10b981' },
        { label: 'Revenue', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, icon: <MonetizationOnIcon fontSize="large" color="warning" />, color: '#f59e0b' },
      ]);
      
      console.log('✅ Organizer Dashboard: Stats calculated:', {
        totalEvents,
        totalParticipants,
        upcomingEvents,
        totalRevenue
      });
      
      setLoading(false);
    };

    loadDashboardData();
    
    // Auto-refresh setiap 10 detik (balanced)
    const refreshInterval = setInterval(() => {
      console.log('⏰ Organizer Dashboard: Auto-refresh...');
      loadDashboardData();
    }, 10000);
    
    // Listen for custom events
    const handleEventCreated = () => {
      console.log('🎉 Organizer Dashboard: Event created!');
      loadDashboardData();
    };
    
    const handleStorageChange = () => {
      console.log('💾 Organizer Dashboard: Storage changed!');
      loadDashboardData();
    };
    
    const handleEventDataChanged = () => {
      console.log('📊 Organizer Dashboard: Event data changed!');
      loadDashboardData();
    };
    
    const handleEventStatusChanged = (event: CustomEvent) => {
      console.log('📡 Organizer Dashboard: Event status changed:', event.detail);
      loadDashboardData(); // Immediate refresh
    };
    
    window.addEventListener('eventCreated', handleEventCreated);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('eventDataChanged', handleEventDataChanged);
    window.addEventListener('eventStatusChanged', handleEventStatusChanged as EventListener);
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('eventCreated', handleEventCreated);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('eventDataChanged', handleEventDataChanged);
      window.removeEventListener('eventStatusChanged', handleEventStatusChanged as EventListener);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending_approval': return 'warning';
      case 'approved': return 'info';
      case 'published': return 'success';
      case 'ongoing': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'pending_approval': return 'Menunggu Persetujuan';
      case 'approved': return 'Disetujui';
      case 'published': return 'Dipublikasikan';
      case 'ongoing': return 'Sedang Berlangsung';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      case 'rejected': return 'Ditolak';
      default: return status;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', py: 4 }}>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, borderRadius: 3, background: 'white', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Dashboard Event Organizer
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Selamat datang kembali, {user?.name}!
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              size="large"
              onClick={() => navigate('/organizer/events/new')}
              sx={{
                background: 'linear-gradient(45deg, #4f46e5, #3730a3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #3730a3, #312e81)',
                }
              }}
            >
              Buat Event Baru
            </Button>
          </Box>

          {/* Statistics Cards */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4
          }}>
            {stats.map((stat, index) => (
              <Card key={index} sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: `2px solid ${stat.color}20`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.3s ease'
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: `${stat.color}15`, 
                    width: 56, 
                    height: 56, 
                    mr: 2,
                    color: stat.color
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography color="text.secondary">{stat.label}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>

        {/* Recent Events Table */}
        <Paper sx={{ p: 4, borderRadius: 3, background: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Event Terbaru
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<Visibility />}
              onClick={() => navigate('/organizer/events')}
            >
              Lihat Semua
            </Button>
          </Box>

          {recentEvents.length === 0 ? (
            // EMPTY STATE - Belum ada event yang diupload
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <EventIcon sx={{ 
                fontSize: 80, 
                color: '#e5e7eb', 
                mb: 2 
              }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Belum Ada Event
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Anda belum mengupload event apapun. Mulai buat event pertama Anda!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/organizer/events')}
                sx={{
                  bgcolor: '#4f46e5',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#3730a3',
                  }
                }}
              >
                Buat Event Pertama
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nama Event</strong></TableCell>
                    <TableCell><strong>Tanggal</strong></TableCell>
                    <TableCell><strong>Peserta</strong></TableCell>
                    <TableCell><strong>Progress</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Revenue</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentEvents.map((event) => (
                    <TableRow key={event.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ mr: 1, color: '#4f46e5' }} />
                          {event.name}
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(event.date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        {event.participants}/{event.maxParticipants}
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(event.participants / event.maxParticipants) * 100}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: event.participants >= event.maxParticipants ? '#ef4444' : '#10b981'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(event.status)} 
                          color={getStatusColor(event.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold" color="success.main">
                          Rp {event.revenue.toLocaleString('id-ID')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default OrganizerDashboard;
