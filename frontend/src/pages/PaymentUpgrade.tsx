import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, CheckCircle, WorkspacePremium, Logout } from '@mui/icons-material';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';
import paymentService from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';

const PaymentUpgrade: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const steps = ['Pilih Metode Pembayaran', 'Konfirmasi', 'Pembayaran'];

  const upgradePrice = 99000; // Rp 99.000 per bulan
  const adminFee = 1000;
  const totalAmount = upgradePrice + adminFee;

  const handlePaymentMethodSelect = (method: string, channel: string) => {
    setSelectedMethod(method);
    setSelectedChannel(channel);
    setError('');
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!selectedMethod || !selectedChannel) {
        setError('Silakan pilih metode pembayaran');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      await createUpgradePayment();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const createUpgradePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await paymentService.createUpgradePayment({
        payment_method: selectedMethod,
        payment_channel: selectedChannel,
        amount: totalAmount,
      });

      setPayment(response.data.payment);
      setActiveStep(2);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal membuat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    if (!payment?.invoice_number) return;
    
    setLoading(true);
    try {
      // Force update payment to success (for development only)
      const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/${payment.invoice_number}/simulate-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setShowSuccessDialog(true);
      } else {
        alert('Gagal simulasi pembayaran. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Simulate payment error:', error);
      alert('Gagal simulasi pembayaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <PaymentMethodSelector
              onSelect={handlePaymentMethodSelect}
              selectedMethod={selectedMethod}
              selectedChannel={selectedChannel}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Konfirmasi Upgrade ke Event Organizer
            </Typography>

            <Card sx={{ mb: 3, border: '2px solid #667eea' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <WorkspacePremium sx={{ fontSize: 40, color: '#667eea' }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                      Event Organizer Pro
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upgrade akun Anda dan mulai mengelola event
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <List>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Buat & kelola unlimited event" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard analitik lengkap" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Manajemen peserta & sertifikat" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="QR Code check-in & export data" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Metode Pembayaran
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                  {selectedChannel.toUpperCase()}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Paket Event Organizer
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Rp {upgradePrice.toLocaleString('id-ID')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Biaya Admin
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Rp {adminFee.toLocaleString('id-ID')}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Pembayaran Dibuat!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Silakan selesaikan pembayaran Anda
            </Typography>

            {payment && (
              <Card sx={{ mb: 3, textAlign: 'left' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Nomor Pembayaran
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {payment.doku_payment_code || payment.invoice_number}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Jumlah Pembayaran
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea', mb: 2 }}>
                    Rp {payment.amount?.toLocaleString('id-ID')}
                  </Typography>

                  <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2">
                      Selesaikan pembayaran sebelum {new Date(payment.expiry_time).toLocaleString('id-ID')}
                    </Typography>
                  </Alert>

                  {payment.payment_url && !payment.payment_url.includes('/payment/mock/') ? (
                    <Button
                      fullWidth
                      variant="contained"
                      href={payment.payment_url}
                      target="_blank"
                      sx={{ mt: 2 }}
                    >
                      Bayar Sekarang
                    </Button>
                  ) : (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Mode Development - Simulasi Pembayaran
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Setelah berhasil, logout dan login lagi untuk akses Organizer Dashboard.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={simulatePaymentSuccess}
                disabled={loading}
                sx={{ minWidth: 300 }}
              >
                {loading ? 'Processing...' : '✅ Simulasi Pembayaran Berhasil'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/payment/status/' + payment?.id)}
              >
                Cek Status Pembayaran
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/profile')}
              >
                Kembali ke Profile
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/pricing')}
        sx={{ mb: 3 }}
      >
        Kembali
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
          Upgrade ke Event Organizer
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Tingkatkan akun Anda dan mulai mengelola event profesional
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ minHeight: 400 }}>
          {renderStepContent()}
        </Box>

        {activeStep < 2 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Kembali
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {activeStep === steps.length - 2 ? 'Bayar Sekarang' : 'Lanjut'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'scaleIn 0.3s ease-out',
              '@keyframes scaleIn': {
                '0%': { transform: 'scale(0)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          >
            <CheckCircle sx={{ fontSize: 50, color: 'white' }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#4caf50' }}>
            Pembayaran Berhasil!
          </Typography>

          <Typography variant="body1" sx={{ mb: 1, color: 'text.primary' }}>
            ✅ Akun Anda sekarang <strong>Event Organizer</strong>
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Silakan logout dan login lagi untuk mengakses Organizer Dashboard
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{
                minWidth: 200,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Logout Sekarang
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/profile');
              }}
              sx={{
                minWidth: 120,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Nanti
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PaymentUpgrade;
