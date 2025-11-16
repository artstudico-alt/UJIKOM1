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
import { useNavigate, useLocation } from 'react-router-dom';
// eventService removed - now 100% using database API
import { Event as LocalEvent } from '../types';
import { organizerApiService, OrganizerEvent } from '../services/organizerApiService';

// Helper function to ensure valid status
const ensureValidStatus = (apiStatus: string | undefined): 'draft' | 'pending_approval' | 'approved' | 'published' | 'ongoing' | 'completed' | 'cancelled' | 'rejected' => {
  if (!apiStatus) return 'draft';
  
  const validStatuses = ['draft', 'pending_approval', 'approved', 'published', 'ongoing', 'completed', 'cancelled', 'rejected'];
  return validStatuses.includes(apiStatus) ? apiStatus as any : 'draft';
};

const OrganizerEventManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const refreshEventsFromAPI = async (source = 'manual') => {
    try {
      console.log(`🔄 Refreshing events from API (${source})...`);
      const response = await organizerApiService.getEvents();
      const apiEvents = response.data || [];
      
      console.log('📊 API Events received:', apiEvents.length);
      apiEvents.forEach((event, index) => {
        console.log(`📊 Event ${index + 1}:`, {
          id: event.id,
          title: event.title,
          status: event.status,
          approved_at: event.approved_at,
          rejected_at: event.rejected_at
        });
      });
      
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
        status: ensureValidStatus(event.status),
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
      
      console.log('📊 Final mapped events:', mappedEvents.map(e => ({
        id: e.id,
        name: e.name,
        status: e.status,
        approvedAt: e.approvedAt,
        rejectedAt: e.rejectedAt
      })));
      
      setEvents(mappedEvents);
      console.log('✅ Events refreshed from API:', mappedEvents.length);
    } catch (error) {
      console.error('❌ Failed to refresh from API (database):', error);
      // No localStorage fallback - show error message
      setSnackbar({
        open: true,
        message: 'Gagal memuat data event dari database. Silakan refresh halaman.',
        severity: 'error'
      });
      setEvents([]);
    }
  };

  // Detect navigation from EventForm
  useEffect(() => {
    const state = location.state as any;
    if (state?.refresh || state?.newEventId) {
      console.log('🚀 Navigated from EventForm - Refreshing...');
      refreshEventsFromAPI('navigation');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  // Load events on component mount with aggressive auto-refresh
  useEffect(() => {
    console.log('🎬 OrganizerEventManagement: Component mounted');
    setLoading(true);
    
    // Initial load
    refreshEventsFromAPI('mount').finally(() => setLoading(false));
    
    // Auto-refresh every 10 seconds (balanced performance)
    const autoRefreshInterval = setInterval(() => {
      console.log('⏰ Auto-refresh (10s)');
      refreshEventsFromAPI('auto');
    }, 10000);
    
    // Listen for custom events - Single refresh
    const handleEventCreated = () => {
      console.log('🎉 Event created - Refreshing...');
      refreshEventsFromAPI('event-created');
    };
    
    const handleEventDataChanged = () => {
      console.log('📊 Event data changed - REFRESHING!');
      refreshEventsFromAPI('data-changed');
    };
    
    const handleEventStatusChanged = (event: CustomEvent) => {
      console.log('📡 Event status changed:', event.detail);
      refreshEventsFromAPI('status-changed');
    };
    
    const handleStorageChange = () => {
      console.log('💾 Storage changed - REFRESHING!');
      refreshEventsFromAPI('storage-change');
    };
    
    // Add all event listeners
    window.addEventListener('eventCreated', handleEventCreated);
    window.addEventListener('eventDataChanged', handleEventDataChanged);
    window.addEventListener('eventStatusChanged', handleEventStatusChanged as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      clearInterval(autoRefreshInterval);
      window.removeEventListener('eventCreated', handleEventCreated);
      window.removeEventListener('eventDataChanged', handleEventDataChanged);
      window.removeEventListener('eventStatusChanged', handleEventStatusChanged as EventListener);
      window.removeEventListener('storage', handleStorageChange);
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
                            onClick={async () => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
                                try {
                                  await organizerApiService.deleteEvent(event.id);
                                  // Refresh from database
                                  await refreshEventsFromAPI('delete');
                                  setSnackbar({
                                    open: true,
                                    message: 'Event berhasil dihapus dari database',
                                    severity: 'success'
                                  });
                                } catch (error) {
                                  setSnackbar({
                                    open: true,
                                    message: 'Gagal menghapus event dari database',
                                    severity: 'error'
                                  });
                                }
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
