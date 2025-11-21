import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  TextField,
  LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Event as EventIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { adminApiService, DashboardStats as ApiDashboardStats, AdminEvent as ApiAdminEvent } from '../services/adminApiService';
import DashboardCharts from '../components/admin/DashboardCharts';
// eventService removed - now 100% using database API

// Use interfaces from adminApiService
type AdminEvent = ApiAdminEvent;
type DashboardStats = ApiDashboardStats & {
  systemHealth: number;
};

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const AdminDashboard: React.FC = () => {
  // Hooks
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  
  // State declarations
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_users: 0,
    total_events: 0,
    total_organizer_events: 0,
    total_admin_events: 0,
    pending_approvals: 0,
    published_events: 0,
    active_events: 0,
    completed_events: 0,
    total_participants: 0,
    new_users_this_month: 0,
    new_events_this_month: 0,
    revenue_this_month: 0,
    systemHealth: 95
  });
  
  const [recentEvents, setRecentEvents] = useState<AdminEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Chart data state
  const [chartData, setChartData] = useState<{
    eventsPerMonth: Array<{ month: string; count: number }>;
    participantsPerMonth: Array<{ month: string; count: number }>;
    topEvents: Array<{ name: string; participants: number }>;
  }>({
    eventsPerMonth: [],
    participantsPerMonth: [],
    topEvents: [],
  });
  
  // Dialog states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedEventForReview, setSelectedEventForReview] = useState<AdminEvent | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Load initial data with auto-refresh
  useEffect(() => {
    console.log('🎬 Admin Dashboard: Component mounted');
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
    
    console.log('✅ Admin authenticated, loading dashboard...');
    
    // Add 300ms delay to ensure token is ready
    const loadTimer = setTimeout(() => {
      console.log('🔄 Starting dashboard load after auth confirmation...');
      loadDashboardData();
    }, 300);
    
    // Auto-refresh setiap 10 detik
    const refreshInterval = setInterval(() => {
      console.log('⏰ Admin Dashboard: Auto-refresh...');
      loadDashboardData();
    }, 10000);
    
    // Listen for custom events - IMMEDIATE refresh
    const handleEventCreated = () => {
      console.log('🎉 Admin Dashboard: Event created - REFRESHING!');
      loadDashboardData();
    };
    
    const handleEventStatusChanged = (event: CustomEvent) => {
      console.log('📡 Admin Dashboard: Event status changed:', event.detail);
      loadDashboardData();
    };
    
    const handleEventDataChanged = () => {
      console.log('📊 Admin Dashboard: Event data changed!');
      loadDashboardData();
    };
    
    window.addEventListener('eventCreated', handleEventCreated);
    window.addEventListener('eventStatusChanged', handleEventStatusChanged as EventListener);
    window.addEventListener('eventDataChanged', handleEventDataChanged);
    
    return () => {
      clearTimeout(loadTimer);
      clearInterval(refreshInterval);
      window.removeEventListener('eventCreated', handleEventCreated);
      window.removeEventListener('eventStatusChanged', handleEventStatusChanged as EventListener);
      window.removeEventListener('eventDataChanged', handleEventDataChanged);
    };
  }, [isAuthenticated, authLoading, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Admin Dashboard: Starting to load data...');
      
      // Load dashboard statistics with better error handling
      let stats: DashboardStats;
      try {
        console.log('🌐 Admin Dashboard: Calling getDashboardStats API...');
        const apiStats = await adminApiService.getDashboardStats();
        console.log('📦 Admin Dashboard: Raw API response:', apiStats);
        
        stats = { ...apiStats, systemHealth: 95 };
        console.log('✅ Admin Dashboard: Stats loaded from API:', stats);
        console.log('📊 Stats breakdown:', {
          total_users: stats.total_users,
          total_events: stats.total_events,
          total_participants: stats.total_participants,
          revenue_this_month: stats.revenue_this_month
        });
        
        setDashboardStats(stats);
      } catch (statsError: any) {
        console.error('❌ Admin Dashboard: Failed to load stats from database:', statsError);
        console.error('❌ Error details:', {
          message: statsError.message,
          response: statsError.response?.data,
          status: statsError.response?.status
        });
        
        // Show error to user
        setSnackbar({
          open: true,
          message: `Gagal memuat statistik dashboard: ${statsError.message}`,
          severity: 'error'
        });
        
        // No localStorage fallback - use empty stats
        stats = {
          total_users: 0,
          total_events: 0,
          total_organizer_events: 0,
          total_admin_events: 0,
          pending_approvals: 0,
          published_events: 0,
          active_events: 0,
          completed_events: 0,
          total_participants: 0,
          new_users_this_month: 0,
          new_events_this_month: 0,
          revenue_this_month: 0,
          systemHealth: 95
        };
        setDashboardStats(stats);
      }
      
      // Load recent events (published events)
      let recentEventsData: AdminEvent[] = [];
      try {
        console.log('📊 Admin Dashboard: Attempting to load recent events...');
        recentEventsData = await adminApiService.getRecentEvents(5);
        console.log('✅ Admin Dashboard: Recent events loaded from API:', recentEventsData.length);
        
        // Also load all published events to show in recent events if API recent events is empty
        if (recentEventsData.length === 0) {
          console.log('📊 Admin Dashboard: No recent events, trying getAllEvents...');
          const allEventsData = await adminApiService.getAllEvents({ status: 'published', per_page: 5 });
          recentEventsData = allEventsData.data || [];
          console.log('✅ Admin Dashboard: Loaded published events as recent:', recentEventsData.length);
        }
      } catch (recentError) {
        console.error('❌ Admin Dashboard: Recent events API failed:', recentError);
        // No localStorage fallback - 100% database now
        recentEventsData = [];
      }
      setRecentEvents(recentEventsData);
      
      // Load pending events from API (limit 5 for dashboard)
      let pendingEventsData: AdminEvent[] = [];
      try {
        console.log('📊 Admin Dashboard: Attempting to load pending events (limit 5)...');
        pendingEventsData = await adminApiService.getPendingEvents(5);
        console.log('✅ Admin Dashboard: Pending events loaded:', {
          count: pendingEventsData.length,
          events: pendingEventsData.map(e => ({ id: e.id, title: e.title, status: e.status }))
        });
      } catch (pendingError: any) {
        console.error('❌ Admin Dashboard: Pending events API failed:', {
          error: pendingError.message,
          response: pendingError.response?.data
        });
        // Empty array if API fails
        pendingEventsData = [];
      }
      setPendingEvents(pendingEventsData);
      
      // Load chart data
      try {
        console.log('📊 Admin Dashboard: Loading chart data...');
        const charts = await adminApiService.getChartData();
        console.log('✅ Admin Dashboard: Chart data loaded:', charts);
        setChartData(charts);
      } catch (chartError) {
        console.error('❌ Admin Dashboard: Chart data API failed:', chartError);
        // Keep default empty chart data
      }
      
      console.log('🔍 Admin Dashboard: Final loaded data:', {
        stats,
        recentEvents: recentEventsData.length,
        pendingEvents: pendingEventsData.length
      });
      
    } catch (error) {
      console.error('❌ Unexpected error in loadDashboardData:', error);
      setSnackbar({
        open: true,
        message: 'Terjadi kesalahan saat memuat data dashboard',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
      setSnackbar({
        open: true,
        message: 'Data berhasil diperbarui',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Gagal memperbarui data',
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Event handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, eventData: AdminEvent) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(eventData);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleViewEvent = () => {
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleEditEvent = () => {
    // Navigate to edit page or open edit dialog
    console.log('Edit event:', selectedEvent);
    handleMenuClose();
  };

  const handleDeleteEvent = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      await adminApiService.deleteEvent(selectedEvent.id);
      console.log('✅ Admin: Event deleted via API');
      
      // Reload data
      await loadDashboardData();
      
      setSnackbar({
        open: true,
        message: `Event "${selectedEvent.title}" berhasil dihapus`,
        severity: 'success'
      });
      
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Gagal menghapus event',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Event review handlers
  const handleReviewEvent = (event: AdminEvent) => {
    setSelectedEventForReview(event);
    setReviewDialogOpen(true);
  };

  const handleApproveEvent = async () => {
    if (!selectedEventForReview) return;
    
    setLoading(true);
    try {
      // Approve event via API
      await adminApiService.approveEvent(selectedEventForReview.id);
      console.log('✅ Admin: Event approved via API');
      
      // Reload dashboard data
      await loadDashboardData();
      
      // Dispatch event to notify other components (like EO dashboard)
      window.dispatchEvent(new CustomEvent('eventStatusChanged', {
        detail: {
          eventId: selectedEventForReview.id,
          newStatus: 'published',
          action: 'approved'
        }
      }));
      
      setSnackbar({
        open: true,
        message: `Event "${selectedEventForReview.title}" berhasil disetujui dan dipublikasikan!`,
        severity: 'success'
      });
      
      setApproveDialogOpen(false);
      setReviewDialogOpen(false);
      setSelectedEventForReview(null);
    } catch (error) {
      console.error('❌ Failed to approve event:', error);
      setSnackbar({
        open: true,
        message: 'Gagal menyetujui event',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEvent = async () => {
    if (!selectedEventForReview) return;
    
    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      setSnackbar({
        open: true,
        message: 'Alasan penolakan harus diisi',
        severity: 'error'
      });
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setSnackbar({
        open: true,
        message: 'Alasan penolakan minimal 10 karakter',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Reject event via API with reason
      await adminApiService.rejectEvent(
        selectedEventForReview.id,
        rejectionReason.trim()
      );
      await loadDashboardData();
      
      setSnackbar({
        open: true,
        message: `Event "${selectedEventForReview.title}" telah ditolak.`,
        severity: 'info'
      });
      
      setRejectDialogOpen(false);
      setReviewDialogOpen(false);
      setSelectedEventForReview(null);
      setRejectionReason(''); // Reset reason
    } catch (error) {
      console.error('Failed to reject event:', error);
      setSnackbar({
        open: true,
        message: 'Gagal menolak event',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Helper functions
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'published':
        return '#10b981';
      case 'pending_approval':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'published':
        return 'Dipublikasikan';
      case 'pending_approval':
        return 'Menunggu Persetujuan';
      case 'rejected':
        return 'Ditolak';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Draft';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'published':
        return <CheckCircleIcon />;
      case 'pending_approval':
        return <ScheduleIcon />;
      case 'rejected':
        return <CancelIcon />;
      case 'cancelled':
        return <WarningIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Admin Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Memperbarui...' : 'Perbarui Data'}
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          }, 
          gap: 3, 
          mb: 4 
        }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#3b82f6', width: 56, height: 56 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats.total_users.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981', width: 56, height: 56 }}>
                  <EventIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats.total_events.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b', width: 56, height: 56 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardStats.total_participants.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Participants
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', width: 56, height: 56 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Rp {dashboardStats.revenue_this_month.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenue This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Pending Events Section */}
        <Card sx={{ mb: 4, bgcolor: pendingEvents.length > 0 ? '#fef3c7' : '#f8fafc', border: pendingEvents.length > 0 ? '1px solid #f59e0b' : '1px solid #e2e8f0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ color: pendingEvents.length > 0 ? '#92400e' : '#475569' }}>
                  📋 Event Menunggu Persetujuan ({dashboardStats.pending_approvals || 0})
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
                  {pendingEvents.length > 0 
                    ? `Menampilkan ${Math.min(5, pendingEvents.length)} dari ${dashboardStats.pending_approvals || pendingEvents.length} event yang menunggu persetujuan`
                    : 'Event yang membutuhkan persetujuan akan muncul di sini'
                  }
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/admin/events')}
                sx={{
                  borderColor: pendingEvents.length > 0 ? '#f59e0b' : '#64748b',
                  color: pendingEvents.length > 0 ? '#f59e0b' : '#64748b'
                }}
              >
                Lihat Semua
              </Button>
            </Box>
            
            {pendingEvents.length > 0 ? (
              <>
                <Typography variant="body2" sx={{ color: '#92400e', mb: 3 }}>
                  Event-event berikut menunggu persetujuan Anda untuk dipublikasikan.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {pendingEvents.slice(0, 5).map((event) => (
                    <Card key={event.id} sx={{ 
                      p: 3, 
                      bgcolor: 'white',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: 2,
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ 
                          bgcolor: 'rgba(245, 158, 11, 0.1)', 
                          color: '#f59e0b', 
                          width: 48, 
                          height: 48
                        }}>
                          <EventIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            👥 Organizer: {event.organizer_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            📅 Tanggal: {formatDate(event.date)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#f59e0b' }}>
                            🕰 Diajukan: {event.submitted_at ? formatDate(event.submitted_at) : 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setSelectedEventForReview(event);
                              setApproveDialogOpen(true);
                            }}
                            sx={{
                              bgcolor: '#10b981',
                              '&:hover': { bgcolor: '#059669' },
                              minWidth: '90px'
                            }}
                          >
                            ✓ Setujui
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedEventForReview(event);
                              setRejectionReason(''); // Reset reason
                              setRejectDialogOpen(true);
                            }}
                            sx={{
                              borderColor: '#ef4444',
                              color: '#ef4444',
                              '&:hover': {
                                borderColor: '#dc2626',
                                bgcolor: 'rgba(239, 68, 68, 0.05)'
                              },
                              minWidth: '90px'
                            }}
                          >
                            ✗ Tolak
                          </Button>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleReviewEvent(event)}
                            sx={{
                              color: '#6b7280',
                              '&:hover': {
                                bgcolor: 'rgba(107, 114, 128, 0.05)'
                              },
                              minWidth: '90px'
                            }}
                          >
                            👁 Detail
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
                
                {pendingEvents.length > 5 && (
                  <Typography variant="caption" sx={{ color: '#92400e', mt: 2, display: 'block', textAlign: 'center' }}>
                    ... dan {pendingEvents.length - 5} event lainnya
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  🎉 Tidak ada event yang menunggu persetujuan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Semua event telah diproses atau belum ada event baru dari organizer.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Recent Events Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Event Terbaru
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Organizer</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Peserta</TableCell>
                      <TableCell align="right">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentEvents.map((event) => (
                      <TableRow key={event.id}>
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
                          <Typography variant="body2">
                            {event.organizer_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(event.date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(event.status)}
                            label={getStatusLabel(event.status)}
                            size="small"
                            sx={{
                              bgcolor: `${getStatusColor(event.status)}15`,
                              color: getStatusColor(event.status),
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {event.max_participants ? `0/${event.max_participants}` : 'Unlimited'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, event)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Charts */}
        {chartData && chartData.eventsPerMonth && (
          <DashboardCharts
            eventsPerMonth={chartData.eventsPerMonth}
            participantsPerMonth={chartData.participantsPerMonth}
            topEvents={chartData.topEvents}
          />
        )}

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewEvent}>
            <VisibilityIcon sx={{ mr: 1 }} />
            Lihat Detail
          </MenuItem>
          <MenuItem onClick={handleEditEvent}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDeleteEvent} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Hapus
          </MenuItem>
        </Menu>

        {/* View Event Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight="bold">
              Detail Event
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedEvent && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {selectedEvent.title}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedEvent.description}
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      📅 Tanggal & Waktu
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedEvent.date)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEvent.start_time} - {selectedEvent.end_time}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      📍 Lokasi
                    </Typography>
                    <Typography variant="body1">
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Tutup
            </Button>
          </DialogActions>
        </Dialog>

        {/* Review Event Dialog */}
        <Dialog 
          open={reviewDialogOpen} 
          onClose={() => setReviewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon sx={{ color: '#f59e0b' }} />
              Review Event untuk Persetujuan
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedEventForReview && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {selectedEventForReview.title}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedEventForReview.description}
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      📅 Tanggal & Waktu
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedEventForReview.date)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEventForReview.start_time} - {selectedEventForReview.end_time}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      📍 Lokasi
                    </Typography>
                    <Typography variant="body1">
                      {selectedEventForReview.location}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      👤 Penyelenggara
                    </Typography>
                    <Typography variant="body1">
                      {selectedEventForReview.organizer_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEventForReview.organizer_email}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      👥 Peserta & Harga
                    </Typography>
                    <Typography variant="body1">
                      Max: {selectedEventForReview.max_participants || 'Unlimited'} peserta
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Harga: {selectedEventForReview.price ? `Rp ${selectedEventForReview.price.toLocaleString()}` : 'Gratis'}
                    </Typography>
                  </Box>
                </Box>

                {selectedEventForReview.image_url && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      🖼️ Gambar Event
                    </Typography>
                    <Box sx={{ 
                      width: '100%', 
                      maxWidth: 400, 
                      height: 200, 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0'
                    }}>
                      <img 
                        src={selectedEventForReview.image_url} 
                        alt="Event Preview" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={() => setReviewDialogOpen(false)}
              variant="outlined"
            >
              Tutup
            </Button>
            <Button 
              onClick={() => {
                setRejectionReason(''); // Reset reason
                setRejectDialogOpen(true);
              }}
              color="error"
              variant="outlined"
              startIcon={<CancelIcon />}
            >
              Tolak
            </Button>
            <Button 
              onClick={() => {
                setApproveDialogOpen(true);
              }}
              color="success"
              variant="contained"
              startIcon={<CheckCircleIcon />}
            >
              Setujui & Publikasikan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Approve Confirmation Dialog */}
        <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ color: '#22c55e' }} />
              Konfirmasi Persetujuan
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Apakah Anda yakin ingin menyetujui dan mempublikasikan event:
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#22c55e', mt: 1 }}>
              "{selectedEventForReview?.title}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Event akan langsung dipublikasikan dan dapat dilihat oleh publik.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproveDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleApproveEvent}
              color="success" 
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            >
              {loading ? 'Memproses...' : 'Ya, Setujui'}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CancelIcon sx={{ color: '#ef4444' }} />
              Konfirmasi Penolakan Event
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Apakah Anda yakin ingin menolak event:
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#ef4444', mt: 1, mb: 2 }}>
              "{selectedEventForReview?.title}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Event yang ditolak tidak akan dipublikasikan dan organizer akan mendapat notifikasi.
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Alasan Penolakan *"
              placeholder="Jelaskan alasan penolakan event ini (minimal 10 karakter)"
              value={rejectionReason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectionReason(e.target.value)}
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
              onClick={handleRejectEvent}
              color="error" 
              variant="contained"
              disabled={loading || !rejectionReason || rejectionReason.trim().length < 10}
              startIcon={loading ? <CircularProgress size={16} /> : <CancelIcon />}
            >
              {loading ? 'Menolak...' : 'Tolak Event'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>
            Konfirmasi Hapus Event
          </DialogTitle>
          <DialogContent>
            <Typography>
              Apakah Anda yakin ingin menghapus event "{selectedEvent?.title}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={confirmDeleteEvent} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Hapus'}
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
    </Box>
  );
};

export default AdminDashboard;
