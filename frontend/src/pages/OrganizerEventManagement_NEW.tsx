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
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { organizerApiService, OrganizerEvent } from '../services/organizerApiService';

/**
 * OrganizerEventManagement - REBUILT VERSION
 * 100% Database Integration
 * Clean Architecture
 * All Features Working
 */
const OrganizerEventManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // State Management
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<OrganizerEvent | null>(null);
  
  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // ============================================
  // AUTH CHECK & DATA LOADING
  // ============================================
  useEffect(() => {
    console.log('🎬 [NEW] OrganizerEventManagement: Component mounted');
    console.log('🔐 Auth status:', { isAuthenticated, authLoading, userRole: user?.role });

    // Wait for auth to complete
    if (authLoading) {
      console.log('⏳ Waiting for auth...');
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login...');
      navigate('/login');
      return;
    }

    console.log('✅ User authenticated, loading events...');

    // Load events with delay to ensure token is ready
    const loadTimer = setTimeout(() => {
      console.log('🔄 Starting event load after auth confirmation...');
      loadEventsFromDatabase();
    }, 300);

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('⏰ Auto-refresh triggered');
      loadEventsFromDatabase(true); // Silent refresh
    }, 30000);

    // Cleanup
    return () => {
      clearTimeout(loadTimer);
      clearInterval(refreshInterval);
    };
  }, [isAuthenticated, authLoading, user, navigate]);

  // ============================================
  // LOAD EVENTS FROM DATABASE
  // ============================================
  const loadEventsFromDatabase = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      console.log('📡 Fetching events from database...');
      const response = await organizerApiService.getEvents();

      if (response.status === 'success' && response.data) {
        const eventsData = response.data;
        console.log('✅ Events loaded successfully:', eventsData.length);
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        
        if (!silent) {
          setSnackbar({
            open: true,
            message: `Berhasil memuat ${eventsData.length} event`,
            severity: 'success',
          });
        }
      } else {
        throw new Error('Failed to load events');
      }
    } catch (error: any) {
      console.error('❌ Error loading events:', error);
      setEvents([]);
      setFilteredEvents([]);
      
      if (!silent) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Gagal memuat data event',
          severity: 'error',
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ============================================
  // FILTER & SEARCH
  // ============================================
  useEffect(() => {
    let filtered = [...events];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Search by title or description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }, [events, statusFilter, searchQuery]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleCreateEvent = () => {
    navigate('/organizer/events/create');
  };

  const handleEditEvent = (event: OrganizerEvent) => {
    navigate(`/organizer/events/edit/${event.id}`);
  };

  const handleViewEvent = (event: OrganizerEvent) => {
    navigate(`/organizer/events/${event.id}`);
  };

  const handleDeleteClick = (event: OrganizerEvent) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent?.id) return;

    try {
      console.log('🗑️ Deleting event:', selectedEvent.id);
      await organizerApiService.deleteEvent(selectedEvent.id);
      
      console.log('✅ Event deleted successfully');
      setSnackbar({
        open: true,
        message: 'Event berhasil dihapus',
        severity: 'success',
      });
      
      // Reload events
      loadEventsFromDatabase(true);
      
    } catch (error: any) {
      console.error('❌ Error deleting event:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Gagal menghapus event',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadEventsFromDatabase();
  };

  // ============================================
  // UI HELPERS
  // ============================================
  const getStatusColor = (status?: string): 'default' | 'warning' | 'info' | 'success' | 'error' => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending_approval': return 'warning';
      case 'approved': return 'info';
      case 'published': return 'success';
      case 'ongoing': return 'success';
      case 'completed': return 'info';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'pending_approval': return 'Menunggu Persetujuan';
      case 'approved': return 'Disetujui';
      case 'published': return 'Dipublikasikan';
      case 'ongoing': return 'Sedang Berlangsung';
      case 'completed': return 'Selesai';
      case 'rejected': return 'Ditolak';
      case 'cancelled': return 'Dibatalkan';
      default: return status || 'Unknown';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Manajemen Event
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kelola semua event Anda di sini
        </Typography>
      </Box>

      {/* Action Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <TextField
            placeholder="Cari event..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Semua Status</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="pending_approval">Menunggu Persetujuan</MenuItem>
              <MenuItem value="approved">Disetujui</MenuItem>
              <MenuItem value="published">Dipublikasikan</MenuItem>
              <MenuItem value="rejected">Ditolak</MenuItem>
            </Select>
          </FormControl>

          {/* Refresh Button */}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>

          {/* Create Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateEvent}
          >
            Buat Event Baru
          </Button>
        </Box>
      </Paper>

      {/* Events Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : filteredEvents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Tidak ada event
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Tidak ada event yang sesuai dengan filter'
                : 'Mulai dengan membuat event baru'}
            </Typography>
            {!searchQuery && statusFilter === 'all' && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateEvent}>
                Buat Event Baru
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Judul Event</strong></TableCell>
                  <TableCell><strong>Tanggal</strong></TableCell>
                  <TableCell><strong>Lokasi</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Aksi</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(event.date)}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {event.start_time} - {event.end_time}
                      </Typography>
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(event.status)}
                        color={getStatusColor(event.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewEvent(event)}
                        title="Lihat Detail"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleEditEvent(event)}
                        title="Edit Event"
                        disabled={event.status === 'published' || event.status === 'completed'}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(event)}
                        title="Hapus Event"
                        disabled={event.status === 'published' || event.status === 'ongoing'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Summary */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Menampilkan {filteredEvents.length} dari {events.length} event
        </Typography>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Konfirmasi Hapus Event</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus event <strong>{selectedEvent?.title}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrganizerEventManagement;
