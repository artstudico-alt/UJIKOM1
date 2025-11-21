import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Download, BarChart, PieChart, TrendingUp } from '@mui/icons-material';
import { adminApiService } from '../services/adminApiService';

interface EventStats {
  totalEvents: number;
  adminEvents: number;
  eoEvents: number;
  publishedEvents: number;
  pendingEvents: number;
  totalParticipants: number;
  averageAttendance: number;
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    adminEvents: 0,
    eoEvents: 0,
    publishedEvents: 0,
    pendingEvents: 0,
    totalParticipants: 0,
    averageAttendance: 0,
  });
  const [reportType, setReportType] = useState('events');
  const [timePeriod, setTimePeriod] = useState('month');
  const [format, setFormat] = useState('pdf');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all events (no filter to get ALL events including admin)
      const response = await adminApiService.getAllEvents({
        per_page: 1000, // Get all events
      });
      
      console.log('📊 Raw API Response:', response);
      
      // Handle nested data structure
      const events = response.data || [];

      console.log('📊 All Events for Reports:', events);
      console.log('📊 Total events fetched:', events.length);

      // Calculate statistics
      const adminEvents = events.filter((e: any) => e.organizer_type === 'admin');
      const eoEvents = events.filter((e: any) => e.organizer_type === 'organizer');
      const publishedEvents = events.filter((e: any) => e.status === 'published' || e.status === 'approved');
      const pendingEvents = events.filter((e: any) => e.status === 'pending_approval');

      // Debug: Log each event's organizer_type
      console.log('🔍 Event Details:');
      events.forEach((e: any, index: number) => {
        console.log(`  Event ${index + 1}: "${e.title}" - organizer_type: "${e.organizer_type}" - status: "${e.status}"`);
      });

      // Calculate total participants
      const totalParticipants = events.reduce((sum: number, event: any) => {
        return sum + (event.current_participants || event.participants_count || 0);
      }, 0);

      // Calculate average attendance (dummy calculation for now)
      const averageAttendance = events.length > 0 ? Math.round((totalParticipants / events.length) * 100) / 100 : 0;

      setStats({
        totalEvents: events.length,
        adminEvents: adminEvents.length,
        eoEvents: eoEvents.length,
        publishedEvents: publishedEvents.length,
        pendingEvents: pendingEvents.length,
        totalParticipants,
        averageAttendance,
      });

      console.log('📈 Report Stats:', {
        total: events.length,
        admin: adminEvents.length,
        eo: eoEvents.length,
        published: publishedEvents.length,
        pending: pendingEvents.length,
      });

      // Show warning if no events found
      if (events.length === 0) {
        console.warn('⚠️ No events found! Please create some events first.');
        setError('Tidak ada event yang ditemukan. Silakan buat event terlebih dahulu.');
      }

    } catch (err: any) {
      console.error('❌ Error fetching report data:', err);
      console.error('❌ Error details:', err.response?.data);
      setError(err.message || 'Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    console.log('Generate Report:', { reportType, timePeriod, format });
    alert(`Generating ${reportType} report for ${timePeriod} in ${format} format...\n\nTotal Events: ${stats.totalEvents}\nAdmin Events: ${stats.adminEvents}\nEO Events: ${stats.eoEvents}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Reports & Analytics
      </Typography>

      {/* Report Controls */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, alignItems: 'center' }}>
          <Box>
            <TextField
              fullWidth
              select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="events">Events Report</MenuItem>
              <MenuItem value="participants">Participants Report</MenuItem>
              <MenuItem value="attendance">Attendance Report</MenuItem>
              <MenuItem value="certificates">Certificates Report</MenuItem>
            </TextField>
          </Box>
          <Box>
            <TextField
              fullWidth
              select
              label="Time Period"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </TextField>
          </Box>
          <Box>
            <TextField
              fullWidth
              select
              label="Format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </TextField>
          </Box>
          <Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={handleGenerateReport}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Generate Report
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ textAlign: 'center', p: 3 }}>
          <BarChart sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {stats.totalEvents}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Total Events
          </Typography>
          <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
            Admin: {stats.adminEvents} | EO: {stats.eoEvents}
          </Typography>
        </Card>
        <Card sx={{ textAlign: 'center', p: 3 }}>
          <PieChart sx={{ fontSize: 48, color: '#f093fb', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {stats.totalParticipants}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Total Participants
          </Typography>
          <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
            Published: {stats.publishedEvents} | Pending: {stats.pendingEvents}
          </Typography>
        </Card>
        <Card sx={{ textAlign: 'center', p: 3 }}>
          <TrendingUp sx={{ fontSize: 48, color: '#43e97b', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {stats.averageAttendance.toFixed(1)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Avg Participants/Event
          </Typography>
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            {stats.totalEvents > 0 ? 'Active' : 'No events yet'}
          </Typography>
        </Card>
      </Box>

      {/* Quick Reports */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Quick Reports
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ mb: 2 }}
              >
                Events Summary
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ mb: 2 }}
              >
                Participants List
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ mb: 2 }}
              >
                Attendance Report
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ mb: 2 }}
              >
                Certificates Issued
              </Button>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Scheduled Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No scheduled reports configured.
            </Typography>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              }}
            >
              Schedule Report
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Reports;
