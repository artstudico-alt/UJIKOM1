import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Search, FileDownload, Visibility, Email, CheckCircle, Cancel } from '@mui/icons-material';

interface Participant {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  event_title: string;
  event_date: string;
  registration_number: string;
  registration_date: string;
  attendance_status: string;
  is_attendance_verified: boolean;
  has_certificate: boolean;
}

interface Event {
  id: number;
  title: string;
  date: string;
}

const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Track if initial load is done
  const [initialLoad, setInitialLoad] = React.useState(true);

  // Fetch all events for filter dropdown
  useEffect(() => {
    console.log('🚀 Component mounted - starting initial data load');
    fetchEvents();
    fetchParticipants(); // Fetch participants immediately on mount
    setInitialLoad(false);
  }, []);

  // Fetch participants when filters change (but not on initial load)
  useEffect(() => {
    if (!initialLoad) {
      console.log('🔄 Filters changed - refetching participants');
      fetchParticipants();
    }
  }, [selectedEventId, verificationFilter]);

  const fetchEvents = async () => {
    try {
      console.log('🔍 Fetching events for filter dropdown...');
      const response = await fetch('http://localhost:8000/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      console.log('📊 Events API Response:', data);
      
      if (data.data) {
        setEvents(data.data);
        console.log('✅ Events loaded:', data.data.length);
      } else {
        console.warn('⚠️ No events data in response');
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error);
    }
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      
      // Check auth token first
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('❌ No auth token! Please login.');
        setParticipants([]);
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching participants...', { 
        selectedEventId, 
        verificationFilter,
        authToken: 'exists',
        timestamp: new Date().toISOString()
      });

      let url = 'http://localhost:8000/api/admin/participants?';
      const params = new URLSearchParams();
      
      if (selectedEventId !== 'all') {
        params.append('event_id', selectedEventId);
      }
      if (verificationFilter !== 'all') {
        params.append('verification_status', verificationFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      url += params.toString();

      console.log('📞 Making API request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Participants API Response:', data);
      
      if (data.status === 'success') {
        const participantData = data.data || [];
        setParticipants(participantData);
        console.log('✅ Participants loaded:', participantData.length);
        if (participantData.length === 0) {
          console.warn('⚠️ No participants found with current filters');
        }
      } else {
        console.error('❌ Failed to fetch participants:', data.message);
        setParticipants([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching participants:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchParticipants();
  };

  const handleExportXLSX = async () => {
    try {
      const url = selectedEventId !== 'all' 
        ? `http://localhost:8000/api/admin/export/participants?event_id=${selectedEventId}`
        : 'http://localhost:8000/api/admin/export/participants';
      
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Nama', 'Email', 'Phone', 'Event', 'No. Registrasi', 'Tanggal Daftar', 'Verifikasi', 'Sertifikat'];
    const csvData = participants.map((p, index) => [
      index + 1,
      p.name,
      p.email,
      p.phone,
      p.event_title,
      p.registration_number,
      new Date(p.registration_date).toLocaleDateString('id-ID'),
      p.is_attendance_verified ? 'Terverifikasi' : 'Belum Terverifikasi',
      p.has_certificate ? 'Sudah' : 'Belum'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleViewDetails = (participant: Participant) => {
    setSelectedParticipant(participant);
    setDialogOpen(true);
  };

  const filteredParticipants = participants.filter(p => {
    if (searchTerm) {
      return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.email.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Statistics
  const totalParticipants = filteredParticipants.length;
  const verifiedCount = filteredParticipants.filter(p => p.is_attendance_verified).length;
  const unverifiedCount = filteredParticipants.filter(p => !p.is_attendance_verified).length;
  const verificationRate = totalParticipants > 0 ? ((verifiedCount / totalParticipants) * 100).toFixed(1) : '0';

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#1f2937' }}>
        Manajemen Peserta
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Kelola dan monitor semua peserta event di EventHub
      </Typography>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" fontWeight="bold">{totalParticipants}</Typography>
          <Typography variant="body2">Total Peserta</Typography>
        </Paper>
        <Paper sx={{ p: 3, bgcolor: '#10b981', color: 'white' }}>
          <Typography variant="h4" fontWeight="bold">{verifiedCount}</Typography>
          <Typography variant="body2">Terverifikasi</Typography>
        </Paper>
        <Paper sx={{ p: 3, bgcolor: '#f59e0b', color: 'white' }}>
          <Typography variant="h4" fontWeight="bold">{unverifiedCount}</Typography>
          <Typography variant="body2">Belum Terverifikasi</Typography>
        </Paper>
        <Paper sx={{ p: 3, bgcolor: '#3b82f6', color: 'white' }}>
          <Typography variant="h4" fontWeight="bold">{verificationRate}%</Typography>
          <Typography variant="body2">Tingkat Verifikasi</Typography>
        </Paper>
      </Box>

      {/* Filters and Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Event</InputLabel>
            <Select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              label="Event"
            >
              <MenuItem value="all">Semua Event</MenuItem>
              {events.map(event => (
                <MenuItem key={event.id} value={event.id.toString()}>
                  {event.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status Verifikasi</InputLabel>
            <Select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              label="Status Verifikasi"
            >
              <MenuItem value="all">Semua Status</MenuItem>
              <MenuItem value="verified">✓ Terverifikasi</MenuItem>
              <MenuItem value="unverified">✗ Belum Terverifikasi</MenuItem>
            </Select>
          </FormControl>

          <TextField
            placeholder="Cari peserta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 250 }}
          />

          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ bgcolor: '#4f46e5' }}
          >
            Cari
          </Button>

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportXLSX}
              sx={{ color: '#10b981', borderColor: '#10b981' }}
            >
              Export XLSX
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExportCSV}
              sx={{ color: '#3b82f6', borderColor: '#3b82f6' }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>💡 Info Verifikasi:</strong> Peserta terverifikasi adalah peserta yang sudah melakukan daftar hadir (check-in) di event. 
        Hanya peserta terverifikasi yang memenuhi syarat untuk mendapatkan sertifikat.
      </Alert>

      {/* Participants Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredParticipants.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {searchTerm || selectedEventId !== 'all' || verificationFilter !== 'all'
                ? '🔍 Tidak ada peserta yang sesuai dengan filter'
                : '📭 Belum ada peserta yang terdaftar'}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Peserta</strong></TableCell>
                  <TableCell><strong>Event</strong></TableCell>
                  <TableCell><strong>No. Registrasi</strong></TableCell>
                  <TableCell><strong>Tanggal Daftar</strong></TableCell>
                  <TableCell><strong>Status Verifikasi</strong></TableCell>
                  <TableCell><strong>Sertifikat</strong></TableCell>
                  <TableCell><strong>Aksi</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: '#4f46e5' }}>
                          {participant.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="bold">{participant.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {participant.email}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: '#6b7280' }}>
                            📱 {participant.phone || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{participant.event_title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {participant.event_date ? new Date(participant.event_date).toLocaleDateString('id-ID') : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'monospace',
                        color: '#4f46e5',
                        bgcolor: '#eef2ff',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'inline-block'
                      }}>
                        {participant.registration_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(participant.registration_date).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(participant.registration_date).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          icon={participant.is_attendance_verified ? <CheckCircle /> : <Cancel />}
                          label={participant.is_attendance_verified ? 'Terverifikasi' : 'Belum Terverifikasi'} 
                          color={participant.is_attendance_verified ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={participant.has_certificate ? 'Diterbitkan' : 'Belum'}
                        color={participant.has_certificate ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(participant)}
                          sx={{ color: '#4f46e5' }}
                          title="Lihat Detail"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => window.open(`mailto:${participant.email}`)}
                          sx={{ color: '#10b981' }}
                          title="Kirim Email"
                        >
                          <Email />
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

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4f46e5', color: 'white' }}>
          Detail Peserta
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedParticipant && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: '#4f46e5', fontSize: '2rem' }}>
                  {selectedParticipant.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{selectedParticipant.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedParticipant.email}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Telepon</Typography>
                  <Typography>{selectedParticipant.phone || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Event</Typography>
                  <Typography>{selectedParticipant.event_title}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">No. Registrasi</Typography>
                  <Typography fontWeight="bold" sx={{ fontFamily: 'monospace', color: '#4f46e5' }}>
                    {selectedParticipant.registration_number}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Tanggal Pendaftaran</Typography>
                  <Typography>
                    {new Date(selectedParticipant.registration_date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status Verifikasi</Typography>
                  <Chip 
                    icon={selectedParticipant.is_attendance_verified ? <CheckCircle /> : <Cancel />}
                    label={selectedParticipant.is_attendance_verified ? 'Terverifikasi (Sudah Hadir)' : 'Belum Terverifikasi (Belum Hadir)'} 
                    color={selectedParticipant.is_attendance_verified ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status Sertifikat</Typography>
                  <Chip 
                    label={selectedParticipant.has_certificate ? 'Sudah Diterbitkan' : 'Belum Diterbitkan'}
                    color={selectedParticipant.has_certificate ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                {selectedParticipant.is_attendance_verified && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    ✅ Peserta ini sudah terverifikasi dan memenuhi syarat untuk menerima sertifikat.
                  </Alert>
                )}
                {!selectedParticipant.is_attendance_verified && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ⚠️ Peserta ini belum terverifikasi (belum hadir). Peserta harus melakukan check-in di event untuk mendapatkan sertifikat.
                  </Alert>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Participants;
