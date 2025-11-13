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
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  MonetizationOn as MonetizationOnIcon,
  Assessment as AssessmentIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { eventService, Event } from '../services/eventService';
import { 
  exportToExcel, 
  exportToCSV, 
  convertEventToExportFormat, 
  getFormattedFilename,
  calculateEventStats 
} from '../utils/exportUtils';

const OrganizerReports: React.FC = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // State for events data
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load organizer events on component mount
  useEffect(() => {
    loadOrganizerEvents();
  }, []);

  const loadOrganizerEvents = () => {
    setLoading(true);
    try {
      // Get all events from localStorage
      const allEvents = eventService.getAllEvents();
      
      // Filter events for current organizer (excluding admin events)
      const organizerEvents = allEvents.filter(event => 
        event.organizerName && event.organizerName !== 'Admin Utama'
      );
      
      setOrganizerEvents(organizerEvents);
      
      console.log('✅ Organizer Reports: Events loaded:', organizerEvents.length);

    } catch (error) {
      console.error('❌ Failed to load organizer events:', error);
      setSnackbar({
        open: true,
        message: 'Gagal memuat data events',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Export function for Organizer (only their events)
  const handleExportOrganizerEvents = async (format: 'xlsx' | 'csv') => {
    try {
      setExporting(true);
      
      if (organizerEvents.length === 0) {
        setSnackbar({
          open: true,
          message: 'Tidak ada data event untuk diekspor',
          severity: 'warning'
        });
        return;
      }

      const exportData = organizerEvents.map(convertEventToExportFormat);
      const filename = getFormattedFilename('My_Events_Report');

      if (format === 'xlsx') {
        exportToExcel(exportData, filename, 'Event Saya');
      } else {
        exportToCSV(exportData, filename);
      }

      setSnackbar({
        open: true,
        message: `✅ Laporan Event berhasil diekspor (${organizerEvents.length} event)`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: 'Gagal mengekspor laporan Event',
        severity: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleRefreshData = () => {
    loadOrganizerEvents();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Calculate statistics
  const stats = calculateEventStats(organizerEvents);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar sx={{ 
                  bgcolor: '#10b981', 
                  width: 48, 
                  height: 48,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <AssessmentIcon sx={{ fontSize: 24 }} />
                </Avatar>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
                  color: '#1e293b',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  📊 Laporan Event Saya
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Export laporan event yang saya buat sebagai Event Organizer
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleRefreshData}
              disabled={loading}
              sx={{ 
                borderColor: '#10b981',
                color: '#10b981',
                '&:hover': { 
                  borderColor: '#059669',
                  bgcolor: 'rgba(16, 185, 129, 0.05)'
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
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3, 
          mb: 4 
        }}>
          {/* Total Events */}
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
                    {stats.totalEvents}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Event
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

          {/* Total Participants */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.totalParticipants}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Peserta
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  width: 56, 
                  height: 56
                }}>
                  <PeopleIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          {/* Published Events */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {stats.publishedEvents}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Event Published
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  width: 56, 
                  height: 56
                }}>
                  <TrendingUpIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          {/* Total Revenue */}
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
                    Rp {stats.totalRevenue.toLocaleString('id-ID')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                    Total Revenue
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  width: 56, 
                  height: 56
                }}>
                  <MonetizationOnIcon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Export Section */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr' },
          gap: 3 
        }}>
          {/* Export My Events */}
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.1)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar sx={{ 
                  bgcolor: '#10b981', 
                  width: 80, 
                  height: 80,
                  mx: 'auto',
                  mb: 2
                }}>
                  <DownloadIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                  Export Laporan Event Saya
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Download laporan lengkap untuk semua event yang saya buat sebagai Event Organizer
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${stats.totalEvents} Event`}
                    sx={{ 
                      bgcolor: '#dcfce7',
                      color: '#166534'
                    }}
                    size="small"
                  />
                  <Chip 
                    label={`${stats.totalParticipants} Peserta`}
                    sx={{ 
                      bgcolor: '#dbeafe',
                      color: '#1e40af'
                    }}
                    size="small"
                  />
                  <Chip 
                    label={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`}
                    sx={{ 
                      bgcolor: '#fef3c7',
                      color: '#92400e'
                    }}
                    size="small"
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto' }}>
                <ButtonGroup variant="contained" fullWidth size="large">
                  <Button
                    startIcon={<ExcelIcon />}
                    onClick={() => handleExportOrganizerEvents('xlsx')}
                    disabled={exporting || organizerEvents.length === 0}
                    sx={{ 
                      bgcolor: '#10b981',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#059669' }
                    }}
                  >
                    {exporting ? 'Exporting...' : 'Download Excel'}
                  </Button>
                  <Button
                    startIcon={<CsvIcon />}
                    onClick={() => handleExportOrganizerEvents('csv')}
                    disabled={exporting || organizerEvents.length === 0}
                    sx={{ 
                      bgcolor: '#3b82f6',
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#2563eb' }
                    }}
                  >
                    {exporting ? 'Exporting...' : 'Download CSV'}
                  </Button>
                </ButtonGroup>
                
                {organizerEvents.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Belum ada event untuk diekspor. Buat event pertama Anda untuk mulai menghasilkan laporan.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
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

export default OrganizerReports;
