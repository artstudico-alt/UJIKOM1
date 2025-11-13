import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { eventService, Event as LocalEvent } from '../services/eventService';
import { organizerApiService, OrganizerEvent } from '../services/organizerApiService';

// Helper function to map API status to LocalEvent status
const mapApiStatusToLocalStatus = (apiStatus: string | undefined): 'draft' | 'pending_approval' | 'published' | 'ongoing' | 'completed' | 'cancelled' => {
  if (!apiStatus) return 'draft';
  
  switch (apiStatus.toLowerCase()) {
    case 'pending':
    case 'pending_approval':
      return 'pending_approval';
    case 'approved':
    case 'published':
      return 'published';
    case 'ongoing':
      return 'ongoing';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'draft';
  }
};

const OrganizerEventManagement: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Function to refresh events from API
  const refreshEventsFromAPI = async () => {
    try {
      console.log('🔄 Refreshing events from API...');
      const response = await organizerApiService.getEvents();
      const apiEvents = response.data || [];
      
      // Convert API events to LocalEvent format
      const mappedEvents: LocalEvent[] = apiEvents.map(event => ({
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
        status: mapApiStatusToLocalStatus(event.status) || 'draft',
        category: event.category || '',
        organizer: event.organizer_name || '',
        organizerName: event.organizer_name || '',
        organizerEmail: event.organizer_email || '',
        organizerContact: event.organizer_contact || '',
        image: event.image_url || '',
        createdAt: event.created_at || '',
        submittedAt: event.submitted_at || '',
        approvedAt: event.approved_at || '',
        rejectedAt: event.rejected_at || '',
      }));
      
      setEvents(mappedEvents);
      console.log('✅ Events refreshed from API:', mappedEvents.length);
    } catch (error) {
      console.warn('⚠️ Failed to refresh from API, falling back to localStorage:', error);
      // Fallback to localStorage if API fails
      const localEvents = eventService.getAllEvents();
      setEvents(localEvents);
    }
  };

  // Load events from API on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Organizer: Loading events from API...');
        
        // Check authentication first
        const authToken = localStorage.getItem('auth_token');
        const user = localStorage.getItem('user');
        
        if (!authToken || !user) {
          console.warn('🔐 Organizer: No authentication token found, trying public API...');
          // Try public API first (better fallback than localStorage)
          try {
            const publicResponse = await organizerApiService.getEventsWithoutAuth();
            const publicEvents = publicResponse.data || [];
            
            // Convert API events to LocalEvent format
            const mappedPublicEvents: LocalEvent[] = publicEvents.map(event => ({
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
              status: mapApiStatusToLocalStatus(event.status) || 'draft',
              category: event.category || '',
              organizer: event.organizer_name || '',
              organizerName: event.organizer_name || '',
              organizerEmail: event.organizer_email || '',
              organizerContact: event.organizer_contact || '',
              image: event.image_url || '',
              createdAt: event.created_at || '',
              submittedAt: event.submitted_at || '',
              approvedAt: event.approved_at || '',
              rejectedAt: event.rejected_at || '',
            }));
            
            setEvents(mappedPublicEvents);
            console.log('✅ Organizer: Loaded from public API:', mappedPublicEvents.length);
            return;
          } catch (publicApiError) {
            console.warn('🔐 Organizer: Public API also failed, falling back to localStorage');
            // Only use localStorage as last resort
            const localEvents = eventService.getAllEvents();
            setEvents(localEvents);
            console.log('✅ Organizer: Loaded from localStorage fallback:', localEvents.length);
            return;
          }
        }
        
        await refreshEventsFromAPI();
        
      } catch (err: any) {
        console.error('❌ Failed to load events from API:', err);
        setError(err.message || 'Failed to load events');
        
        // Fallback to localStorage if API fails
        console.log('🔄 Falling back to localStorage...');
        const localEvents = eventService.getAllEvents();
        setEvents(localEvents);
        console.log('✅ Organizer: Loaded from localStorage fallback:', localEvents.length);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
    
    // Add refresh interval to periodically check for new data
    const refreshInterval = setInterval(() => {
      console.log('🔄 Organizer: Auto-refreshing events...');
      loadEvents();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(refreshInterval);
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

  const getStatusLabel = (status: string) => {
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ p: 4, borderRadius: 3, background: 'white', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Event Management
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Kelola semua event Anda
              </Typography>
              {!localStorage.getItem('auth_token') && (
                <Box sx={{ mt: 1, p: 1, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
                  <Typography variant="body2" color="#856404">
                    ⚠️ Anda belum login. Event akan disimpan lokal. <strong>Login untuk sinkronisasi ke database.</strong>
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await refreshEventsFromAPI();
                    setSnackbar({
                      open: true,
                      message: 'Data event berhasil diperbarui',
                      severity: 'success'
                    });
                  } catch (error) {
                    setSnackbar({
                      open: true,
                      message: 'Gagal memperbarui data event',
                      severity: 'error'
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Memperbarui...' : 'Refresh Data'}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/organizer/create-event')}
                sx={{ bgcolor: '#4f46e5', '&:hover': { bgcolor: '#3730a3' } }}
              >
                Tambah Event Baru
              </Button>
            </Box>
          </Box>

          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Cari event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              sx={{ flex: 1 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending_approval">Menunggu Persetujuan</MenuItem>
                <MenuItem value="published">Dipublikasikan</MenuItem>
                <MenuItem value="ongoing">Sedang Berlangsung</MenuItem>
                <MenuItem value="completed">Selesai</MenuItem>
                <MenuItem value="cancelled">Dibatalkan</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Events Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredEvents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {events.length === 0 ? 'Belum ada event' : 'Tidak ada event yang sesuai filter'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {events.length === 0 ? 'Mulai dengan membuat event pertama Anda' : 'Coba ubah kriteria pencarian'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Lokasi</TableCell>
                    <TableCell>Peserta</TableCell>
                    <TableCell>Harga</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#4f46e5' }}>
                            <EventIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {event.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {event.category}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(event.eventDate).toLocaleDateString('id-ID')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.startTime} - {event.endTime}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{event.location}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {event.currentParticipants}/{event.maxParticipants || '∞'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {event.price === 0 ? 'Gratis' : `Rp ${event.price.toLocaleString()}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(event.status)}
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/organizer/edit-event/${event.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
                                eventService.deleteEvent(event.id);
                                const updatedEvents = eventService.getAllEvents();
                                setEvents(updatedEvents);
                                setSnackbar({
                                  open: true,
                                  message: 'Event berhasil dihapus',
                                  severity: 'success'
                                });
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrganizerEventManagement;
