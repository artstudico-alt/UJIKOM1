import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, CheckCircle, Schedule, Event as EventIcon } from '@mui/icons-material';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';
import paymentService from '../services/paymentService';
import api from '../services/api';

const PaymentCheckout: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [event, setEvent] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const steps = ['Pilih Metode Pembayaran', 'Konfirmasi', 'Pembayaran'];

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      console.log('💰 Payment Checkout - Full Response:', response.data);
      
      // Backend returns { status: 'success', data: EventResource }
      const eventData = response.data.data || response.data;
      
      console.log('💰 Event Data:', eventData);
      console.log('💰 Event Price:', eventData?.price);
      console.log('💰 Event Price Type:', typeof eventData?.price);
      
      setEvent(eventData);
    } catch (error) {
      console.error('Failed to load event:', error);
      setError('Gagal memuat data event');
    }
  };

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
      await createPayment();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const createPayment = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🚀 Creating payment with:', {
        event_id: Number(eventId),
        payment_method: selectedMethod,
        payment_channel: selectedChannel,
      });
      
      const response = await paymentService.createPayment({
        event_id: Number(eventId),
        payment_method: selectedMethod,
        payment_channel: selectedChannel,
      });

      console.log('💳 paymentService returned:', response);
      console.log('📊 Response type:', typeof response);
      console.log('📊 Response keys:', Object.keys(response || {}));
      
      // Try to find payment data in various possible locations
      let paymentData: any = null;
      const responseAny: any = response;
      
      if (response?.data?.payment) {
        console.log('✅ Found at response.data.payment');
        paymentData = response.data.payment;
      } else if (responseAny?.payment) {
        console.log('✅ Found at response.payment');
        paymentData = responseAny.payment;
      } else if (response?.data && (response.data as any).invoice_number) {
        console.log('✅ response.data IS the payment');
        paymentData = response.data;
      } else if (responseAny?.invoice_number) {
        console.log('✅ response itself IS the payment');
        paymentData = responseAny;
      }
      
      console.log('💳 Final payment data:', paymentData);
      console.log('📝 Invoice Number:', paymentData?.invoice_number);
      
      if (!paymentData || !paymentData.invoice_number) {
        console.error('❌ COULD NOT FIND PAYMENT DATA!');
        console.error('Full response structure:', JSON.stringify(response, null, 2));
        
        alert(`Payment creation failed!\n\nResponse: ${JSON.stringify(response).substring(0, 300)}`);
        throw new Error('Payment data not found in response');
      }
      
      console.log('✅ Setting payment and moving to step 2');
      setPayment(paymentData);
      setActiveStep(2);
    } catch (error: any) {
      console.error('❌ Create payment error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || 'Gagal membuat pembayaran';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = async () => {
    console.log('🎯 Simulate Payment clicked!');
    console.log('💰 Payment data:', payment);
    console.log('📝 Invoice number:', payment?.invoice_number);
    
    if (!payment?.invoice_number) {
      console.error('❌ No invoice number found!');
      alert('Invoice number tidak ditemukan. Silakan refresh halaman.');
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/payments/${payment.invoice_number}/simulate-success`;
      console.log('🌐 API URL:', apiUrl);
      
      // Get registration data from localStorage (saved during registration)
      const registrationDataKey = `registration_${eventId}`;
      const savedRegistrationData = localStorage.getItem(registrationDataKey);
      let registrationData = null;
      
      if (savedRegistrationData) {
        try {
          registrationData = JSON.parse(savedRegistrationData);
          console.log('📋 Found saved registration data:', registrationData);
        } catch (e) {
          console.error('Failed to parse registration data:', e);
        }
      }
      
      // Simulate payment success via API with registration data
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          registration_data: registrationData
        })
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        console.log('✅ Payment simulation successful!');
        
        // Clean up registration data from localStorage
        if (registrationDataKey) {
          localStorage.removeItem(registrationDataKey);
          console.log('🗑️ Cleaned up registration data from localStorage');
        }
        
        setShowSuccessDialog(true);
      } else {
        console.error('❌ Simulation failed:', data);
        alert(`Gagal simulasi: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Simulate payment error:', error);
      alert('Gagal simulasi pembayaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <PaymentMethodSelector
            onSelect={handlePaymentMethodSelect}
            selectedMethod={selectedMethod}
            selectedChannel={selectedChannel}
          />
        );

      case 1:
        if (!event) {
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Memuat data event...
              </Typography>
            </Box>
          );
        }

        const eventPrice = Number(event?.price) || 0;
        const adminFee = 4000;
        const totalAmount = eventPrice + adminFee;

        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Konfirmasi Pembayaran
            </Typography>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Detail Event
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {event?.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <EventIcon fontSize="small" />
                  <Typography variant="body2">
                    {new Date(event?.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
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
                      Harga Event
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {paymentService.formatCurrency(eventPrice)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Biaya Admin
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {paymentService.formatCurrency(adminFee)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                      {paymentService.formatCurrency(totalAmount)}
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
            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Pembayaran Berhasil Dibuat!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Silakan lakukan pembayaran sebelum batas waktu
            </Typography>

            <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Nomor Invoice
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#667eea' }}>
                  {payment?.invoice_number}
                </Typography>

                {payment?.doku_payment_code && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Nomor Virtual Account
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                      {payment.doku_payment_code}
                    </Typography>
                  </>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#ff9800' }}>
                  <Schedule />
                  <Typography variant="body2">
                    Berlaku hingga: {new Date(payment?.expired_at).toLocaleString('id-ID')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Cara Pembayaran:
              </Typography>
              <Typography variant="body2">
                1. Buka aplikasi mobile banking Anda<br />
                2. Pilih menu Transfer / Virtual Account<br />
                3. Masukkan nomor Virtual Account di atas<br />
                4. Masukkan jumlah yang harus dibayar<br />
                5. Konfirmasi pembayaran
              </Typography>
            </Alert>

            {/* Simulasi Button untuk Development */}
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Mode Development - Simulasi Pembayaran
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Setelah berhasil, Anda akan terdaftar di event ini.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => {
                  console.log('🔘 Button clicked! Payment:', payment);
                  simulatePaymentSuccess();
                }}
                disabled={loading || !payment?.invoice_number}
                sx={{ minWidth: 300 }}
              >
                {loading ? 'Processing...' : '✅ Simulasi Pembayaran Berhasil'}
              </Button>
            </Box>
            
            {/* Debug info */}
            {!payment?.invoice_number && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Payment data belum tersedia. Invoice Number: {payment?.invoice_number || 'NULL'}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/my-events')}
              >
                Lihat Event Saya
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate(`/payment/status/${payment?.invoice_number}`)}
                sx={{ bgcolor: '#667eea' }}
              >
                Cek Status Pembayaran
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/events/${eventId}`)}
        sx={{ mb: 3 }}
      >
        Kembali
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Pembayaran Event
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Selesaikan pembayaran untuk mengikuti event
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

        {renderStepContent()}

        {activeStep < 2 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Kembali
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || (activeStep === 0 && (!selectedMethod || !selectedChannel))}
              sx={{ bgcolor: '#667eea' }}
            >
              {loading ? <CircularProgress size={24} /> : activeStep === 1 ? 'Bayar Sekarang' : 'Lanjutkan'}
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
            ✅ Anda telah terdaftar di event <strong>{event?.title}</strong>
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Lihat event Anda di menu My Events
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/my-events');
              }}
              sx={{
                minWidth: 200,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Lihat Event Saya
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/');
              }}
              sx={{
                minWidth: 120,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Kembali ke Home
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PaymentCheckout;
