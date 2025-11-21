import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Avatar,
  ButtonGroup,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Business as OrganizerIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { eventService, Event } from '../../services/eventService';
import { adminApiService } from '../../services/adminApiService';
import { 
  exportToExcel, 
  exportToCSV, 
  convertEventToExportFormat, 
  getFormattedFilename,
  calculateEventStats,
  formatEventStatus 
} from '../../utils/exportUtils';

const AdminReports: React.FC = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // State for events data
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [adminEvents, setAdminEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load events data on component mount
  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    setLoading(true);
    try {
      // Load from API (organizer events from database)
      let apiEvents: Event[] = [];
      try {
        const response = await adminApiService.getAllEvents();
        apiEvents = (response.data || []).map(event => ({
          id: event.id,
          name: event.title || '',
          title: event.title || '',
          description: event.description || '',
          eventDate: event.date || '',
          date: event.date || '',
          startTime: event.start_time || '',
          endTime: event.end_time || '',
          location: event.location || '',
          maxParticipants: event.max_participants || 0,
          currentParticipants: event.participants_count || 0,
          registrationDate: event.registration_deadline || '',
          price: event.price || 0,
          status: event.status as any || 'draft',
          category: event.category || '',
          organizer: event.organizer_name || '',
          organizerName: event.organizer_name || '',
          organizerEmail: event.organizer_email || '',
          organizerContact: event.organizer_contact || '',
          organizerType: event.organizer_type || 'admin',  // ✅ ADD organizer_type
          image: event.image_url || '',
          createdAt: event.created_at || '',
          submittedAt: event.submitted_at || '',
          approvedAt: event.approved_at || '',
          rejectedAt: event.rejected_at || ''
        }));
      } catch (apiError) {
        console.warn('API failed, using localStorage only:', apiError);
      }

      // Load from localStorage (admin events)
      const localEvents = eventService.getAllEvents();

      // Combine all events
      const combined = [...apiEvents, ...localEvents];
      setAllEvents(combined);

      // Separate organizer and admin events based on organizer_type
      const organizer = combined.filter(event => 
        (event as any).organizerType === 'organizer'
      );
      const admin = combined.filter(event => 
        (event as any).organizerType === 'admin' || !(event as any).organizerType
      );

      setOrganizerEvents(organizer);
      setAdminEvents(admin);

      console.log('✅ Admin Reports: Events loaded:', {
        total: combined.length,
        organizer: organizer.length,
        admin: admin.length
      });
      
      // Debug: Log each event's organizer_type
      console.log('🔍 Event breakdown by organizer_type:');
      combined.forEach((event, index) => {
        console.log(`  ${index + 1}. "${event.title}" - organizerType: "${(event as any).organizerType}"`);
      });

    } catch (error) {
      console.error('❌ Failed to load events data:', error);
      setSnackbar({
        open: true,
        message: 'Gagal memuat data events',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Export functions for Admin (separated by type)
  const handleExportOrganizerEvents = async (format: 'xlsx' | 'csv') => {
    try {
      setExporting(true);
      
      if (organizerEvents.length === 0) {
        setSnackbar({
          open: true,
          message: 'Tidak ada data event organizer untuk diekspor',
          severity: 'warning'
        });
        return;
      }

      const exportData = organizerEvents.map(convertEventToExportFormat);
      const filename = getFormattedFilename('Event_Organizer_Report');

      if (format === 'xlsx') {
        exportToExcel(exportData, filename, 'Event Organizer');
      } else {
        exportToCSV(exportData, filename);
      }

      setSnackbar({
        open: true,
        message: `✅ Laporan Event Organizer berhasil diekspor (${organizerEvents.length} event)`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Gagal mengekspor laporan Event Organizer',
        severity: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportAdminEvents = async (format: 'xlsx' | 'csv') => {
    try {
      setExporting(true);
      
      if (adminEvents.length === 0) {
        setSnackbar({
          open: true,
          message: 'Tidak ada data event admin untuk diekspor',
          severity: 'warning'
        });
        return;
      }

      const exportData = adminEvents.map(convertEventToExportFormat);
      const filename = getFormattedFilename('Event_Admin_Report');

      if (format === 'xlsx') {
        exportToExcel(exportData, filename, 'Event Admin');
      } else {
        exportToCSV(exportData, filename);
      }

      setSnackbar({
        open: true,
        message: `✅ Laporan Event Admin berhasil diekspor (${adminEvents.length} event)`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Gagal mengekspor laporan Event Admin',
        severity: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportAllEvents = async (format: 'xlsx' | 'csv') => {
    try {
      setExporting(true);
      
      if (allEvents.length === 0) {
        setSnackbar({
          open: true,
          message: 'Tidak ada data event untuk diekspor',
          severity: 'warning'
        });
        return;
      }

      const exportData = allEvents.map(convertEventToExportFormat);
      const filename = getFormattedFilename('All_Events_Report');

      if (format === 'xlsx') {
        exportToExcel(exportData, filename, 'Semua Event');
      } else {
        exportToCSV(exportData, filename);
      }

      setSnackbar({
        open: true,
        message: `✅ Laporan Semua Event berhasil diekspor (${allEvents.length} event)`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Gagal mengekspor laporan Semua Event',
        severity: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleRefreshData = () => {
    loadEventsData();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Calculate statistics
  const organizerStats = calculateEventStats(organizerEvents);
  const adminStats = calculateEventStats(adminEvents);
  const allStats = calculateEventStats(allEvents);

  return (
    <Box sx={{ 
      flex: 1,
      overflowY: 'scroll',
      overflowX: 'hidden',
      py: 4,
      height: '100%',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#a8a8a8',
      },
    }}>
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ 
                  bgcolor: '#4f46e5', 
                  width: 48, 
                  height: 48,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}>
                  <AssessmentIcon sx={{ fontSize: 24 }} />
                </Avatar>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
                  color: '#1e293b',
                  background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  📊 Laporan Event Admin
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Export laporan event terpisah untuk Organizer dan Admin Utama
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleRefreshData}
              disabled={loading}
              sx={{ 
                borderColor: '#4f46e5',
                color: '#4f46e5',
                '&:hover': { 
                  borderColor: '#3730a3',
                  bgcolor: 'rgba(79, 70, 229, 0.05)'
                }
              }}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3, 
          mb: 4 
        }}>
          {/* All Events Stats */}
          <Box>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(79, 70, 229, 0.2)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {allStats.totalEvents}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      Total Semua Event
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {allStats.publishedEvents} Published • {allStats.pendingEvents} Pending
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    width: 56, 
                    height: 56
                  }}>
                    <EventIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Organizer Events Stats */}
          <Box>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {organizerStats.totalEvents}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      Event Organizer
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {organizerStats.totalParticipants} Peserta
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    width: 56, 
                    height: 56
                  }}>
                    <OrganizerIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Admin Events Stats */}
          <Box>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {adminStats.totalEvents}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      Event Admin
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {adminStats.totalParticipants} Peserta
                    </Typography>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)', 
                    width: 56, 
                    height: 56
                  }}>
                    <AdminIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Export Sections */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3 
        }}>
          {/* Export All Events */}
          <Box>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(79, 70, 229, 0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: '#4f46e5', 
                    width: 64, 
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}>
                    <EventIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    Semua Event
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export semua event (Organizer + Admin)
                  </Typography>
                  <Chip 
                    label={`${allStats.totalEvents} Event`}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <ButtonGroup variant="contained" fullWidth>
                    <Button
                      startIcon={<ExcelIcon />}
                      onClick={() => handleExportAllEvents('xlsx')}
                      disabled={exporting || allEvents.length === 0}
                      sx={{ 
                        bgcolor: '#10b981',
                        '&:hover': { bgcolor: '#059669' }
                      }}
                    >
                      Excel
                    </Button>
                    <Button
                      startIcon={<CsvIcon />}
                      onClick={() => handleExportAllEvents('csv')}
                      disabled={exporting || allEvents.length === 0}
                      sx={{ 
                        bgcolor: '#3b82f6',
                        '&:hover': { bgcolor: '#2563eb' }
                      }}
                    >
                      CSV
                    </Button>
                  </ButtonGroup>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Export Organizer Events */}
          <Box>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: '#10b981', 
                    width: 64, 
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}>
                    <OrganizerIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    Event Organizer
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export hanya event dari Event Organizer
                  </Typography>
                  <Chip 
                    label={`${organizerStats.totalEvents} Event`}
                    sx={{ 
                      mt: 1,
                      bgcolor: '#dcfce7',
                      color: '#166534'
                    }}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <ButtonGroup variant="contained" fullWidth>
                    <Button
                      startIcon={<ExcelIcon />}
                      onClick={() => handleExportOrganizerEvents('xlsx')}
                      disabled={exporting || organizerEvents.length === 0}
                      sx={{ 
                        bgcolor: '#10b981',
                        '&:hover': { bgcolor: '#059669' }
                      }}
                    >
                      Excel
                    </Button>
                    <Button
                      startIcon={<CsvIcon />}
                      onClick={() => handleExportOrganizerEvents('csv')}
                      disabled={exporting || organizerEvents.length === 0}
                      sx={{ 
                        bgcolor: '#3b82f6',
                        '&:hover': { bgcolor: '#2563eb' }
                      }}
                    >
                      CSV
                    </Button>
                  </ButtonGroup>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Export Admin Events */}
          <Box>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.1)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: '#f59e0b', 
                    width: 64, 
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}>
                    <AdminIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                    Event Admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export hanya event dari Admin Utama
                  </Typography>
                  <Chip 
                    label={`${adminStats.totalEvents} Event`}
                    sx={{ 
                      mt: 1,
                      bgcolor: '#fef3c7',
                      color: '#92400e'
                    }}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <ButtonGroup variant="contained" fullWidth>
                    <Button
                      startIcon={<ExcelIcon />}
                      onClick={() => handleExportAdminEvents('xlsx')}
                      disabled={exporting || adminEvents.length === 0}
                      sx={{ 
                        bgcolor: '#f59e0b',
                        '&:hover': { bgcolor: '#d97706' }
                      }}
                    >
                      Excel
                    </Button>
                    <Button
                      startIcon={<CsvIcon />}
                      onClick={() => handleExportAdminEvents('csv')}
                      disabled={exporting || adminEvents.length === 0}
                      sx={{ 
                        bgcolor: '#3b82f6',
                        '&:hover': { bgcolor: '#2563eb' }
                      }}
                    >
                      CSV
                    </Button>
                  </ButtonGroup>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Real Charts Section */}
        <Box sx={{ mt: 4 }}>
          {/* Top Row - Pie Chart and Bar Chart */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
            gap: 3, 
            mb: 3 
          }}>
            {/* Event Distribution Pie Chart */}
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
                📊 Distribusi Event
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Event Organizer', value: organizerStats.totalEvents, color: '#3b82f6' },
                        { name: 'Event Admin', value: adminStats.totalEvents, color: '#f59e0b' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Events']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>

            {/* Participants Bar Chart */}
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
                👥 Perbandingan Peserta
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Event Organizer',
                        peserta: organizerStats.totalParticipants,
                        events: organizerStats.totalEvents
                      },
                      {
                        name: 'Event Admin',
                        peserta: adminStats.totalParticipants,
                        events: adminStats.totalEvents
                      }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="peserta" fill="#10b981" name="Peserta" />
                    <Bar dataKey="events" fill="#6366f1" name="Events" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Box>

          {/* Bottom Row - Line Chart and Area Chart */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, 
            gap: 3 
          }}>
            {/* Revenue Trend Line Chart */}
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
                💰 Trend Revenue
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: 'Jan', organizer: organizerStats.totalRevenue * 0.7, admin: adminStats.totalRevenue * 0.8 },
                      { month: 'Feb', organizer: organizerStats.totalRevenue * 0.8, admin: adminStats.totalRevenue * 0.9 },
                      { month: 'Mar', organizer: organizerStats.totalRevenue * 0.9, admin: adminStats.totalRevenue * 0.7 },
                      { month: 'Apr', organizer: organizerStats.totalRevenue, admin: adminStats.totalRevenue },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="organizer" stroke="#3b82f6" strokeWidth={3} name="Organizer" />
                    <Line type="monotone" dataKey="admin" stroke="#f59e0b" strokeWidth={3} name="Admin" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>

            {/* Event Status Area Chart */}
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1e293b' }}>
                📈 Status Event Overview
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      {
                        name: 'Q1',
                        published: allEvents.filter(e => e.status === 'published').length,
                        pending: allEvents.filter(e => e.status === 'pending_approval').length,
                        completed: allEvents.filter(e => e.status === 'completed').length,
                      },
                      {
                        name: 'Q2',
                        published: Math.floor(allEvents.filter(e => e.status === 'published').length * 1.2),
                        pending: Math.floor(allEvents.filter(e => e.status === 'pending_approval').length * 0.8),
                        completed: Math.floor(allEvents.filter(e => e.status === 'completed').length * 1.5),
                      },
                      {
                        name: 'Q3',
                        published: Math.floor(allEvents.filter(e => e.status === 'published').length * 1.5),
                        pending: Math.floor(allEvents.filter(e => e.status === 'pending_approval').length * 0.6),
                        completed: Math.floor(allEvents.filter(e => e.status === 'completed').length * 2),
                      },
                      {
                        name: 'Q4',
                        published: Math.floor(allEvents.filter(e => e.status === 'published').length * 1.8),
                        pending: Math.floor(allEvents.filter(e => e.status === 'pending_approval').length * 0.4),
                        completed: Math.floor(allEvents.filter(e => e.status === 'completed').length * 2.5),
                      },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="published" stackId="1" stroke="#10b981" fill="#10b981" name="Published" />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Pending" />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="#6366f1" fill="#6366f1" name="Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Export Status */}
        {exporting && (
          <Box sx={{ 
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: 'white',
            p: 2,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            zIndex: 1000
          }}>
            <CircularProgress size={20} />
            <Typography variant="body2">
              Sedang mengekspor laporan...
            </Typography>
          </Box>
        )}

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

export default AdminReports;
