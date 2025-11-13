import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AdminPanelSettings as AdminIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  School as CertificateIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MonetizationOn
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { eventService } from '../../services/api';
import { Event } from '../../types';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const EventManagement: React.FC = () => {
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificateEnabled, setCertificateEnabled] = useState(false);

  // Fetch events from API
  const { data: eventsResponse, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => eventService.getAllEvents({ per_page: 100 }),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const events = eventsResponse?.data || [];
  const queryClient = useQueryClient();

  // Form states for new event
  // Helper function untuk mendapatkan tanggal default yang valid
  const getDefaultDates = () => {
    const today = new Date();
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + 5); // Event di H+5 (minimal H-3 dari pelaksanaan)
    
    const regDeadline = new Date(today);
    regDeadline.setDate(today.getDate() + 2); // Registration deadline H+2
    
    return {
      eventDate: eventDate.toISOString().split('T')[0],
      regDeadline: regDeadline.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();

  // Helper function for default form values
  const getDefaultEventForm = () => ({
    title: '',
    description: '',
    date: defaultDates.eventDate,
    start_time: '09:00',
    end_time: '17:00',
    location: '',
    max_participants: 100,
    registration_deadline: defaultDates.regDeadline,
    flyer: null as File | null,
    status: true as boolean,
  });

  const [eventForm, setEventForm] = useState(getDefaultEventForm());

  // Debug form state when dialog opens
  useEffect(() => {
    if (eventDialogOpen) {
      console.log('=== DIALOG OPENED ===');
      console.log('Dialog rendered with eventForm:', eventForm);
      console.log('Dialog rendered with selectedEvent:', selectedEvent);
      console.log('EventForm title:', eventForm.title);
      console.log('EventForm description:', eventForm.description);
      console.log('EventForm date:', eventForm.date);
      console.log('EventForm start_time:', eventForm.start_time);
      console.log('EventForm end_time:', eventForm.end_time);
      console.log('EventForm location:', eventForm.location);
      console.log('EventForm max_participants:', eventForm.max_participants);
      console.log('EventForm registration_deadline:', eventForm.registration_deadline);
      console.log('EventForm status:', eventForm.status);
      console.log('EventForm flyer:', eventForm.flyer);
      console.log('=== END DIALOG DEBUG ===');
    }
  }, [eventDialogOpen, eventForm, selectedEvent]);

  // Form states for new admin
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '',
    confirm_password: ''
  });

  const handleEventSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('=== Starting Event Submit ===');
      console.log('Selected Event:', selectedEvent);
      console.log('Event Form State:', eventForm);
      console.log('Event Form Keys:', Object.keys(eventForm));
      console.log('Event Form Values:', Object.values(eventForm));
      console.log('=== HANDLE EVENT SUBMIT DEBUG ===');
      console.log('Event Form Title:', eventForm.title);
      console.log('Event Form Description:', eventForm.description);
      console.log('Event Form Date:', eventForm.date);
      console.log('Event Form Start Time:', eventForm.start_time);
      console.log('Event Form End Time:', eventForm.end_time);
      console.log('Event Form Location:', eventForm.location);
      console.log('Event Form Max Participants:', eventForm.max_participants);
      console.log('Event Form Registration Deadline:', eventForm.registration_deadline);
      console.log('Event Form Status:', eventForm.status);
      console.log('Event Form Flyer:', eventForm.flyer);
      console.log('=== END HANDLE EVENT SUBMIT DEBUG ===');
      
      // Validate required fields
      if (!eventForm.title.trim()) {
        setSnackbar({
          open: true,
          message: 'Judul event harus diisi',
          severity: 'error'
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!eventForm.description.trim()) {
        setSnackbar({
          open: true,
          message: 'Deskripsi event harus diisi',
          severity: 'error'
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!eventForm.location.trim()) {
        setSnackbar({
          open: true,
          message: 'Lokasi event harus diisi',
          severity: 'error'
        });
        setIsSubmitting(false);
        return;
      }
      
      // Validate dates before sending
      const today = new Date().toISOString().split('T')[0];
      if (eventForm.date < today) {
        setSnackbar({
          open: true,
          message: 'Tanggal event tidak boleh lebih awal dari hari ini',
          severity: 'error'
        });
        setIsSubmitting(false);
        return;
      }
      
      if (eventForm.registration_deadline > eventForm.date) {
        setSnackbar({
          open: true,
          message: 'Batas pendaftaran tidak boleh lebih dari tanggal event',
          severity: 'error'
        });
        setIsSubmitting(false);
        return;
      }
      
      if (eventForm.start_time >= eventForm.end_time) {
        setSnackbar({
          open: true,
          message: 'Waktu mulai harus lebih awal dari waktu selesai',
          severity: 'error'
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create FormData with all required fields
      const formData = new FormData();
      
      // Debug form data before appending
      console.log('=== FORM DATA CREATION ===');
      console.log('eventForm:', eventForm);
      
      // Add all required fields with explicit values
      formData.append('title', eventForm.title || '');
      formData.append('description', eventForm.description || '');
      formData.append('date', eventForm.date || '');
      formData.append('start_time', eventForm.start_time || '');
      formData.append('end_time', eventForm.end_time || '');
      formData.append('location', eventForm.location || '');
      formData.append('max_participants', String(eventForm.max_participants || 0));
      formData.append('registration_deadline', eventForm.registration_deadline || '');
      
      console.log('Form data values:', {
        title: eventForm.title,
        date: eventForm.date,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time,
        registration_deadline: eventForm.registration_deadline
      });
      
      // Add status field
      formData.append('is_active', eventForm.status ? '1' : '0');
      
      // Add flyer if it's a valid file
      console.log('=== FLYER FILE DEBUG ===');
      console.log('eventForm.flyer:', eventForm.flyer);
      console.log('eventForm.flyer instanceof File:', eventForm.flyer instanceof File);
      console.log('eventForm.flyer type:', typeof eventForm.flyer);
      
      if (eventForm.flyer && eventForm.flyer instanceof File) {
        formData.append('flyer', eventForm.flyer);
        console.log('✅ Adding flyer file:', eventForm.flyer.name, 'Size:', eventForm.flyer.size);
        console.log('✅ Flyer file added to FormData');
      } else {
        console.log('❌ No flyer file to add');
        console.log('❌ eventForm.flyer is:', eventForm.flyer);
      }
      console.log('=== END FLYER FILE DEBUG ===');
      
      
      
      // Debug FormData content
      console.log('=== FORMDATA CONTENT DEBUG ===');
      console.log('FormData entries count:', Array.from(formData.entries()).length);
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value} (type: ${typeof value})`);
        }
      });
      console.log('=== END FORMDATA CONTENT DEBUG ===');
      
      // Additional debug - check if FormData is actually populated
      console.log('=== FORMDATA VERIFICATION ===');
      console.log('FormData size:', Array.from(formData.entries()).length);
      console.log('FormData has title:', formData.has('title'));
      console.log('FormData has description:', formData.has('description'));
      console.log('FormData has date:', formData.has('date'));
      console.log('FormData has flyer:', formData.has('flyer'));
      console.log('=== END FORMDATA VERIFICATION ===');
      
      // Debug logging - FormData contents
      console.log('=== FormData Debug ===');
      console.log('Form data values:', {
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time,
        location: eventForm.location,
        max_participants: eventForm.max_participants,
        registration_deadline: eventForm.registration_deadline,
        status: eventForm.status,
        hasFlyer: !!eventForm.flyer,
        isUpdate: !!selectedEvent,
      });
      
      // Debug FormData contents
      console.log('FormData contents:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });
      console.log('=== End FormData Debug ===');

    if (selectedEvent) {
      // Update existing event
        console.log('=== API CALL DEBUG ===');
        console.log('Calling updateEvent with ID:', selectedEvent.id);
        console.log('FormData entries count:', Array.from(formData.entries()).length);
        console.log('Form data being sent:', {
          title: formData.get('title'),
          description: formData.get('description'),
          date: formData.get('date'),
          start_time: formData.get('start_time'),
          end_time: formData.get('end_time'),
          location: formData.get('location'),
          max_participants: formData.get('max_participants'),
          registration_deadline: formData.get('registration_deadline'),
          is_active: formData.get('is_active')
        });
        console.log('=== END API CALL DEBUG ===');
        
        const response = await eventService.updateEvent(selectedEvent.id, formData);
        console.log('=== UPDATE RESPONSE ===');
        console.log('Response:', response);
        console.log('=== UPDATE RESPONSE ===');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Response status:', response.status);
        console.log('Updated event title:', response.data?.title);
        console.log('Updated event description:', response.data?.description);
        console.log('========================');
        
        // Invalidate all event-related queries with different patterns
        await queryClient.invalidateQueries({ queryKey: ['admin-events'] });
        await queryClient.invalidateQueries({ queryKey: ['events'] });
        await queryClient.invalidateQueries({ queryKey: ['event'] });
        await queryClient.invalidateQueries({ queryKey: ['my-events'] });
        await queryClient.invalidateQueries({ queryKey: ['events-with-certificates'] });
        await queryClient.invalidateQueries({ queryKey: ['admin-events-certificates'] });
        
        // Invalidate queries with parameters (for EventList and Events pages)
        await queryClient.invalidateQueries({ 
          queryKey: ['events'], 
          exact: false 
        });
        
        // Force refetch dengan fresh data
        await queryClient.refetchQueries({ queryKey: ['admin-events'] });
        await queryClient.refetchQueries({ queryKey: ['events'] });
        
        // Manual refetch juga
        await refetchEvents();
        
        // Update the selected event with fresh data
        if (selectedEvent) {
          const updatedEvent = await eventService.getEvent(selectedEvent.id);
          setSelectedEvent(updatedEvent.data);
          
          // Force refresh the events list with extra cache busting
          await queryClient.invalidateQueries({ 
            queryKey: ['admin-events'], 
            exact: false 
          });
          await queryClient.refetchQueries({ 
            queryKey: ['admin-events'],
            type: 'active'
          });
        }
        
        console.log('Event updated successfully, all caches invalidated and refetched');
        
      setSnackbar({
        open: true,
        message: 'Event berhasil diupdate',
        severity: 'success'
      });
        
        // Close dialog after successful update
        setEventDialogOpen(false);
        setSelectedEvent(null);
        
        // Reset form after dialog is closed
        setTimeout(() => {
          setEventForm(getDefaultEventForm());
        }, 100);
    } else {
      // Add new event
        const response = await eventService.createEvent(formData);
        
        // Invalidate all event-related queries with different patterns
        await queryClient.invalidateQueries({ queryKey: ['admin-events'] });
        await queryClient.invalidateQueries({ queryKey: ['events'] });
        await queryClient.invalidateQueries({ queryKey: ['event'] });
        await queryClient.invalidateQueries({ queryKey: ['my-events'] });
        await queryClient.invalidateQueries({ queryKey: ['events-with-certificates'] });
        await queryClient.invalidateQueries({ queryKey: ['admin-events-certificates'] });
        
        // Invalidate queries with parameters (for EventList and Events pages)
        await queryClient.invalidateQueries({ 
          queryKey: ['events'], 
          exact: false 
        });
        
        // Force refetch dengan fresh data
        await queryClient.refetchQueries({ queryKey: ['admin-events'] });
        await queryClient.refetchQueries({ queryKey: ['events'] });
        
        // Manual refetch juga
        await refetchEvents();
        
        console.log('Event created successfully, all caches invalidated and refetched');
        
      setSnackbar({
        open: true,
        message: 'Event berhasil ditambahkan',
        severity: 'success'
      });
    
        // Close dialog after successful creation
    setEventDialogOpen(false);
    setSelectedEvent(null);
        
        // Reset form after dialog is closed
        setTimeout(() => {
          setEventForm(getDefaultEventForm());
        }, 100);
      }
      
      // Data already updated in local state above
      
    } catch (error: any) {
      console.error('=== ERROR SAVING EVENT ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('========================');
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Gagal menyimpan event',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = () => {
    if (adminForm.password !== adminForm.confirm_password) {
      setSnackbar({
        open: true,
        message: 'Password tidak cocok',
        severity: 'error'
      });
      return;
    }

    if (selectedAdmin) {
      // Update existing admin
      setAdmins(prev => prev.map(admin => 
        admin.id === selectedAdmin.id 
          ? { ...admin, ...adminForm, password: undefined, confirm_password: undefined }
          : admin
      ));
      setSnackbar({
        open: true,
        message: 'Admin berhasil diupdate',
        severity: 'success'
      });
    } else {
      // Add new admin
      const newAdmin: AdminUser = {
        id: Date.now(),
        name: adminForm.name,
        email: adminForm.email,
        role: adminForm.role,
        is_active: true,
        created_at: new Date().toISOString()
      };
      setAdmins(prev => [...prev, newAdmin]);
      setSnackbar({
        open: true,
        message: 'Admin berhasil ditambahkan',
        severity: 'success'
      });
    }
    
    setAdminDialogOpen(false);
    setSelectedAdmin(null);
    setAdminForm({
      name: '',
      email: '',
      role: 'admin',
      password: '',
      confirm_password: ''
    });
  };

  const handleEditEvent = useCallback((event: Event) => {
    console.log('=== EDIT EVENT ===');
    console.log('Event data:', event);
    console.log('Event image:', event.image);
    console.log('Event flyer_path:', event.flyer_path);
    setSelectedEvent(event);
    
    // Format dates for form inputs
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };
    
    const formatTimeForInput = (timeString: string) => {
      if (!timeString) return '';
      
      // Jika format sudah HH:MM, langsung return
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString;
      }
      
      // Jika format HH:MM:SS, ambil hanya HH:MM
      if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return timeString.substring(0, 5);
      }
      
      // Jika format datetime (YYYY-MM-DD HH:MM:SS), ambil bagian waktu
      if (timeString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return timeString.substring(11, 16); // Ambil HH:MM
      }
      
      // Jika format datetime dengan T (YYYY-MM-DDTHH:MM:SS), ambil bagian waktu
      if (timeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        return timeString.substring(11, 16); // Ambil HH:MM
      }
      
      // Jika format lain, coba parse dengan Date
      try {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return date.toTimeString().split(' ')[0].substring(0, 5);
        }
      } catch (e) {
        console.warn('Error parsing time:', timeString, e);
      }
      
      return '';
    };
    
    const formData = {
      title: event.title || '',
      description: event.description || '',
      date: formatDateForInput(event.date),
      start_time: formatTimeForInput(event.start_time),
      end_time: formatTimeForInput(event.end_time),
      location: event.location || '',
      max_participants: event.max_participants || 0,
      registration_deadline: formatDateForInput(event.registration_deadline),
      flyer: null, // Will be set when user selects a new file
      status: event.is_active || false,
    };
    
    console.log('Form data to set:', formData);
    console.log('Setting eventForm with:', formData);
    console.log('Form data title:', formData.title);
    console.log('Form data description:', formData.description);
    console.log('Form data date:', formData.date);
    
    // Set form data and open dialog
    setEventForm(formData);
    setEventDialogOpen(true);
    
    console.log('Opening dialog...');
  }, []);

  const handleEditAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: '',
      confirm_password: ''
    });
    setAdminDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await eventService.deleteEvent(eventId);
      refetchEvents();
      
      // Invalidate all event-related queries to refresh public pages
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events-with-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['event-participants'] });
      
      // Force refetch ALL event-related queries
      queryClient.refetchQueries({ queryKey: ['events'] });
      queryClient.refetchQueries({ queryKey: ['event'] });
      queryClient.refetchQueries({ queryKey: ['admin-events'] });
      queryClient.refetchQueries({ queryKey: ['my-events'] });
      
      // Clear ALL caches to force fresh data
      queryClient.clear();
      
      // Refetch events data
      await refetchEvents();
      
    setSnackbar({
      open: true,
      message: 'Event berhasil dihapus',
      severity: 'success'
    });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus event';
      
      // If event has participants, show option to force delete
      if (errorMessage.includes('peserta')) {
        const shouldForceDelete = window.confirm(
          `${errorMessage}\n\nApakah Anda yakin ingin menghapus event beserta semua pesertanya? Tindakan ini tidak dapat dibatalkan.`
        );
        
        if (shouldForceDelete) {
          try {
            await eventService.forceDeleteEvent(eventId);
            refetchEvents();
            
            // Invalidate all event-related queries to refresh public pages
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event'] });
            
            setSnackbar({
              open: true,
              message: 'Event dan semua peserta berhasil dihapus',
              severity: 'success'
            });
          } catch (forceError: any) {
            setSnackbar({
              open: true,
              message: forceError.response?.data?.message || 'Gagal menghapus event',
              severity: 'error'
            });
          }
        }
      } else {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    }
  };

  const handleExportParticipants = async (eventId: number) => {
    try {
      const response = await api.get(`/admin/events/${eventId}/export-participants`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants_event_${eventId}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({
        open: true,
        message: 'Data peserta berhasil diekspor',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export failed:', error);
      setSnackbar({
        open: true,
        message: 'Gagal mengekspor data peserta',
        severity: 'error'
      });
    }
  };

  const handleDeleteAdmin = (adminId: number) => {
    setAdmins(prev => prev.filter(admin => admin.id !== adminId));
    setSnackbar({
      open: true,
      message: 'Admin berhasil dihapus',
      severity: 'success'
    });
  };

  const getEventStatusLabel = (event: Event) => {
    if (!event.is_active) return 'Tidak Aktif';
    if (event.is_past_event) return 'Selesai';
    if (event.is_registration_open) return 'Pendaftaran Dibuka';
    return 'Pendaftaran Ditutup';
  };

  const getEventStatusColor = (event: Event) => {
    if (!event.is_active) return 'error';
    if (event.is_past_event) return 'success';
    if (event.is_registration_open) return 'primary';
    return 'warning';
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          Manajemen Event & Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kelola event dan tambah admin baru untuk EventHub
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            // Reset form untuk event baru
            setEventForm(getDefaultEventForm());
            setSelectedEvent(null);
            setEventDialogOpen(true);
          }}
          sx={{ bgcolor: 'primary.main' }}
        >
          Tambah Event
        </Button>
        <Button
          variant="outlined"
          startIcon={<AdminIcon />}
          onClick={() => setAdminDialogOpen(true)}
        >
          Tambah Admin
        </Button>
      </Box>

      {/* Content Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3 
      }}>
        {/* Events Section */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Daftar Event
                </Typography>
                <Chip 
                  label={`${events.length} Event`} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>

              {eventsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : events.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Belum ada event
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mulai dengan menambahkan event pertama Anda
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>Tanggal & Waktu</TableCell>
                        <TableCell>Lokasi</TableCell>
                        <TableCell>Peserta</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {events.map((event: Event) => (
                        <TableRow key={event.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {event.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {event.description.substring(0, 50)}...
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {new Date(event.date).toLocaleDateString('id-ID')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {event.start_time} - {event.end_time}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {event.location}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {event.current_participants_count}/{event.max_participants}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getEventStatusLabel(event)}
                              color={getEventStatusColor(event)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Lihat Detail">
                                <IconButton size="small" color="primary">
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Ekspor Data Peserta">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleExportParticipants(event.id)}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Event">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Hapus Event">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Admins Section */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Daftar Admin
                </Typography>
                <Chip 
                  label={`${admins.length} Admin`} 
                  color="secondary" 
                  variant="outlined"
                />
              </Box>

              {admins.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AdminIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Belum ada admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tambah admin pertama untuk mengelola sistem
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {admins.map((admin) => (
                    <Paper key={admin.id} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {admin.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {admin.email}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            Role: {admin.role}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Admin">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleEditAdmin(admin)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus Admin">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteAdmin(admin.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Event Dialog */}
      <Dialog 
        open={eventDialogOpen} 
        onClose={() => {
          console.log('Dialog closing...');
          setEventDialogOpen(false);
          setSelectedEvent(null);
        }} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        {/* Enhanced Header */}
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
            color: 'white',
            p: 4,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)'
            }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 56, 
                height: 56,
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <EventIcon sx={{ fontSize: 28, color: 'white' }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {selectedEvent ? '✏️ Edit Event' : '🎉 Tambah Event Baru'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {selectedEvent ? 'Perbarui informasi event Anda' : 'Buat event menarik untuk peserta'}
                </Typography>
              </Box>
            </Box>
            
            {/* Status Chips */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip 
                label={selectedEvent ? "Mode: Edit" : "Mode: Tambah Baru"} 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                size="small"
              />
              <Chip 
                label={certificateEnabled ? "🎓 Certificate: Aktif" : "🎓 Certificate: Nonaktif"} 
                sx={{ 
                  bgcolor: certificateEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                size="small"
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {/* Basic Information Section */}
          <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(79, 70, 229, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
                  <DescriptionIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#4f46e5' }}>
                    📝 Informasi Dasar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Masukkan informasi dasar tentang event
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gap: 3 }}>
                <TextField
                  label="Judul Event"
                  value={eventForm.title}
                  onChange={(e) => {
                    console.log('Title changed:', e.target.value);
                    setEventForm(prev => ({ ...prev, title: e.target.value }));
                  }}
                  fullWidth
                  required
                  placeholder="Masukkan judul event yang menarik"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4f46e5',
                        }
                      }
                    }
                  }}
                />
                
                <TextField
                  label="Deskripsi Event"
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  placeholder="Jelaskan detail event, agenda, dan informasi penting lainnya"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4f46e5',
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
          {/* Date & Time Section */}
          <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', width: 40, height: 40 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#6366f1' }}>
                    🕒 Waktu & Lokasi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tentukan kapan dan dimana event akan berlangsung
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <TextField
                  label="Tanggal Event"
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        }
                      }
                    }
                  }}
                />
                
                <TextField
                  label="Batas Pendaftaran"
                  type="date"
                  value={eventForm.registration_deadline}
                  onChange={(e) => setEventForm(prev => ({ ...prev, registration_deadline: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        }
                      }
                    }
                  }}
                />
                
                <TextField
                  label="Waktu Mulai"
                  type="time"
                  value={eventForm.start_time}
                  onChange={(e) => setEventForm(prev => ({ ...prev, start_time: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        }
                      }
                    }
                  }}
                />
                
                <TextField
                  label="Waktu Selesai"
                  type="time"
                  value={eventForm.end_time}
                  onChange={(e) => setEventForm(prev => ({ ...prev, end_time: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        }
                      }
                    }
                  }}
                />
                
                <TextField
                  label="Lokasi Event"
                  value={eventForm.location}
                  onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                  fullWidth
                  required
                  placeholder="Masukkan alamat lengkap atau platform online"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        }
                      }
                    }
                  }}
                />
                
                <TextField
                  label="Maksimal Peserta"
                  type="number"
                  value={eventForm.max_participants}
                  onChange={(e) => setEventForm(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 0 }))}
                  fullWidth
                  required
                  placeholder="Contoh: 100"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Certificate Settings Section */}
          <Card sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(139, 92, 246, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#a855f7', width: 40, height: 40 }}>
                  <CertificateIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#8b5cf6' }}>
                    🎓 Pengaturan Event
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pengaturan status dan sertifikat event
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Box sx={{ 
                  p: 3, 
                  bgcolor: eventForm.status ? 'rgba(16, 185, 129, 0.05)' : 'rgba(148, 163, 184, 0.05)', 
                  borderRadius: 2,
                  border: eventForm.status ? '2px solid rgba(16, 185, 129, 0.2)' : '2px solid rgba(148, 163, 184, 0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={eventForm.status}
                        onChange={(e) => setEventForm(prev => ({ ...prev, status: e.target.checked }))}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#10b981',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#10b981',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body1" fontWeight="bold" sx={{ 
                          color: eventForm.status ? '#10b981' : '#64748b' 
                        }}>
                          {eventForm.status ? '✅ Event Aktif' : '❌ Event Nonaktif'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {eventForm.status 
                            ? 'Event dapat dilihat dan diakses oleh peserta' 
                            : 'Event disembunyikan dari peserta'
                          }
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
                
                <Box sx={{ 
                  p: 3, 
                  bgcolor: certificateEnabled ? 'rgba(139, 92, 246, 0.05)' : 'rgba(148, 163, 184, 0.05)', 
                  borderRadius: 2,
                  border: certificateEnabled ? '2px solid rgba(139, 92, 246, 0.2)' : '2px solid rgba(148, 163, 184, 0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={certificateEnabled}
                        onChange={(e) => setCertificateEnabled(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#8b5cf6',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body1" fontWeight="bold" sx={{ 
                          color: certificateEnabled ? '#8b5cf6' : '#64748b' 
                        }}>
                          {certificateEnabled ? '🎓 Sertifikat Aktif' : '🎓 Sertifikat Nonaktif'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {certificateEnabled 
                            ? 'Peserta akan mendapatkan sertifikat' 
                            : 'Tidak ada sertifikat untuk event ini'
                          }
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Image Upload Section */}
          <Card sx={{ borderRadius: 2, border: '1px solid rgba(168, 85, 247, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
                  <ImageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#a855f7' }}>
                    🖼️ Upload Media
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload flyer atau poster untuk menarik peserta
                  </Typography>
                </Box>
              </Box>
              
              {/* Current Image Preview */}
              {selectedEvent && selectedEvent.image && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#4f46e5', fontWeight: 600 }}>
                    🖼️ Gambar Saat Ini:
                  </Typography>
                  <Box
                    component="img"
                    src={`${selectedEvent.image}?v=${Date.now()}&t=${Math.random()}`}
                    alt="Current Event Image"
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'cover',
                      borderRadius: 2,
                      border: '2px solid rgba(79, 70, 229, 0.2)'
                    }}
                    onError={(e) => {
                      console.error('Current image failed to load:', selectedEvent.image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              )}
              
              <TextField
                id="flyer-input"
                label="Upload Flyer/Poster Event"
                type="file"
                inputProps={{ accept: 'image/jpeg,image/jpg,image/png,image/gif' }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    // Validate file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                      setSnackbar({
                        open: true,
                        message: 'Ukuran file terlalu besar. Maksimal 5MB.',
                        severity: 'error'
                      });
                      return;
                    }
                    
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      setSnackbar({
                        open: true,
                        message: 'File harus berupa gambar.',
                        severity: 'error'
                      });
                      return;
                    }
                  }
                  setEventForm(prev => ({ ...prev, flyer: file || null }));
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#a855f7',
                      }
                    }
                  }
                }}
              />
              
              {/* New Image Preview */}
              {eventForm.flyer && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#10b981', fontWeight: 600 }}>
                    ✨ Preview Gambar Baru:
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Box
                      component="img"
                      src={URL.createObjectURL(eventForm.flyer)}
                      alt="New Event Image Preview"
                      sx={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: '2px solid rgba(16, 185, 129, 0.2)'
                      }}
                    />
                    <Button
                      size="small"
                      color="error"
                      variant="contained"
                      onClick={() => {
                        setEventForm(prev => ({ ...prev, flyer: null }));
                        const fileInput = document.getElementById('flyer-input') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        minWidth: 'auto',
                        px: 1
                      }}
                    >
                      ❌
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    📁 {eventForm.flyer.name} • {(eventForm.flyer.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: '#4f46e5' }}>
                  📸 Panduan Upload Image:
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>📁 Format:</strong> JPEG, JPG, PNG, GIF
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>📏 Ukuran Max:</strong> 5MB (5,000 KB)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>📐 Rasio:</strong> 16:9 (landscape)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>🖥️ Resolusi:</strong> 1920x1080px+
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      <strong>⚡ Kualitas:</strong> 85-90%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>🎨 Tips:</strong> Gunakan gambar berkualitas tinggi
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 4, bgcolor: '#f8fafc' }}>
          <Button
            onClick={() => {
              setEventDialogOpen(false);
              setSelectedEvent(null);
              setEventForm(getDefaultEventForm());
            }}
            startIcon={<CancelIcon />}
            sx={{
              borderColor: '#64748b',
              color: '#64748b',
              borderRadius: 2,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: '#475569',
                bgcolor: 'rgba(100, 116, 139, 0.05)'
              }
            }}
          >
            Batal
          </Button>
          <Button
            onClick={handleEventSubmit}
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={isSubmitting}
            sx={{
              bgcolor: '#4f46e5',
              borderRadius: 2,
              px: 4,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              '&:hover': {
                bgcolor: '#3730a3',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)'
              },
              '&:disabled': {
                bgcolor: '#94a3b8',
                transform: 'none',
                boxShadow: 'none'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isSubmitting ? 'Menyimpan...' : (selectedEvent ? 'Update Event' : 'Buat Event')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Dialog */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAdmin ? 'Edit Admin' : 'Tambah Admin Baru'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nama Lengkap"
              value={adminForm.name}
              onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={adminForm.role}
                onChange={(e) => setAdminForm(prev => ({ ...prev, role: e.target.value }))}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </Select>
            </FormControl>
            {!selectedAdmin && (
              <>
                <TextField
                  label="Password"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                  fullWidth
                  required
                />
                <TextField
                  label="Konfirmasi Password"
                  type="password"
                  value={adminForm.confirm_password}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  fullWidth
                  required
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)}>Batal</Button>
          <Button onClick={handleAdminSubmit} variant="contained">
            {selectedAdmin ? 'Update' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventManagement;
