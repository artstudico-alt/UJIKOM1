import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Event as EventIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { userService } from '../../services/api';

interface Participant {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_verified: boolean;
    status: 'active' | 'inactive' | 'suspended';
  };
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
  };
  registration_date: string;
  attendance_status: 'registered' | 'attended' | 'absent' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
}

const Participants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const queryClient = useQueryClient();

  // Mock data for demonstration - Website baru, data kosong
  const mockParticipants: Participant[] = [];

  // Filter participants based on search and status
  const filteredParticipants = mockParticipants.filter(participant => {
    const matchesSearch = participant.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.event.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && participant.user.is_verified) ||
                         (statusFilter === 'unverified' && !participant.user.is_verified) ||
                         (statusFilter === 'suspended' && participant.user.status === 'suspended');
    
    return matchesSearch && matchesStatus;
  });

  // Simulate loading state
  const isLoading = false;
  const error = null;
  const participantsData = { data: filteredParticipants, meta: { last_page: 1 } };

  // Update participant status
  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: string }) => {
      // Simulate API call
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: 'Status peserta berhasil diupdate',
        severity: 'success'
      });
      setDialogOpen(false);
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Gagal update status peserta',
        severity: 'error'
      });
    }
  });

  // Mock refetch function
  const refetch = () => {
    // Simulate refetch
    console.log('Refreshing participants data...');
  };

  const handleStatusUpdate = (participantId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: participantId, status: newStatus });
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    try {
      // Implement export functionality
      setSnackbar({
        open: true,
        message: `Data peserta berhasil diexport ke ${format.toUpperCase()}`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Gagal export data peserta',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'attended': return 'success';
      case 'registered': return 'info';
      case 'absent': return 'error';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Gagal memuat data peserta. Silakan coba lagi.
        </Alert>
      </Box>
    );
  }

  const participants = participantsData?.data || [];
  const totalPages = participantsData?.meta?.last_page || 1;

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              Manajemen Peserta
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Kelola dan monitor semua peserta event di EventHub
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => refetch()} sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('xlsx')}
            >
              Export XLSX
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Cari peserta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status Verifikasi</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status Verifikasi"
            >
              <MenuItem value="all">Semua Status</MenuItem>
              <MenuItem value="verified">Terverifikasi</MenuItem>
              <MenuItem value="unverified">Belum Terverifikasi</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Participants Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Peserta</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Tanggal Daftar</TableCell>
                  <TableCell>Status Verifikasi</TableCell>
                  <TableCell>Status Kehadiran</TableCell>
                  <TableCell>Status Pembayaran</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                          color: 'white',
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
                        }}>
                          {participant.user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {participant.user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {participant.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {participant.event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(participant.event.date), 'dd MMM yyyy', { locale: id })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(participant.registration_date), 'dd MMM yyyy', { locale: id })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={participant.user.is_verified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                        color={participant.user.is_verified ? 'success' : 'warning'}
                        size="small"
                        icon={participant.user.is_verified ? <CheckIcon /> : <CancelIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={participant.attendance_status}
                        color={getAttendanceColor(participant.attendance_status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={participant.payment_status}
                        color={participant.payment_status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Lihat Detail">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedParticipant(participant);
                              setDialogOpen(true);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedParticipant(participant);
                              setDialogOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Participant Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detail Peserta - {selectedParticipant?.user.name}
        </DialogTitle>
        <DialogContent>
          {selectedParticipant && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Informasi Peserta</Typography>
                  <Typography variant="body2"><strong>Nama:</strong> {selectedParticipant.user.name}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedParticipant.user.email}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {selectedParticipant.user.phone || 'Tidak ada'}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {selectedParticipant.user.status}</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>Informasi Event</Typography>
                  <Typography variant="body2"><strong>Event:</strong> {selectedParticipant.event.title}</Typography>
                  <Typography variant="body2"><strong>Tanggal:</strong> {format(new Date(selectedParticipant.event.date), 'dd MMM yyyy', { locale: id })}</Typography>
                  <Typography variant="body2"><strong>Lokasi:</strong> {selectedParticipant.event.location}</Typography>
                  <Typography variant="body2"><strong>Tanggal Daftar:</strong> {format(new Date(selectedParticipant.registration_date), 'dd MMM yyyy', { locale: id })}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Tutup</Button>
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

export default Participants;
