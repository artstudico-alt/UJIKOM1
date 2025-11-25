import React, { useState, useEffect } from 'react';
import { organizerApiService } from '../services/organizerApiService';
import {
  Box,
  Container,
  Typography,
  Paper,
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
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

interface Participant {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  registration_number: string;
  registration_date: string;
  attendance_status: string;
  is_attendance_verified: boolean;
  has_certificate: boolean;
}

interface Event {
  id?: number;
  title: string;
  date: string;
  max_participants?: number;
  current_participants?: number;
}

const OrganizerParticipants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch participants when event is selected
  useEffect(() => {
    if (selectedEventId && selectedEventId !== 'all') {
      fetchParticipants(parseInt(selectedEventId));
    } else {
      setParticipants([]);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await organizerApiService.getEvents();
      if (response.status === 'success' && response.data) {
        setEvents(response.data as Event[]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId: number) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching participants for event ID:', eventId);
      
      const response = await fetch(`http://localhost:8000/api/organizer/events/${eventId}/participants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      console.log('📊 Participants API Response:', data);
      
      if (data.status === 'success') {
        const participantData = data.data || [];
        console.log('✅ Participants loaded:', participantData.length);
        console.log('📋 Participant data sample:', participantData[0]);
        setParticipants(participantData);
      } else {
        console.error('❌ Failed to fetch participants:', data.message);
        setParticipants([]);
      }
    } catch (error) {
      console.error('❌ Error fetching participants:', error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'registered': return 'primary';
      case 'attended': return 'success';
      default: return 'primary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'pending': return 'Menunggu';
      case 'registered': return 'Terdaftar';
      case 'attended': return 'Hadir';
      default: return 'Terdaftar';
    }
  };

  // Remove unused payment status functions

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by verification status
    let matchesStatus = true;
    if (statusFilter === 'verified') {
      matchesStatus = participant.is_attendance_verified === true;
    } else if (statusFilter === 'unverified') {
      matchesStatus = participant.is_attendance_verified === false;
    }
    // 'all' matches everything
    
    return matchesSearch && matchesStatus;
  });

  const handleViewParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setOpenDialog(true);
  };

  const handleUpdateStatus = (participantId: number, newStatus: string) => {
    setParticipants(participants.map(p => 
      p.id === participantId ? { ...p, attendance_status: newStatus } : p
    ));
  };

  const handleExportData = async () => {
    if (!selectedEventId || selectedEventId === 'all') {
      alert('Pilih event terlebih dahulu untuk export data!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/organizer/events/${selectedEventId}/participants/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `participants_event_${selectedEventId}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Gagal export data!');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Gagal export data!');
    }
  };

  // Statistics
  const totalParticipants = participants.length;
  const verifiedParticipants = participants.filter(p => p.is_attendance_verified === true).length;
  const unverifiedParticipants = participants.filter(p => p.is_attendance_verified === false).length;
  const verificationRate = totalParticipants > 0 ? (verifiedParticipants / totalParticipants) * 100 : 0;

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper sx={{ p: 4, borderRadius: 3, background: 'white', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Manajemen Peserta
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Kelola peserta event Anda
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />} 
              onClick={handleExportData}
              sx={{
                background: 'linear-gradient(45deg, #4f46e5, #3730a3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #3730a3, #312e81)',
                }
              }}
            >
              Export Data
            </Button>
          </Box>

          {/* Statistics Cards */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4
          }}>
            <Card sx={{ borderRadius: 2, border: '2px solid #4f46e520' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#4f46e515', color: '#4f46e5', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#4f46e5">
                    {totalParticipants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Peserta
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: '2px solid #10b98120' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#10b98115', color: '#10b981', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#10b981">
                    {verifiedParticipants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Terverifikasi
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#10b981', display: 'block', mt: 0.5 }}>
                    ✓ Dapat Sertifikat
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: '2px solid #f59e0b20' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b15', color: '#f59e0b', mr: 2 }}>
                  <EventIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#f59e0b">
                    {unverifiedParticipants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Belum Terverifikasi
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#f59e0b', display: 'block', mt: 0.5 }}>
                    ✗ Belum Dapat Sertifikat
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: '2px solid #4f46e520' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: '#4f46e515', color: '#4f46e5', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="#4f46e5">
                      {verificationRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tingkat Verifikasi
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={verificationRate}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: '#4f46e520',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#4f46e5'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Cari peserta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flexGrow: 1 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Event</InputLabel>
              <Select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                label="Event"
              >
                <MenuItem value="all">Pilih Event</MenuItem>
                {events.map((event, index) => (
                  <MenuItem key={event.id || `event-${index}`} value={event.id?.toString() || ''}>
                    {event.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status Verifikasi</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Verifikasi"
              >
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="verified">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                    Terverifikasi
                  </Box>
                </MenuItem>
                <MenuItem value="unverified">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CancelIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                    Belum Terverifikasi
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Participants Table */}
        <Paper sx={{ p: 4, borderRadius: 3, background: 'white' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Daftar Peserta ({filteredParticipants.length})
          </Typography>
          
          {/* Info Alert about Verification */}
          <Box sx={{ 
            bgcolor: '#eff6ff', 
            border: '1px solid #bfdbfe',
            borderRadius: 2, 
            p: 2, 
            mb: 3,
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start'
          }}>
            <Box sx={{ color: '#3b82f6', fontSize: '1.25rem' }}>ℹ️</Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#1e40af" gutterBottom>
                Tentang Status Verifikasi & Sertifikat
              </Typography>
              <Typography variant="body2" color="#1e3a8a">
                <strong>• Terverifikasi:</strong> Peserta yang sudah <strong>daftar hadir</strong> pada event. Mereka <strong style={{ color: '#10b981' }}>dapat menerima sertifikat</strong>.
              </Typography>
              <Typography variant="body2" color="#1e3a8a">
                <strong>• Belum Terverifikasi:</strong> Peserta yang sudah <strong>mendaftar event</strong> tapi <strong>belum hadir</strong>. Mereka <strong style={{ color: '#f59e0b' }}>tidak dapat menerima sertifikat</strong>.
              </Typography>
              <Typography variant="caption" sx={{ color: '#1e40af', display: 'block', mt: 1 }}>
                💡 Hanya peserta yang <strong>terverifikasi (sudah hadir)</strong> yang memenuhi syarat untuk mendapatkan sertifikat.
              </Typography>
            </Box>
          </Box>
          
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Memuat data...</Typography>
            </Box>
          ) : filteredParticipants.length === 0 ? (
            // EMPTY STATE - Belum ada peserta yang mendaftar
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <PeopleIcon sx={{ 
                fontSize: 120, 
                color: '#d1d5db', 
                mb: 3 
              }} />
              <Typography variant="h5" fontWeight="bold" color="text.secondary" sx={{ mb: 2 }}>
                Belum Ada Peserta
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                Belum ada peserta yang mendaftar ke event Anda. Peserta akan muncul di sini setelah mereka mendaftar ke event yang Anda buat.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                bgcolor: '#f3f4f6', 
                p: 2, 
                borderRadius: 2,
                border: '1px solid #e5e7eb',
                maxWidth: 400
              }}>
                💡 <strong>Tips:</strong> Pastikan event Anda sudah dipublikasi dan promosikan ke target audiens untuk mendapatkan peserta.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Peserta</strong></TableCell>
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
                      <Typography variant="body2" fontWeight="medium" sx={{ 
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
                          icon={participant.is_attendance_verified ? <CheckCircleIcon /> : <CancelIcon />}
                          label={participant.is_attendance_verified ? 'Terverifikasi' : 'Belum Terverifikasi'} 
                          color={participant.is_attendance_verified ? 'success' : 'warning'}
                          size="small"
                        />
                        {participant.is_attendance_verified && (
                          <Typography variant="caption" sx={{ color: '#10b981' }}>
                            (Dapat Sertifikat)
                          </Typography>
                        )}
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
                          onClick={() => handleViewParticipant(participant)}
                          sx={{ color: '#4f46e5' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => window.open(`mailto:${participant.email}`)}
                          sx={{ color: '#10b981' }}
                          title="Kirim Email"
                        >
                          <EmailIcon />
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

      {/* Participant Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detail Peserta</DialogTitle>
        <DialogContent>
          {selectedParticipant && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: '#4f46e5', fontSize: '1.5rem' }}>
                  {selectedParticipant.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedParticipant.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {selectedParticipant.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Telepon</Typography>
                  <Typography>{selectedParticipant.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">No. Registrasi</Typography>
                  <Typography fontWeight="bold" sx={{ fontFamily: 'monospace', color: '#4f46e5' }}>
                    {selectedParticipant.registration_number}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Event</Typography>
                  <Typography>
                    {events.find(e => e.id?.toString() === selectedEventId)?.title || '-'}
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
                    icon={selectedParticipant.is_attendance_verified ? <CheckCircleIcon /> : <CancelIcon />}
                    label={selectedParticipant.is_attendance_verified ? 'Terverifikasi (Sudah Hadir)' : 'Belum Terverifikasi (Belum Hadir)'} 
                    color={selectedParticipant.is_attendance_verified ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Sertifikat</Typography>
                  <Chip 
                    label={selectedParticipant.has_certificate ? 'Sudah Diterbitkan' : 'Belum Diterbitkan'} 
                    color={selectedParticipant.has_certificate ? 'success' : 'default'}
                    size="small"
                  />
                  {!selectedParticipant.is_attendance_verified && (
                    <Typography variant="caption" sx={{ color: '#f59e0b', display: 'block', mt: 1 }}>
                      ⚠️ Peserta harus terverifikasi (hadir) untuk mendapatkan sertifikat
                    </Typography>
                  )}
                  {selectedParticipant.is_attendance_verified && !selectedParticipant.has_certificate && (
                    <Typography variant="caption" sx={{ color: '#10b981', display: 'block', mt: 1 }}>
                      ✓ Peserta memenuhi syarat untuk menerima sertifikat
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Tutup</Button>
          {selectedParticipant && (
            <Button 
              variant="contained" 
              onClick={() => window.open(`mailto:${selectedParticipant.email}`)}
            >
              Kirim Email
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizerParticipants;
