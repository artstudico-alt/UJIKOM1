import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Chip,
  Container,
  Paper,
  Fade,
  Slide,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  CheckCircle,
  HourglassEmpty,
  Visibility,
  PersonAdd,
  Login,
  TaskAlt,
  Person,
  ContactPhone,
  Info,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { eventService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  phone_country: string;
  emergency_contact: string;
  emergency_phone: string;
  emergency_phone_country: string;
  special_needs?: string;
}

const EventRegistration: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    phone: '',
    phone_country: '+62', // Default Indonesia
    emergency_contact: '',
    emergency_phone: '',
    emergency_phone_country: '+62', // Default Indonesia
    special_needs: '',
  });
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});

  // Set user data when component mounts
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user, isAuthenticated]);

  // Country codes data
  const countryCodes = [
    { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: '+66', name: 'Thailand', flag: '🇹🇭' },
    { code: '+63', name: 'Philippines', flag: '🇵🇭' },
    { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', name: 'UK', flag: '🇬🇧' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
  ];

  // Fetch event details using direct fetch for debugging
  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      console.log('🔍 EventRegistration: Fetching event ID:', eventId);
      
      // Validate event ID
      const numericId = Number(eventId);
      if (!eventId || isNaN(numericId) || numericId <= 0) {
        console.error('❌ EventRegistration: Invalid event ID:', eventId);
        throw new Error('Invalid event ID');
      }
      
      try {
        // Use fetch directly to bypass axios issues
        const url = `http://localhost:8000/api/events/${numericId}`;
        console.log('🌐 EventRegistration: Fetching from URL:', url);
        
        const fetchResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 EventRegistration: Fetch response status:', fetchResponse.status);
        console.log('📡 EventRegistration: Fetch response ok:', fetchResponse.ok);
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }
        
        const jsonData = await fetchResponse.json();
        console.log('✅ EventRegistration: JSON data:', jsonData);
        console.log('✅ EventRegistration: JSON data type:', typeof jsonData);
        console.log('✅ EventRegistration: JSON data keys:', Object.keys(jsonData));
        console.log('✅ EventRegistration: JSON data.data:', jsonData.data);
        
        // Return in the format expected by the component
        return jsonData;
        
      } catch (error: any) {
        console.error('❌ EventRegistration: Error fetching event:', error);
        console.error('❌ EventRegistration: Error message:', error.message);
        throw error;
      }
    },
    enabled: !!eventId,
    retry: false, // Don't retry on 404
  });

  // Check if registration deadline has passed
  useEffect(() => {
    if (eventData?.data?.registration_deadline) {
      const now = new Date();
      const deadlineDate = new Date(eventData.data.registration_deadline);
      // Set deadline to end of day (23:59:59)
      deadlineDate.setHours(23, 59, 59, 999);
      
      console.log('🔍 EventRegistration Deadline Check:');
      console.log('   Now:', now.toLocaleString('id-ID'));
      console.log('   Deadline:', deadlineDate.toLocaleString('id-ID'));
      console.log('   Is Passed:', now > deadlineDate);
      
      if (now > deadlineDate) {
        alert('Maaf, batas waktu pendaftaran sudah lewat.');
        navigate(`/events/${eventId}`);
      }
    }
  }, [eventData, eventId, navigate]);

  // Helper function to get correct image URL
  const getImageUrl = (flyerPath: string) => {
    if (!flyerPath) return '';
    
    console.log('📁 Original flyer path:', flyerPath);
    
    // Clean path - remove 'storage/' prefix if exists
    const cleanPath = flyerPath.startsWith('storage/') 
      ? flyerPath.substring(8) 
      : flyerPath;
    
    // Use API endpoint to serve images (better CORS handling)
    const url = `http://localhost:8000/api/storage/${cleanPath}`;
    console.log('🔗 Using API storage URL:', url);
    return url;
  };

  // Memoize the background image URL to prevent re-renders
  const backgroundImageUrl = useMemo(() => {
    console.log('🔄 useMemo triggered - Building background URL...');
    console.log('🖼️ Event Data:', eventData);
    console.log('🖼️ Flyer Path:', eventData?.data?.flyer_path);
    console.log('🖼️ Image URL:', eventData?.data?.image_url);
    
    // Wait for event data to load
    if (!eventData?.data) {
      console.log('⏳ Event data not loaded yet, using gradient fallback');
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
    }
    
    // Try multiple image fields
    const imagePath = eventData.data.flyer_path || eventData.data.image_url || eventData.data.image;
    
    if (!imagePath) {
      console.log('⚠️ No image path found, using gradient fallback');
      const fallback = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
      console.log('📐 Returning fallback:', fallback);
      return fallback;
    }
    
    const imageUrl = getImageUrl(imagePath);
    console.log('✅ Final Image URL:', imageUrl);
    const finalBg = `url("${imageUrl}"), linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`;
    console.log('🎨 Final background value:', finalBg);
    return finalBg;
  }, [eventData]);

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegistrationFormData) => 
      eventService.registerForEvent(Number(eventId), data),
    onSuccess: (response: any) => {
      // Navigate to success page with registration data
      navigate(`/events/${eventId}/register/success`, {
        state: {
          registrationData: formData,
          event: eventData?.data,
          successData: response.data
        }
      });
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
    },
  });

  const handleInputChange = (field: keyof RegistrationFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Real-time validation for email
    if (field === 'email') {
      if (value.trim() && !value.includes('@')) {
        // Show error if no @ symbol
        setErrors(prev => ({ ...prev, email: 'Email harus mengandung karakter @' }));
      } else if (value.trim() && value.includes('@')) {
        // Clear @ error if @ symbol exists, but check full format
        if (!/\S+@\S+\.\S+/.test(value)) {
          setErrors(prev => ({ ...prev, email: 'Format email tidak valid' }));
        } else {
          // Clear all email errors if format is valid
          setErrors(prev => ({ ...prev, email: undefined }));
        }
      } else {
        // Clear error if field is empty
        setErrors(prev => ({ ...prev, email: undefined }));
      }
    } else {
      // Clear error when user starts typing for other fields
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined,
        }));
      }
    }
  };

  const handleSelectChange = (field: keyof RegistrationFormData) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Nama lengkap harus diisi';
    if (!formData.email.trim()) newErrors.email = 'Email harus diisi';
    else if (!formData.email.includes('@')) newErrors.email = 'Email harus mengandung karakter @';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon harus diisi';
    if (!formData.emergency_contact.trim()) newErrors.emergency_contact = 'Kontak darurat harus diisi';
    if (!formData.emergency_phone.trim()) newErrors.emergency_phone = 'Nomor telepon darurat harus diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare registration data
    const registrationData = {
      name: formData.name,
      email: formData.email,
      phone: `${formData.phone_country}${formData.phone}`,
      emergency_contact: formData.emergency_contact,
      emergency_phone: `${formData.emergency_phone_country}${formData.emergency_phone}`,
      special_needs: formData.special_needs || null,
    };
    
    // Check if event is paid
    const eventPrice = eventData?.data?.price || 0;
    console.log('💰 Event price:', eventPrice);
    
    if (eventPrice > 0) {
      // PAID EVENT: Save registration data and redirect to payment
      console.log('💳 Paid event - saving data and redirecting to payment');
      localStorage.setItem(`registration_${eventId}`, JSON.stringify(registrationData));
      navigate(`/payment/checkout/${eventId}`);
    } else {
      // FREE EVENT: Register directly
      console.log('✅ Free event - registering directly');
      registerMutation.mutate(registrationData as any);
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, dd MMMM yyyy', { locale: id });
    } catch {
      return dateString;
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('🔐 Auth check:', { isAuthenticated, user });
    if (!isAuthenticated) {
      console.log('⚠️ Not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, navigate, user]);

  if (eventLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Debug: Log the exact structure
  console.log('🔍 EventRegistration: Full eventData structure:', eventData);
  console.log('🔍 EventRegistration: eventData.data:', eventData?.data);
  console.log('🔍 EventRegistration: eventError:', eventError);
  console.log('🔍 EventRegistration: eventId from params:', eventId);
  console.log('🔍 EventRegistration: eventLoading:', eventLoading);

  if (eventError || !eventData) {
    console.error('❌ EventRegistration: Error state:', {
      eventError,
      eventData,
      hasEventData: !!eventData,
      hasData: !!eventData?.data,
      eventDataKeys: eventData ? Object.keys(eventData) : 'null',
      eventId,
      errorMessage: eventError?.message
    });
    
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event tidak ditemukan
            </Typography>
            <Typography variant="body2">
              {eventError?.message || 'Event yang Anda cari tidak tersedia atau telah dihapus.'}
            </Typography>
            {eventId && (
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
                Event ID: {eventId}
              </Typography>
            )}
            {eventError && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                Error: {eventError.message}
              </Typography>
            )}
            {eventData && !eventData.data && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'warning.main' }}>
                Debug: Response received but data structure unexpected
              </Typography>
            )}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/events')}
            sx={{ mt: 2 }}
          >
            Kembali ke Daftar Event
          </Button>
        </Paper>
      </Container>
    );
  }

  const event = eventData.data;



  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        position: 'relative'
      }}
    >
      <Fade in timeout={800}>
        <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
          {/* Left Section - Full Event Image */}
          <Box 
            sx={{ 
              flex: '0 0 50%', 
              display: 'flex',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {/* Image Section */}
              <Box
                sx={{
                  flex: 1,
                  backgroundImage: backgroundImageUrl,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 4,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.4) 100%)',
                  backdropFilter: 'blur(0.5px)',
                },
                // Floating decorative elements
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '15%',
                  right: '10%',
                  width: '120px',
                  height: '120px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%',
                  animation: 'float 8s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px) scale(1)' },
                    '50%': { transform: 'translateY(-30px) scale(1.1)' }
                  }
                }
              }}
            >
        {/* Logo/Header */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 2
          }}>
            <Box sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.8))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(255,255,255,0.3)'
            }}>
              <Typography sx={{ fontSize: '1.5rem' }}>🎯</Typography>
            </Box>
            <img 
              src="/images/logoGOMOMENT.png" 
              alt="GOMOMENT"
              style={{
                height: '40px',
                width: 'auto',
                filter: 'brightness(0) invert(1)', // Make logo white
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontWeight: 500,
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}>
            Platform Event Terpercaya
          </Typography>
        </Box>

              </Box>
              
              {/* Event Info Caption - Back to image section */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.98) 100%)',
                color: '#1e293b',
                p: 4,
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #9c27b0 0%, #7c3aed 100%)',
                  opacity: 0.6
                }
              }}>
                {/* Status Badge */}
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 3,
                  background: 'rgba(34, 197, 94, 0.1)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#22c55e',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.6 }
                    }
                  }} />
                  <Typography variant="body2" sx={{ 
                    color: '#16a34a', 
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>
                    Event Aktif
                  </Typography>
                </Box>
                
                {/* Event Title */}
                <Typography variant="h3" sx={{
                  fontWeight: 800,
                  mb: 3,
                  color: '#0f172a',
                  lineHeight: 1.2,
                  fontSize: { xs: '1.6rem', md: '2rem' }
                }}>
                  {event?.title}
                </Typography>
                
                {/* Event Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Date */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    background: 'rgba(255,255,255,0.6)',
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
                    }}>
                      <Typography sx={{ fontSize: '1.1rem' }}>📅</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ 
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: '0.7rem',
                        fontWeight: 500
                      }}>
                        Tanggal Event
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#1e293b'
                      }}>
                        {formatEventDate(event?.date || '')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Location */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    background: 'rgba(255,255,255,0.6)',
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #9c27b0, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(156, 39, 176, 0.2)'
                    }}>
                      <Typography sx={{ fontSize: '1.1rem' }}>📍</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ 
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: '0.7rem',
                        fontWeight: 500
                      }}>
                        Lokasi Event
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        color: '#1e293b'
                      }}>
                        {event?.location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
            </Box>
          </Box>

          {/* Right Section - Registration Form */}
          <Box
            sx={{
              flex: '0 0 50%',
              width: '50%',
              minHeight: '100vh',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `
                  radial-gradient(circle at 20% 20%, rgba(156, 39, 176, 0.05) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)
                `,
                zIndex: 0,
              }
            }}
          >
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2, py: 4, px: 3, height: '100%', width: '100%' }}>
              {/* Mobile Event Info */}
              <Box sx={{ display: 'none', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" mb={2}>
                  {event?.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={1}>
                  {formatEventDate(event?.date || '')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {event?.location}
                </Typography>
              </Box>

              {/* Conditional Content Based on Authentication */}
              {isAuthenticated ? (
                <>
                  {/* Form Header - Authenticated Users */}
                  <Card elevation={0} sx={{ mb: 4, p: 3, background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05), rgba(33, 150, 243, 0.05))', border: '1px solid rgba(156, 39, 176, 0.1)' }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 800, 
                      background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}>
                      🎯 Daftar Event
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={2}>
                      Lengkapi form di bawah ini untuk mendaftar event
                    </Typography>
                    
                    {/* Event Info - Dynamic Based on Price */}
                    {eventData?.data?.price && eventData.data.price > 0 ? (
                      <Chip 
                        label={`💳 Event Berbayar - Rp ${eventData.data.price.toLocaleString('id-ID')}`}
                        sx={{ 
                          background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}
                      />
                    ) : (
                      <Chip 
                        label="✨ Event Gratis - Tanpa Biaya Pendaftaran" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}
                      />
                    )}
                  </Card>

                  {/* Registration Form */}
                  <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
                {/* Personal Information */}
                <Card elevation={0} sx={{ mb: 4, p: 3, border: '1px solid rgba(156, 39, 176, 0.1)', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Person sx={{ 
                fontSize: '1.5rem',
                color: '#9c27b0'
              }} />
              <Typography variant="h6" fontWeight="700" color="text.primary">
                Informasi Pribadi
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Nama Lengkap *"
              name="name"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Negara</InputLabel>
                <Select
                  value={formData.phone_country}
                  onChange={handleSelectChange('phone_country')}
                  label="Negara"
                >
                  {countryCodes.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Nomor Telepon *"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone}
                required
                placeholder="8123456789"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.phone_country}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email || "Email diambil dari akun Anda yang sedang login"}
              required
              disabled
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                },
              }}
            />

          </Card>

          {/* Emergency Contact */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <ContactPhone sx={{ 
                fontSize: '1.5rem',
                color: '#9c27b0'
              }} />
              <Typography variant="h6" fontWeight="600" color="text.primary">
                Kontak Darurat
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="Nama Kontak Darurat *"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleInputChange('emergency_contact')}
              error={!!errors.emergency_contact}
              helperText={errors.emergency_contact}
              required
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Negara</InputLabel>
                <Select
                  value={formData.emergency_phone_country}
                  onChange={handleSelectChange('emergency_phone_country')}
                  label="Negara"
                >
                  {countryCodes.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Nomor Telepon Darurat *"
                name="emergency_phone"
                value={formData.emergency_phone}
                onChange={handleInputChange('emergency_phone')}
                error={!!errors.emergency_phone}
                helperText={errors.emergency_phone}
                required
                placeholder="8123456789"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.emergency_phone_country}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Additional Information */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Info sx={{ 
                fontSize: '1.5rem',
                color: '#9c27b0'
              }} />
              <Typography variant="h6" fontWeight="600" color="text.primary">
                Informasi Tambahan (Opsional)
              </Typography>
            </Box>
            

            <TextField
              fullWidth
              label="Kebutuhan Khusus"
              name="special_needs"
              value={formData.special_needs}
              onChange={handleInputChange('special_needs')}
              multiline
              rows={2}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Error Alert */}
          {registerMutation.error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {registerMutation.error.response?.data?.message || 'Terjadi kesalahan saat mendaftar'}
            </Alert>
          )}


          {/* Payment Info for Paid Events */}
          {eventData?.data?.price && eventData.data.price > 0 && (
            <Alert 
              severity="info" 
              icon={<Info />}
              sx={{ 
                mb: 3,
                borderRadius: 2,
                border: '2px solid #2196f3',
                bgcolor: '#e3f2fd',
                '& .MuiAlert-icon': {
                  color: '#2196f3'
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                💳 Event Berbayar - Rp {eventData.data.price.toLocaleString('id-ID')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                * Klik "Daftar Event Sekarang" untuk menyelesaikan pembayaran event
              </Typography>
            </Alert>
          )}

          {/* Submit Button */}
          <Card elevation={0} sx={{ p: 3, background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05), rgba(33, 150, 243, 0.05))', border: '1px solid rgba(156, 39, 176, 0.1)', borderRadius: 3 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={registerMutation.isPending}
              sx={{
                py: 2.5,
                fontSize: '1.2rem',
                fontWeight: 800,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7b1fa2, #1976d2)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(156, 39, 176, 0.4)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #ccc, #999)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {registerMutation.isPending ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                  🔄 Mendaftar Event...
                </>
              ) : (
                '🎯 Daftar Event Sekarang'
              )}
            </Button>
            
            <Typography variant="caption" sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 2, 
              color: '#666',
              fontStyle: 'italic'
            }}>
              {eventData?.data?.price && eventData.data.price > 0 
                ? `💳 Rp ${eventData.data.price.toLocaleString('id-ID')} • Sertifikat Resmi`
                : '✨ Gratis • Tanpa Biaya • Sertifikat Resmi'
              }
            </Typography>
          </Card>

              </Box>
                </>
              ) : (
                /* Public View - Not Authenticated */
                <Card elevation={0} sx={{ mb: 4, p: 4, background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))', border: '2px solid rgba(255, 193, 7, 0.3)', borderRadius: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔒</Typography>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 800, 
                      background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}>
                      Login Diperlukan
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                      Untuk mendaftar event ini, Anda perlu login terlebih dahulu ke akun GOMOMENT Anda.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{
                          background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                          color: 'white',
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7b1fa2, #1976d2)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)'
                          }
                        }}
                      >
                        🔑 Login Sekarang
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/register')}
                        sx={{
                          borderColor: '#9c27b0',
                          color: '#9c27b0',
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          '&:hover': {
                            borderColor: '#7b1fa2',
                            color: '#7b1fa2',
                            background: 'rgba(156, 39, 176, 0.05)'
                          }
                        }}
                      >
                        📝 Daftar Akun Baru
                      </Button>
                    </Box>
                    
                    <Typography variant="caption" sx={{ 
                      display: 'block', 
                      mt: 3, 
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      💡 Dengan akun GOMOMENT, Anda bisa mendaftar semua event gratis dan mendapatkan sertifikat resmi
                    </Typography>
                  </Box>
                </Card>
              )}

              {/* Back to Events Link - Always Show */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/events')}
                  sx={{ color: 'text.secondary' }}
                >
                  ← Kembali ke Daftar Event
                </Button>
              </Box>
            </Container>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default EventRegistration;