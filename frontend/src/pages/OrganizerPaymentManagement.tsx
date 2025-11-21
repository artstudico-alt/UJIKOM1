import React, { useState, useEffect } from 'react';
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
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { organizerApiService } from '../services/organizerApiService';

interface Payment {
  id: number;
  event_id: number;
  event_title: string;
  user_name: string;
  user_email: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_date?: string;
  created_at: string;
  transaction_id?: string;
}

const OrganizerPaymentManagement: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);

  // Statistics
  const [stats, setStats] = useState({
    total_revenue: 0,
    pending_amount: 0,
    completed_payments: 0,
    pending_payments: 0,
  });

  useEffect(() => {
    loadPayments();
    loadEvents();
  }, [statusFilter, eventFilter, searchQuery]);

  const loadEvents = async () => {
    try {
      const response = await organizerApiService.getEvents();
      setEvents(response.data || []);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API endpoint
      const response = await organizerApiService.getPayments({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        event_id: eventFilter !== 'all' ? eventFilter : undefined,
        search: searchQuery || undefined,
      });
      
      if (response.status === 'success') {
        setPayments(response.data || []);
        
        // Set stats from API response
        if (response.stats) {
          setStats({
            total_revenue: response.stats.total_revenue || 0,
            pending_amount: response.stats.pending_amount || 0,
            completed_payments: response.stats.completed_payments || 0,
            pending_payments: response.stats.pending_payments || 0,
          });
        }
      }
      
    } catch (err: any) {
      console.error('Error loading payments:', err);
      setError(err.message || 'Gagal memuat data pembayaran');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <CheckCircleIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return <CancelIcon />;
      default:
        return undefined;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Menunggu';
      case 'failed':
        return 'Gagal';
      case 'expired':
        return 'Kadaluarsa';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || payment.event_id.toString() === eventFilter;
    
    return matchesSearch && matchesStatus && matchesEvent;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: '#f8fafc' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}>
              <PaymentIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: '#1e293b' }}>
                💳 Payment Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Kelola pembayaran dan revenue dari event Anda
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#10b981' }}>
                {formatCurrency(stats.total_revenue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Dari {stats.completed_payments} pembayaran selesai
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, border: '1px solid rgba(251, 146, 60, 0.2)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pending Amount
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#fb923c' }}>
                {formatCurrency(stats.pending_amount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Dari {stats.pending_payments} pembayaran pending
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pembayaran Selesai
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#6366f1' }}>
                {stats.completed_payments}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Transaksi berhasil
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, border: '1px solid rgba(251, 146, 60, 0.2)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pembayaran Pending
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#fb923c' }}>
                {stats.pending_payments}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Menunggu konfirmasi
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <TextField
                placeholder="Cari nama, event, atau ID transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ flex: 1 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={<FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="success">Selesai</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Gagal</MenuItem>
                  <MenuItem value="expired">Kadaluarsa</MenuItem>
                  <MenuItem value="cancelled">Dibatalkan</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Event</InputLabel>
                <Select
                  value={eventFilter}
                  label="Event"
                  onChange={(e) => setEventFilter(e.target.value)}
                >
                  <MenuItem value="all">Semua Event</MenuItem>
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id.toString()}>
                      {event.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Daftar Pembayaran
            </Typography>
            
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell><strong>ID Transaksi</strong></TableCell>
                    <TableCell><strong>Event</strong></TableCell>
                    <TableCell><strong>Peserta</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Metode</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Tanggal</strong></TableCell>
                    <TableCell align="center"><strong>Aksi</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Tidak ada data pembayaran
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {payment.transaction_id || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {payment.event_title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {payment.user_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.user_email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: '#10b981' }}>
                            {formatCurrency(payment.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.payment_method.replace('_', ' ').toUpperCase()} 
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            {...(getStatusIcon(payment.status) ? { icon: getStatusIcon(payment.status) } : {})}
                            label={getStatusText(payment.status)}
                            color={getStatusColor(payment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(payment.payment_date || payment.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Lihat Detail">
                            <IconButton size="small" sx={{ color: '#6366f1' }}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Invoice">
                            <IconButton size="small" sx={{ color: '#10b981' }}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Info Note */}
        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
          <Typography variant="body2">
            💡 <strong>Info:</strong> Halaman ini menampilkan semua pembayaran dari event yang Anda kelola. 
            Revenue akan diteruskan sesuai dengan kesepakatan dengan platform.
          </Typography>
        </Alert>
      </Container>
    </Box>
  );
};

export default OrganizerPaymentManagement;
