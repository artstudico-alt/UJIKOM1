import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Error,
  HourglassEmpty,
  Schedule,
  ArrowBack,
  Refresh,
} from '@mui/icons-material';
import paymentService, { Payment } from '../services/paymentService';

const PaymentStatus: React.FC = () => {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (invoiceNumber) {
      checkPaymentStatus();
    }
  }, [invoiceNumber]);

  useEffect(() => {
    if (!autoRefresh || !payment || payment.payment_status !== 'pending') {
      return;
    }

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, payment]);

  const checkPaymentStatus = async () => {
    if (!invoiceNumber) return;

    try {
      setLoading(true);
      const response = await paymentService.checkPaymentStatus(invoiceNumber);
      setPayment(response.data);
      setError('');

      // Stop auto-refresh if payment is not pending
      if (response.data.payment_status !== 'pending') {
        setAutoRefresh(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat status pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!payment) return null;

    switch (payment.payment_status) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 80, color: '#4caf50' }} />;
      case 'failed':
        return <Error sx={{ fontSize: 80, color: '#f44336' }} />;
      case 'expired':
        return <HourglassEmpty sx={{ fontSize: 80, color: '#9e9e9e' }} />;
      case 'pending':
      default:
        return <Schedule sx={{ fontSize: 80, color: '#ff9800' }} />;
    }
  };

  const getStatusMessage = () => {
    if (!payment) return '';

    switch (payment.payment_status) {
      case 'success':
        return 'Pembayaran Berhasil!';
      case 'failed':
        return 'Pembayaran Gagal';
      case 'expired':
        return 'Pembayaran Kadaluarsa';
      case 'pending':
      default:
        return 'Menunggu Pembayaran';
    }
  };

  const getStatusDescription = () => {
    if (!payment) return '';

    switch (payment.payment_status) {
      case 'success':
        return 'Pembayaran Anda telah berhasil diproses. Anda sudah terdaftar di event ini.';
      case 'failed':
        return 'Pembayaran Anda gagal diproses. Silakan coba lagi atau hubungi customer service.';
      case 'expired':
        return 'Batas waktu pembayaran telah habis. Silakan buat pembayaran baru.';
      case 'pending':
      default:
        return 'Silakan selesaikan pembayaran Anda sebelum batas waktu.';
    }
  };

  if (loading && !payment) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Memuat status pembayaran...</Typography>
      </Container>
    );
  }

  if (error && !payment) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/my-events')}
          sx={{ mt: 2 }}
        >
          Kembali ke Event Saya
        </Button>
      </Container>
    );
  }

  if (!payment) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="warning">Pembayaran tidak ditemukan</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/my-events')}
          sx={{ mt: 2 }}
        >
          Kembali ke Event Saya
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/my-events')}
        sx={{ mb: 3 }}
      >
        Kembali
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        {getStatusIcon()}

        <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
          {getStatusMessage()}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {getStatusDescription()}
        </Typography>

        <Chip
          label={paymentService.getPaymentStatusLabel(payment.payment_status)}
          sx={{
            bgcolor: paymentService.getPaymentStatusColor(payment.payment_status),
            color: 'white',
            fontWeight: 600,
            px: 2,
            py: 2.5,
            fontSize: '1rem',
          }}
        />

        {payment.payment_status === 'pending' && autoRefresh && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Auto-refresh setiap 5 detik...
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Card sx={{ bgcolor: '#f5f5f5', textAlign: 'left' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Detail Pembayaran
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Nomor Invoice
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {payment.invoice_number}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Jumlah
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {paymentService.formatCurrency(payment.amount)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Metode Pembayaran
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {payment.payment_channel?.toUpperCase()}
                </Typography>
              </Box>

              {payment.doku_payment_code && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nomor VA
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {payment.doku_payment_code}
                  </Typography>
                </Box>
              )}

              {payment.expired_at && payment.payment_status === 'pending' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Berlaku Hingga
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                    {new Date(payment.expired_at).toLocaleString('id-ID')}
                  </Typography>
                </Box>
              )}

              {payment.paid_at && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Dibayar Pada
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
                    {new Date(payment.paid_at).toLocaleString('id-ID')}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          {payment.payment_status === 'pending' && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={checkPaymentStatus}
              disabled={loading}
            >
              Refresh Status
            </Button>
          )}

          {payment.payment_status === 'success' && (
            <>
              <Button
                variant="outlined"
                onClick={() => navigate(`/events/${payment.event_id}`)}
              >
                Lihat Event
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/my-events')}
                sx={{ bgcolor: '#667eea' }}
              >
                Event Saya
              </Button>
            </>
          )}

          {(payment.payment_status === 'failed' || payment.payment_status === 'expired') && (
            <Button
              variant="contained"
              onClick={() => navigate(`/payment/checkout/${payment.event_id}`)}
              sx={{ bgcolor: '#667eea' }}
            >
              Bayar Ulang
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default PaymentStatus;
