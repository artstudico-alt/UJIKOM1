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
import { eventService, Event } from '../services/eventService';

interface OrganizerEvent {
  id: number;
  name: string;
  date: string;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
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

  useEffect(() => {
    // Load real data from eventService
    const loadDashboardData = () => {
      console.log('🔍 Organizer Dashboard: Loading events...');
      
      // Get all events from localStorage
      const events = eventService.getAllEvents();
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
        status: event.status === 'published' ? 'upcoming' : 
                event.status === 'ongoing' ? 'ongoing' : 
                event.status === 'completed' ? 'completed' : 'upcoming',
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
    };

    loadDashboardData();
    
    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      console.log('🔄 Organizer Dashboard: Storage changed, reloading...');
      loadDashboardData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('eventDataChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('eventDataChanged', handleStorageChange);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'ongoing': return 'success';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Akan Datang';
      case 'ongoing': return 'Berlangsung';
      case 'completed': return 'Selesai';
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
