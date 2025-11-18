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
      const response = await fetch(`http://localhost:8000/api/organizer/events/${eventId}/participants`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setParticipants(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'primary';
      case 'attended': return 'success';
      case 'cancelled': return 'error';
      case 'no_show': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered': return 'Terdaftar';
      case 'attended': return 'Hadir';
      case 'cancelled': return 'Dibatalkan';
      case 'no_show': return 'Tidak Hadir';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'paid': return 'success';
      case 'refunded': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'paid': return 'Lunas';
      case 'refunded': return 'Dikembalikan';
      default: return status;
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || participant.attendance_status === statusFilter;
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
  const attendedParticipants = participants.filter(p => p.is_attendance_verified).length;
  const registeredParticipants = participants.filter(p => p.attendance_status === 'pending').length;
  const attendanceRate = totalParticipants > 0 ? (attendedParticipants / totalParticipants) * 100 : 0;

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
                    {attendedParticipants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hadir
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: '2px solid #06b6d420' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#06b6d415', color: '#06b6d4', mr: 2 }}>
                  <EventIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#06b6d4">
                    {registeredParticipants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Terdaftar
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: '2px solid #f59e0b20' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: '#f59e0b15', color: '#f59e0b', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="#f59e0b">
                      {attendanceRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tingkat Kehadiran
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={attendanceRate}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: '#f59e0b20',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#f59e0b'
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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="registered">Terdaftar</MenuItem>
                <MenuItem value="attended">Hadir</MenuItem>
                <MenuItem value="cancelled">Dibatalkan</MenuItem>
                <MenuItem value="no_show">Tidak Hadir</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Participants Table */}
        <Paper sx={{ p: 4, borderRadius: 3, background: 'white' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Daftar Peserta ({filteredParticipants.length})
          </Typography>
          
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
                    <TableCell><strong>Event</strong></TableCell>
                    <TableCell><strong>Tanggal Daftar</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Kehadiran</strong></TableCell>
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
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {events.find(e => e.id?.toString() === selectedEventId)?.title || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(participant.registration_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(participant.attendance_status)} 
                        color={getStatusColor(participant.attendance_status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={participant.is_attendance_verified ? 'Hadir' : 'Belum Hadir'} 
                        color={participant.is_attendance_verified ? 'success' : 'warning'}
                        size="small"
                      />
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
                        >
                          <EmailIcon />
                        </IconButton>
                        {participant.attendance_status === 'pending' && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleUpdateStatus(participant.id, 'attended')}
                            sx={{ color: '#10b981' }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        )}
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
                  <Typography variant="subtitle2" color="text.secondary">Event</Typography>
                  <Typography>
                    {events.find(e => e.id?.toString() === selectedEventId)?.title || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Tanggal Pendaftaran</Typography>
                  <Typography>
                    {new Date(selectedParticipant.registration_date).toLocaleDateString('id-ID')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status Kehadiran</Typography>
                  <Chip 
                    label={getStatusText(selectedParticipant.attendance_status)} 
                    color={getStatusColor(selectedParticipant.attendance_status) as any}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Kehadiran</Typography>
                  <Chip 
                    label={selectedParticipant.is_attendance_verified ? 'Sudah Hadir' : 'Belum Hadir'} 
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
