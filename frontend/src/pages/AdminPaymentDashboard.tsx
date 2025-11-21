import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  AttachMoney,
  CheckCircle,
  HourglassEmpty,
  Error,
  Refresh,
} from '@mui/icons-material';
import paymentService, { Payment } from '../services/paymentService';
import api from '../services/api';

const AdminPaymentDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    success: 0,
    failed: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Note: Anda perlu buat endpoint ini di backend
      const response = await api.get('/admin/payments');
      setPayments(response.data.data);
      calculateStats(response.data.data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData: Payment[]) => {
    const stats = {
      total: paymentsData.length,
      pending: paymentsData.filter(p => p.payment_status === 'pending').length,
      success: paymentsData.filter(p => p.payment_status === 'success').length,
      failed: paymentsData.filter(p => p.payment_status === 'failed').length,
      totalAmount: paymentsData
        .filter(p => p.payment_status === 'success')
        .reduce((sum, p) => sum + parseFloat(String(p.amount)), 0),
    };
    setStats(stats);
  };

  const filteredPayments = payments.filter(payment => {
    if (statusFilter === 'all') return true;
    return payment.payment_status === statusFilter;
  });

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Payment Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadPayments}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Total Payments"
          value={stats.total}
          icon={<AttachMoney sx={{ fontSize: 40 }} />}
          color="#667eea"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<HourglassEmpty sx={{ fontSize: 40 }} />}
          color="#ff9800"
        />
        <StatCard
          title="Success"
          value={stats.success}
          icon={<CheckCircle sx={{ fontSize: 40 }} />}
          color="#4caf50"
        />
        <StatCard
          title="Total Revenue"
          value={paymentService.formatCurrency(stats.totalAmount)}
          icon={<AttachMoney sx={{ fontSize: 40 }} />}
          color="#4caf50"
        />
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Semua Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Tidak ada data payment
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {payment.invoice_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.user?.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.event?.title || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {paymentService.formatCurrency(payment.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.payment_channel?.toUpperCase() || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={paymentService.getPaymentStatusLabel(payment.payment_status)}
                      size="small"
                      sx={{
                        bgcolor: paymentService.getPaymentStatusColor(payment.payment_status),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(payment.created_at).toLocaleDateString('id-ID')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminPaymentDashboard;
