import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Avatar,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Event as EventIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Person as OrganizerIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { organizerApiService } from '../services/organizerApiService';
import { adminApiService, AdminEvent } from '../services/adminApiService';

const AdminEventManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  const [adminEventForm, setAdminEventForm] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: 100,
    registration_deadline: '',
    price: 0,
    category: 'Conference',
    organizer_name: 'Admin Utama',
    organizer_email: 'admin@gomoment.com',
    organizer_contact: '+6281234567890',
    flyer: null as File | null
  });

  // Load events from database API
  useEffect(() => {
    console.log('🎬 AdminEventManagement: Component mounted');
    console.log('🔐 Auth status:', { isAuthenticated, authLoading, userRole: user?.role });
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('⏳ Waiting for auth to complete...');
      return;
    }
    
    // Check if user is authenticated and is admin
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login...');
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'admin') {
      console.log('❌ User not admin, redirecting to home...');
      navigate('/');
      return;
    }
    
    console.log('✅ Admin authenticated, loading events...');
    
    const loadEvents = async () => {
      console.log('🔄 AdminEventManagement: Loading events from database...');
      setLoading(true);

      try {
        // Load from database API (100% database now)
        const apiEvents = await adminApiService.getAllEvents();
        console.log('✅ AdminEventManagement: Loaded events:', apiEvents.data?.length || 0);
        
        setEvents(apiEvents.data || []);

      } catch (error) {
        console.error('❌ Failed to load events from database:', error);
        setEvents([]);
        setSnackbar({
          open: true,
          message: 'Gagal memuat data event dari database',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    // Add 300ms delay to ensure token is ready
    const loadTimer = setTimeout(() => {
      console.log('🔄 Starting event load after auth confirmation...');
      loadEvents();
    }, 300);

    // Listen for custom event when admin creates/updates event
    const handleEventDataChange = (event: any) => {
      console.log('🔄 AdminEventManagement: Event data changed, reloading events...', event.detail);
      loadEvents();
    };

    window.addEventListener('eventDataChanged', handleEventDataChange);
    window.addEventListener('eventStatusChanged', handleEventDataChange);

    return () => {
      clearTimeout(loadTimer);
      window.removeEventListener('eventDataChanged', handleEventDataChange);
      window.removeEventListener('eventStatusChanged', handleEventDataChange);
    };
  }, [isAuthenticated, authLoading, user]);

  const pendingEvents = events.filter(event => event.status === 'pending_approval');
  const approvedEvents = events.filter(event => event.status === 'published');
  const allEvents = events;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return '#f59e0b';
      case 'published': return '#10b981';
      case 'ongoing': return '#3b82f6';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'Menunggu Persetujuan';
      case 'published': return 'Dipublikasikan';
      case 'ongoing': return 'Sedang Berlangsung';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const handleViewEvent = (event: AdminEvent) => {
    setSelectedEvent(event);
    setViewDialogOpen(true);
  };

  const handleApproveEvent = (event: AdminEvent) => {
    setSelectedEvent(event);
    setApproveDialogOpen(true);
  };

  const handleRejectEvent = (event: AdminEvent) => {
    setSelectedEvent(event);
    setRejectionReason(''); // Reset rejection reason
    setRejectDialogOpen(true);
  };

  const confirmApproveEvent = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    try {
      console.log('🔧 Approving event:', selectedEvent.id);
      
      // Use adminApiService to approve event
      await adminApiService.approveEvent(selectedEvent.id);
      
      console.log('✅ Event approved successfully');
      
      // Reload events from database only
      const apiEvents = await adminApiService.getAllEvents();
      
      // Convert API events to display format
      const convertedApiEvents: AdminEvent[] = (apiEvents.data || []).map(event => ({
        ...event,
        name: event.title || '',
        eventDate: event.date || '',
        startTime: event.start_time || '',
        endTime: event.end_time || '',
        maxParticipants: event.max_participants || 0,
        currentParticipants: event.participants_count || 0,
        registrationDate: event.registration_deadline || '',
        organizerName: event.organizer_name || '',
        organizerEmail: event.organizer_email || '',
        organizerContact: event.organizer_contact || '',
        image: (event as any).image || event.image_url || '',
        createdAt: event.created_at || '',
        submittedAt: event.submitted_at || '',
        approvedAt: event.approved_at || '',
        rejectedAt: event.rejected_at || ''
      } as AdminEvent));
      
      const allEvents = convertedApiEvents;
      setEvents(allEvents);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('eventStatusChanged', {
        detail: {
          eventId: selectedEvent.id,
          newStatus: 'published',
          action: 'approved'
        }
      }));
      
      setApproveDialogOpen(false);
      setSelectedEvent(null);
      setSnackbar({
        open: true,
        message: `Event "${selectedEvent.title}" berhasil disetujui dan dipublikasikan!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error approving event:', error);
      setSnackbar({
        open: true,
        message: 'Gagal menyetujui event',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmRejectEvent = async () => {
    if (!selectedEvent) return;

    console.log('🔍 AdminEventManagement: confirmRejectEvent called', {
      selectedEvent: selectedEvent.id,
      rejectionReason,
      reasonLength: rejectionReason.length,
      reasonTrimmed: rejectionReason.trim(),
      reasonTrimmedLength: rejectionReason.trim().length
    });

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      console.error('❌ Rejection reason is empty');
      setSnackbar({
        open: true,
        message: 'Alasan penolakan harus diisi',
        severity: 'error'
      });
      return;
    }

    if (rejectionReason.trim().length < 10) {
      console.error('❌ Rejection reason too short:', rejectionReason.trim().length);
      setSnackbar({
        open: true,
        message: 'Alasan penolakan minimal 10 karakter',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔧 AdminEventManagement: Rejecting event', {
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        reason: rejectionReason
      });
      
      // Use adminApiService to reject event with custom reason
      await adminApiService.rejectEvent(
        selectedEvent.id,
        rejectionReason.trim()
      );
      
      console.log('✅ AdminEventManagement: Event rejected successfully');
      
      // Reload events
      const apiEvents = await adminApiService.getAllEvents();
      // No localStorage - 100% database only
      
      const convertedApiEvents: AdminEvent[] = (apiEvents.data || []).map(event => ({
        ...event,
        name: event.title || '',
        eventDate: event.date || '',
        startTime: event.start_time || '',
        endTime: event.end_time || '',
        maxParticipants: event.max_participants || 0,
        currentParticipants: event.participants_count || 0,
        registrationDate: event.registration_deadline || '',
        organizerName: event.organizer_name || '',
        organizerEmail: event.organizer_email || '',
        organizerContact: event.organizer_contact || '',
        image: event.image_url || '',
        createdAt: event.created_at || '',
        submittedAt: event.submitted_at || '',
        approvedAt: event.approved_at || '',
        rejectedAt: event.rejected_at || ''
      } as AdminEvent));
      
      const allEvents = convertedApiEvents;
      setEvents(allEvents);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('eventStatusChanged', {
        detail: {
          eventId: selectedEvent.id,
          newStatus: 'rejected',
          action: 'rejected'
        }
      }));

      setSnackbar({
        open: true,
        message: `Event "${selectedEvent.title}" telah ditolak`,
        severity: 'info'
      });
      
      setRejectDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error rejecting event:', error);
      setSnackbar({
        open: true,
        message: 'Gagal menolak event',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: AdminEvent) => {
    // Navigate to edit page with event ID
    navigate(`/admin/events/edit/${event.id}`);
  };

  const handleDeleteEvent = (event: AdminEvent) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    try {
      console.log('🗑️ Deleting event:', selectedEvent.id);
      
      // Call delete API
      await adminApiService.deleteEvent(selectedEvent.id);
      
      console.log('✅ Event deleted successfully');
      
      // Reload events from database
      const apiEvents = await adminApiService.getAllEvents();
      
      // Convert API events to display format
      const convertedApiEvents: AdminEvent[] = (apiEvents.data || []).map(event => ({
        ...event,
        name: event.title || '',
        eventDate: event.date || '',
        startTime: event.start_time || '',
        endTime: event.end_time || '',
        maxParticipants: event.max_participants || 0,
        currentParticipants: event.participants_count || 0,
        registrationDate: event.registration_deadline || '',
        organizerName: event.organizer_name || '',
        organizerEmail: event.organizer_email || '',
        organizerContact: event.organizer_contact || '',
        image: (event as any).image || event.image_url || '',
        createdAt: event.created_at || '',
        submittedAt: event.submitted_at || '',
        approvedAt: event.approved_at || '',
        rejectedAt: event.rejected_at || ''
      } as AdminEvent));
      
      const allEvents = convertedApiEvents;
      setEvents(allEvents);
      
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
      setSnackbar({
        open: true,
        message: `Event "${selectedEvent.title}" berhasil dihapus!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      setSnackbar({
        open: true,
        message: 'Gagal menghapus event',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdminEvent = () => {
    // Navigate to create form like EO (ONLY CREATE uses separate form)
    navigate('/admin/events/create');
  };

  const handleSaveAdminEvent = async () => {
    setLoading(true);
    try {
      console.log('🔧 AdminEventManagement: Starting to create admin event...');
      console.log('🔧 AdminEventManagement: Form data:', adminEventForm);

      // Admin events go directly to published, no approval needed
      const eventData = {
        ...adminEventForm,
        registration_date: adminEventForm.registration_deadline, // Use registration deadline
        organizer_type: 'admin' as const, // Mark as admin event
        status: 'published' as const, // Admin events are published immediately
        flyer: adminEventForm.flyer || undefined // Convert null to undefined
      };

      console.log('🔧 AdminEventManagement: Sending event data:', eventData);
      const response = await organizerApiService.createEvent(eventData);

      console.log('✅ AdminEventManagement: Event created successfully via API:', response);

      // Refresh events list from API (admin + local events combined)
      const apiEvents = await adminApiService.getAllEvents();
      // No localStorage - 100% database only

      const convertedApiEvents: AdminEvent[] = (apiEvents.data || []).map(event => ({
        ...event,
        name: event.title || '',
        eventDate: event.date || '',
        startTime: event.start_time || '',
        endTime: event.end_time || '',
        maxParticipants: event.max_participants || 0,
        currentParticipants: event.participants_count || 0,
        registrationDate: event.registration_deadline || '',
        organizerName: event.organizer_name || '',
        organizerEmail: event.organizer_email || '',
        organizerContact: event.organizer_contact || '',
        // Use processed image URL from backend EventResource first
        image: event.image || event.image_url || '',
        createdAt: event.created_at || '',
        submittedAt: event.submitted_at || '',
        approvedAt: event.approved_at || '',
        rejectedAt: event.rejected_at || ''
      } as AdminEvent));

      const allEvents = convertedApiEvents;
      console.log('🔄 AdminEventManagement: Refreshed events count:', allEvents.length);
      setEvents(allEvents);

      // Close dialog and reset form
      setCreateEventDialogOpen(false);
      setAdminEventForm({
        title: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        location: '',
        max_participants: 100,
        registration_deadline: '',
        price: 0,
        category: 'Conference',
        organizer_name: 'Admin Utama',
        organizer_email: 'admin@gomoment.com',
        organizer_contact: '+6281234567890',
        flyer: null
      });

      setSnackbar({
        open: true,
        message: `Event "${adminEventForm.title}" berhasil dibuat dan dipublikasikan!`,
        severity: 'success'
      });

      console.log('🎉 AdminEventManagement: Admin event creation completed successfully!');

    } catch (error) {
      console.error('❌ AdminEventManagement: Error creating event:', error);
      setSnackbar({
        open: true,
        message: 'Gagal membuat event',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const renderEventTable = (eventList: AdminEvent[]) => (
    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Penyelenggara</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tanggal & Waktu</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Lokasi</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {eventList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <EventIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="body1" color="text.secondary">
                    {tabValue === 0 ? 'Tidak ada event yang menunggu persetujuan' : 'Tidak ada event'}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            eventList.map((event) => (
              <TableRow key={event.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {event.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.category}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {event.organizer_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.organizer_email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {formatDate(event.date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.start_time} - {event.end_time}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {event.location}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(event.status)}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(event.status)}15`,
                      color: getStatusColor(event.status),
                      fontWeight: 600,
                      border: `1px solid ${getStatusColor(event.status)}30`
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewEvent(event)}
                      sx={{ color: '#6366f1' }}
                      title="Lihat Detail"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      sx={{ color: '#f59e0b' }}
                      title="Edit Event"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event);
                      }}
                      sx={{ color: '#ef4444' }}
                      title="Hapus Event"
                    >
                      <DeleteIcon />
                    </IconButton>
                    {event.status === 'pending_approval' && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleApproveEvent(event)}
                          sx={{ color: '#10b981' }}
                          title="Setujui Event"
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleRejectEvent(event)}
                          sx={{ color: '#ef4444' }}
                          title="Tolak Event"
                        >
                          <RejectIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{
      minHeight: '100vh',
      py: 4,
      overflow: 'auto',
      maxHeight: '100vh'
    }}>
      <Container maxWidth="xl" sx={{
        height: 'auto',
        overflow: 'visible'
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                bgcolor: '#4f46e5',
                width: 48,
                height: 48,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}>
                <EventIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{
                  color: '#1e293b',
                  background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Event Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Kelola persetujuan dan publikasi event dari organizer
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<EventIcon />}
                onClick={handleCreateAdminEvent}
                sx={{
                  bgcolor: '#10b981',
                  '&:hover': { bgcolor: '#059669' },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Tambah Event Baru
              </Button>

              {pendingEvents.length > 0 && (
                <Badge badgeContent={pendingEvents.length} color="warning">
                  <NotificationIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
                </Badge>
              )}
            </Box>
          </Box>
        </Box>

        {/* Notification Alert */}
        {pendingEvents.length > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2 }}
            icon={<WarningIcon />}
          >
            <Typography variant="body2">
              <strong>{pendingEvents.length} event</strong> menunggu persetujuan Anda untuk dipublikasikan
            </Typography>
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon />
                  Menunggu Persetujuan
                  {pendingEvents.length > 0 && (
                    <Chip
                      label={pendingEvents.length}
                      size="small"
                      color="warning"
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon />
                  Semua Event
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {/* Event Tables */}
        {tabValue === 0 && renderEventTable(pendingEvents)}
        {tabValue === 1 && renderEventTable(allEvents)}

        {/* View Event Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Detail Event
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedEvent && (
              <Box sx={{ pt: 2 }}>
                {/* Event Info */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {selectedEvent.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(selectedEvent.status)}
                      sx={{
                        bgcolor: `${getStatusColor(selectedEvent.status)}15`,
                        color: getStatusColor(selectedEvent.status),
                        fontWeight: 600,
                        mb: 2
                      }}
                    />
                  </Box>

                  {/* Organizer Info & Event Details */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 3
                  }}>
                    {/* Organizer Info */}
                    <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#4f46e5' }}>
                        <OrganizerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Informasi Penyelenggara
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>Nama:</strong> {selectedEvent.organizer_name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          color: selectedEvent.organizer_email ? 'inherit' : '#999',
                          fontStyle: selectedEvent.organizer_email ? 'normal' : 'italic'
                        }}>
                          <EmailIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                          {selectedEvent.organizer_email || 'Email tidak tersedia'}
                        </Typography>
                        <Typography variant="body2">
                          <PhoneIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                          {selectedEvent.organizer_contact || 'Kontak tidak tersedia'}
                        </Typography>
                        {selectedEvent.status === 'pending_approval' && (
                          <Typography variant="caption" sx={{ 
                            color: '#f59e0b', 
                            fontWeight: 600,
                            display: 'block',
                            mt: 1,
                            p: 1,
                            bgcolor: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: 1
                          }}>
                            ⚠️ Event ini dibuat oleh Event Organizer dan memerlukan persetujuan
                          </Typography>
                        )}
                      </Box>
                    </Card>

                    {/* Event Details */}
                    <Card sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: '#059669' }}>
                        <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Jadwal Event
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>Pendaftaran:</strong> {formatDate(selectedEvent.registration_deadline || selectedEvent.date)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Tanggal Event:</strong> {formatDate(selectedEvent.date)}
                        </Typography>
                        <Typography variant="body2">
                          <TimeIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                          {selectedEvent.start_time} - {selectedEvent.end_time}
                        </Typography>
                      </Box>
                    </Card>
                  </Box>

                  {/* Description */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Deskripsi Event
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#fafafa' }}>
                      <Typography variant="body2">
                        {selectedEvent.description}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Additional Info */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 3
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Lokasi
                      </Typography>
                      <Typography variant="body2">
                        {selectedEvent.location}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Kapasitas & Harga
                      </Typography>
                      <Typography variant="body2">
                        Maksimal: {selectedEvent.max_participants} peserta
                      </Typography>
                      <Typography variant="body2">
                        Harga: {selectedEvent.price === 0 ? 'Gratis' : formatCurrency(selectedEvent.price || 0)}
                      </Typography>
                      {selectedEvent.category && (
                        <Typography variant="body2">
                          Kategori: {selectedEvent.category}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Tutup
            </Button>
            {selectedEvent?.status === 'pending_approval' && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleRejectEvent(selectedEvent);
                  }}
                >
                  Tolak
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleApproveEvent(selectedEvent);
                  }}
                >
                  Setujui
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Approve Confirmation Dialog */}
        <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'success.main' }}>
              Konfirmasi Persetujuan Event
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Apakah Anda yakin ingin menyetujui dan mempublikasikan event "{selectedEvent?.title}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Event akan langsung tampil di halaman publik dan peserta dapat mendaftar.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproveDialogOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={confirmApproveEvent}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Setujui & Publikasikan'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Confirmation Dialog */}
        <Dialog 
          open={rejectDialogOpen} 
          onClose={() => !loading && setRejectDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'error.main' }}>
              Konfirmasi Penolakan Event
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Apakah Anda yakin ingin menolak event "{selectedEvent?.title}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Event akan dibatalkan dan organizer akan mendapat notifikasi penolakan.
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Alasan Penolakan *"
              placeholder="Jelaskan alasan penolakan event ini (minimal 10 karakter)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={loading}
              required
              error={rejectionReason.length > 0 && rejectionReason.length < 10}
              helperText={
                rejectionReason.length > 0 && rejectionReason.length < 10
                  ? 'Alasan penolakan minimal 10 karakter'
                  : 'Alasan ini akan dikirim ke organizer'
              }
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
              }} 
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmRejectEvent}
              disabled={loading || !rejectionReason || rejectionReason.trim().length < 10}
              startIcon={loading ? <CircularProgress size={20} /> : <RejectIcon />}
            >
              {loading ? 'Menolak...' : 'Tolak Event'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => !loading && setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'error.main' }}>
              ⚠️ Konfirmasi Hapus Event
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">
                Perhatian! Tindakan ini tidak dapat dibatalkan.
              </Typography>
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Apakah Anda yakin ingin menghapus event "<strong>{selectedEvent?.title}</strong>"?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Semua data terkait event ini akan dihapus secara permanen, termasuk:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Data peserta yang terdaftar
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                History pembayaran
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Sertifikat yang telah diterbitkan
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={loading}
              variant="outlined"
            >
              Batal
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDeleteEvent}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              {loading ? 'Menghapus...' : 'Ya, Hapus Event'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Admin Create Event Dialog */}
        <Dialog
          open={createEventDialogOpen}
          onClose={() => setCreateEventDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              🎯 Buat Event Baru (Admin)
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField
                label="Judul Event"
                value={adminEventForm.title}
                onChange={(e) => setAdminEventForm({ ...adminEventForm, title: e.target.value })}
                fullWidth
                required
              />

              <TextField
                label="Deskripsi Event"
                value={adminEventForm.description}
                onChange={(e) => setAdminEventForm({ ...adminEventForm, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                required
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Tanggal Deadline Pendaftaran"
                  type="date"
                  value={adminEventForm.registration_deadline}
                  onChange={(e) => setAdminEventForm({ ...adminEventForm, registration_deadline: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  label="Tanggal Event"
                  type="date"
                  value={adminEventForm.date}
                  onChange={(e) => setAdminEventForm({ ...adminEventForm, date: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Waktu Mulai"
                  type="time"
                  value={adminEventForm.start_time}
                  onChange={(e) => setAdminEventForm({ ...adminEventForm, start_time: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  label="Waktu Selesai"
                  type="time"
                  value={adminEventForm.end_time}
                  onChange={(e) => setAdminEventForm({ ...adminEventForm, end_time: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>

              <TextField
                label="Lokasi"
                value={adminEventForm.location}
                onChange={(e) => setAdminEventForm({ ...adminEventForm, location: e.target.value })}
                fullWidth
                required
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Maksimal Peserta"
                  type="number"
                  value={adminEventForm.max_participants}
                  onChange={(e) => setAdminEventForm({ ...adminEventForm, max_participants: parseInt(e.target.value) || 0 })}
                  fullWidth
                  required
                />
                <TextField
                  label="Harga Tiket (IDR)"
                  type="number"
                  value={adminEventForm.price}
                  onChange={(e) => setAdminEventForm({ ...adminEventForm, price: parseInt(e.target.value) || 0 })}
                  fullWidth
                />
              </Box>

              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={adminEventForm.category}
                  onChange={(e) => setAdminEventForm({ ...adminEventForm, category: e.target.value })}
                  label="Kategori"
                >
                  <MenuItem value="Conference">Conference</MenuItem>
                  <MenuItem value="Workshop">Workshop</MenuItem>
                  <MenuItem value="Seminar">Seminar</MenuItem>
                  <MenuItem value="Webinar">Webinar</MenuItem>
                  <MenuItem value="Training">Training</MenuItem>
                </Select>
              </FormControl>

              {/* Upload Gambar/Flyer */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: '#4f46e5' }}>
                  🖼️ Upload Flyer/Poster Event
                </Typography>
                <TextField
                  type="file"
                  inputProps={{ accept: 'image/jpeg,image/jpg,image/png,image/gif' }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setAdminEventForm({ ...adminEventForm, flyer: file });
                    }
                  }}
                  helperText="Format: JPEG, JPG, PNG, GIF. Maksimal 5MB"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                {/* Preview gambar jika ada */}
                {adminEventForm.flyer && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#4f46e5' }}>
                      📁 File terpilih: {adminEventForm.flyer.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ukuran: {(adminEventForm.flyer.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateEventDialogOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAdminEvent}
              disabled={loading || !adminEventForm.title || !adminEventForm.description}
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
            >
              {loading ? <CircularProgress size={20} /> : 'Buat & Publikasikan Event'}
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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminEventManagement;
