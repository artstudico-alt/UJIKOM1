import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Checkbox,
  FormGroup,
} from '@mui/material';
import {
  Save,
  Cancel,
  Event as EventIcon,
  School as CertificateIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Person as OrganizerIcon,
  Category as CategoryIcon,
  MonetizationOn as PriceIcon,
  Map as MapIcon,
  MyLocation as MyLocationIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Wallet as WalletIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { EventFormData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

// Dynamic schema based on user role
const createSchema = (isOrganizer: boolean) => {
  // Calculate minimum date (H-3) - only for organizers
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateString = minDate.toISOString().split('T')[0];

  const baseSchema: any = {
    title: yup.string().required('Judul event wajib diisi'),
    description: yup.string().required('Deskripsi event wajib diisi'),
    date: isOrganizer 
      ? yup.string()
          .required('Tanggal event wajib diisi')
          .test('min-date', `Tanggal event minimal H-3 dari hari ini (${minDateString})`, function(value) {
            if (!value) return false;
            const eventDate = new Date(value);
            const today = new Date();
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 3;
          })
      : yup.string().required('Tanggal event wajib diisi'), // Admin can set any date
    start_time: yup.string().required('Waktu mulai wajib diisi'),
    end_time: yup.string()
      .required('Waktu selesai wajib diisi')
      .test('is-after-start', 'Waktu selesai harus setelah waktu mulai', function(value) {
        const { start_time } = this.parent;
        if (!start_time || !value) return true;
        return value > start_time;
      }),
    location: yup.string().required('Lokasi event wajib diisi'),
    max_participants: yup.number().min(1, 'Minimal 1 peserta').required('Maksimal peserta wajib diisi'),
    registration_deadline: yup.string()
      .required('Deadline pendaftaran wajib diisi')
      .test('before-event', 'Deadline pendaftaran harus sebelum tanggal event', function(value) {
        const { date } = this.parent;
        if (!date || !value) return true;
        return new Date(value) < new Date(date);
      }),
    registration_date: yup.string().optional(), // Optional - will be auto-filled from registration_deadline or date
    price: yup.number().min(0, 'Harga tidak boleh negatif').optional(),
    event_type: yup.string().required('Tipe event wajib dipilih'),
    category: yup.string().required('Kategori event wajib dipilih'),
    // Organizer fields - required for both admin and EO
    organizer_name: yup.string().required('Nama penyelenggara wajib diisi'),
    organizer_email: yup.string().email('Format email tidak valid').required('Email penyelenggara wajib diisi'),
    organizer_contact: yup.string().required('Kontak penyelenggara wajib diisi'),
  };

  return yup.object().shape(baseSchema);
};

interface EventFormProps {
  isCreate?: boolean;
  isEdit?: boolean;
  isOrganizer?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ isCreate = false, isEdit = false, isOrganizer = false }) => {
  const navigate = useNavigate();
  // Support both 'id' and 'eventId' route parameters
  const { id, eventId: paramEventId } = useParams<{ id?: string; eventId?: string }>();
  const eventId = id || paramEventId; // Use whichever is present
  const { user } = useAuth();
  
  console.log('🔍 EventForm Params Debug:', { id, paramEventId, finalEventId: eventId, isEdit, isOrganizer });
  
  // Auto-detect edit mode if eventId exists in URL
  const isEditMode = isEdit || (!isCreate && !!eventId);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [certificateEnabled, setCertificateEnabled] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  
  // Payment settings state
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [bankAccountInfo, setBankAccountInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });
  const [paymentInstructions, setPaymentInstructions] = useState('');

  // Create schema based on user role
  const schema = createSchema(isOrganizer);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit', // Only validate on submit, not on change
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      max_participants: 50,
      registration_deadline: '',
      registration_date: '',
      price: 0,
      // Common fields for both admin and EO
      event_type: 'workshop',
      category: '',
      flyer: undefined,
      // Organizer fields - default to user info for both admin and EO
      organizer_name: user?.name || '',
      organizer_email: user?.email || '',
      organizer_contact: user?.phone || '',
      // Set status based on role
      status: isOrganizer ? 'pending_approval' : 'published',
      created_by_role: isOrganizer ? 'event_organizer' : 'admin',
    } as any,
  });

  // Watch price field and auto-sync isPaidEvent switch
  const priceValue = watch('price');
  useEffect(() => {
    const price = Number(priceValue) || 0;
    if (price > 0 && !isPaidEvent) {
      console.log('💰 Auto-enabling paid event mode, price:', price);
      setIsPaidEvent(true);
    } else if (price === 0 && isPaidEvent) {
      console.log('💰 Auto-disabling paid event mode, price is 0');
      setIsPaidEvent(false);
    }
  }, [priceValue]);

  // Load event data when in edit mode
  useEffect(() => {
    const loadEventData = async () => {
      console.log('🔄 EventForm: loadEventData triggered', { isEditMode, eventId, isOrganizer });
      
      if (!isEditMode || !eventId) {
        console.log('⏭️ EventForm: Skipping load - not edit mode or no eventId');
        setLoadingData(false);
        return;
      }

      try {
        console.log('📥 EventForm: Starting to load event data for ID:', eventId);
        setLoadingData(true);
        setError(null);

        let eventData;
        
        if (isOrganizer) {
          console.log('🔵 EventForm: Loading via organizerApiService');
          const { organizerApiService } = await import('../../services/organizerApiService');
          const response = await organizerApiService.getEventById(eventId);
          eventData = response.data;
        } else {
          console.log('🔵 EventForm: Loading via adminApiService');
          const { adminApiService } = await import('../../services/adminApiService');
          const response = await adminApiService.getEventById(eventId);
          eventData = response.data;
        }

        console.log('✅ EventForm: Event data loaded successfully:', eventData);

        if (eventData) {
          // Pre-fill form with existing data
          console.log('📝 EventForm: Populating form with event data:', {
            title: eventData.title,
            date: eventData.date,
            start_time: eventData.start_time,
            end_time: eventData.end_time,
            location: eventData.location,
            max_participants: eventData.max_participants,
            price: eventData.price
          });
          
          const formData = {
            title: eventData.title || '',
            description: eventData.description || '',
            date: eventData.date || '',
            start_time: eventData.start_time || '',
            end_time: eventData.end_time || '',
            location: eventData.location || '',
            max_participants: eventData.max_participants || 50,
            registration_deadline: eventData.registration_deadline || '',
            registration_date: eventData.registration_date || '',
            price: eventData.price || 0,
            event_type: eventData.event_type || 'workshop',
            category: eventData.category || '',
            organizer_name: eventData.organizer_name || '',
            organizer_email: eventData.organizer_email || '',
            organizer_contact: eventData.organizer_contact || '',
          };
          
          console.log('📋 EventForm: Form data to populate:', formData);
          reset(formData);
          console.log('✅ EventForm: Form reset() called with data');

          // Set payment settings if event is paid
          if (eventData.price && eventData.price > 0) {
            setIsPaidEvent(true);
            console.log('💳 EventForm: Paid event detected, price:', eventData.price);
            
            // Load payment methods if available
            if (eventData.payment_methods) {
              try {
                const methods = Array.isArray(eventData.payment_methods) 
                  ? eventData.payment_methods 
                  : typeof eventData.payment_methods === 'string'
                    ? JSON.parse(eventData.payment_methods)
                    : [];
                setPaymentMethods(methods);
                console.log('💳 EventForm: Payment methods loaded:', methods);
              } catch (err) {
                console.error('Error parsing payment_methods:', err);
                setPaymentMethods([]);
              }
            }
            
            // Load bank account info if available
            if (eventData.bank_account_info) {
              try {
                const bankInfo = typeof eventData.bank_account_info === 'string'
                  ? JSON.parse(eventData.bank_account_info)
                  : eventData.bank_account_info;
                setBankAccountInfo(bankInfo || { bankName: '', accountNumber: '', accountHolder: '' });
                console.log('🏦 EventForm: Bank account info loaded');
              } catch (err) {
                console.error('Error parsing bank_account_info:', err);
                setBankAccountInfo({ bankName: '', accountNumber: '', accountHolder: '' });
              }
            }
            
            // Load payment instructions if available
            if (eventData.payment_instructions) {
              setPaymentInstructions(eventData.payment_instructions);
              console.log('📝 EventForm: Payment instructions loaded');
            }
          }

          // Set certificate enabled state
          if (eventData.has_certificate || eventData.certificate_required) {
            setCertificateEnabled(true);
            console.log('📜 EventForm: Certificate enabled');
          }

          // Set location if exists
          if (eventData.location) {
            setSelectedLocation({
              lat: eventData.latitude || 0,
              lng: eventData.longitude || 0,
              address: eventData.location
            });
            console.log('📍 EventForm: Location set:', eventData.location);
          }
        } else {
          console.warn('⚠️ EventForm: No event data received');
        }
      } catch (err: any) {
        console.error('Error loading event data:', err);
        setError(err.response?.data?.message || 'Gagal memuat data event');
      } finally {
        setLoadingData(false);
      }
    };

    loadEventData();
  }, [isEditMode, eventId, isOrganizer, reset]);

  const handleSave = async (data: EventFormData) => {
    console.log('🚀 handleSave called with data:', data);
    console.log('🔍 isEditMode:', isEditMode);
    console.log('🔍 isOrganizer:', isOrganizer);
    console.log('🔍 eventId:', eventId);
    console.log('🔍 Form errors:', errors);
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('✅ Starting save process...');

      // If edit mode, update event
      if (isEditMode && eventId) {
        // Auto-detect paid event from price value
        const eventPrice = data.price || 0;
        const isEventPaid = eventPrice > 0;
        
        console.log('💰 Price Info:', { eventPrice, isEventPaid, isPaidEventState: isPaidEvent });
        
        const eventData: any = {
          title: data.title,
          description: data.description,
          date: data.date,
          start_time: data.start_time || '',
          end_time: data.end_time || '',
          location: data.location,
          max_participants: data.max_participants,
          registration_deadline: data.registration_deadline || '',
          registration_date: data.registration_date || data.registration_deadline || data.date,
          price: eventPrice, // Use actual price value, not conditional
          organizer_name: data.organizer_name || '',
          organizer_email: data.organizer_email || '',
          organizer_contact: data.organizer_contact || '',
          event_type: data.event_type || 'workshop',
          category: data.category || '',
          // Payment settings - only save if event is paid
          payment_methods: isEventPaid ? JSON.stringify(paymentMethods) : null,
          bank_account_info: isEventPaid && paymentMethods.includes('bank_transfer') ? JSON.stringify(bankAccountInfo) : null,
          payment_instructions: isEventPaid ? paymentInstructions : null,
        };

        if (isOrganizer) {
          const { organizerApiService } = await import('../../services/organizerApiService');
          const response = await organizerApiService.updateEvent(eventId, eventData);
          
          if (response.status === 'success') {
            navigate('/organizer/events', { 
              state: { 
                message: 'Event berhasil diperbarui',
                refresh: true 
              }
            });
            return;
          }
        } else {
          const { adminApiService } = await import('../../services/adminApiService');
          const response = await adminApiService.updateEvent(eventId, eventData);
          
          if (response.status === 'success') {
            navigate('/admin/events', { 
              state: { 
                message: 'Event berhasil diperbarui',
                refresh: true 
              }
            });
            return;
          }
        }
      }
      
      if (isOrganizer) {
        // Use organizer API service
        const { organizerApiService } = await import('../../services/organizerApiService');
        
        // Create event object for API
        const eventData: any = {
          title: data.title,
          description: data.description,
          date: data.date,
          start_time: data.start_time || '',
          end_time: data.end_time || '',
          location: data.location,
          max_participants: data.max_participants,
          registration_deadline: data.registration_deadline || '',
          registration_date: data.registration_date || data.registration_deadline || data.date,
          price: data.price || 0,
          organizer_name: data.organizer_name || '',
          organizer_email: data.organizer_email || '',
          organizer_contact: data.organizer_contact || '',
          category: data.category || ''
        };
        
        // Add file if exists
        if (data.flyer) {
          eventData.flyer = data.flyer;
        }
        
        console.log('Event data to send:', eventData);
        
        const response = await organizerApiService.createEvent(eventData);
        console.log('Create event response:', response);
        
        if (response.status === 'success') {
          console.log('✅ Event created successfully:', response.data);
          
          // Multiple strategies to ensure auto-refresh
          try {
            // 1. Clear any cached data
            localStorage.removeItem('cached_events');
            
            // 2. Set refresh flag in localStorage for immediate pickup
            localStorage.setItem('force_refresh_events', JSON.stringify({
              timestamp: Date.now(),
              newEventId: response.data?.id,
              message: 'Event berhasil dibuat dan menunggu persetujuan admin'
            }));
            
            // 3. Navigate with state AND query param for double assurance
            const refreshParam = `?refresh=${Date.now()}`;
            navigate(`/organizer/events${refreshParam}`, { 
              state: { 
                refresh: true, 
                newEventId: response.data?.id,
                message: 'Event berhasil dibuat dan menunggu persetujuan admin',
                timestamp: Date.now()
              },
              replace: true // Replace current history entry
            });
            
            console.log('✅ Navigation triggered with auto-refresh');
            
            // Dispatch custom event to notify dashboard
            window.dispatchEvent(new CustomEvent('eventCreated', {
              detail: { eventId: response.data?.id }
            }));
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback: force page reload
            window.location.href = '/organizer/events?refresh=true';
          }
        } else {
          console.error('❌ Event creation failed:', response);
          throw new Error(response.message || 'Failed to create event');
        }
      } else {
        // Admin event creation logic
        console.log('📝 Admin path - importing adminApiService...');
        const { adminApiService } = await import('../../services/adminApiService');
        console.log('✅ adminApiService imported');
        
        // Auto-detect paid event from price value
        const eventPrice = data.price || 0;
        const isEventPaid = eventPrice > 0;
        
        console.log('💰 Admin Price Info:', { eventPrice, isEventPaid, isPaidEventState: isPaidEvent });
        
        // Create event object for API
        const eventData: any = {
          title: data.title,
          description: data.description,
          date: data.date,
          start_time: data.start_time || '',
          end_time: data.end_time || '',
          location: data.location,
          max_participants: data.max_participants,
          registration_deadline: data.registration_deadline || '',
          registration_date: data.registration_date || data.registration_deadline || data.date,
          price: eventPrice, // Use actual price value, not conditional
          organizer_name: data.organizer_name || '',
          organizer_email: data.organizer_email || '',
          organizer_contact: data.organizer_contact || '',
          event_type: data.event_type || 'workshop',
          category: data.category || '',
          // Payment settings - only save if event is paid
          payment_methods: isEventPaid ? JSON.stringify(paymentMethods) : null,
          bank_account_info: isEventPaid && paymentMethods.includes('bank_transfer') ? JSON.stringify(bankAccountInfo) : null,
          payment_instructions: isEventPaid ? paymentInstructions : null,
          status: 'published', // Admin events are published immediately
          organizer_type: 'admin'
        };
        
        // Add file if exists
        if (data.flyer) {
          eventData.flyer = data.flyer;
          console.log('📎 Flyer file attached:', data.flyer.name);
        }
        
        console.log('📤 Admin event data to send:', eventData);
        console.log('🌐 Calling adminApiService.createEvent...');
        
        const response = await adminApiService.createEvent(eventData);
        console.log('📥 Create admin event response:', response);
        
        if (response.status === 'success') {
          console.log('✅ Admin event created successfully:', response.data);
          
          // Clear cached data
          localStorage.removeItem('cached_events');
          localStorage.setItem('force_refresh_events', JSON.stringify({
            timestamp: Date.now(),
            newEventId: response.data?.id,
            message: 'Event berhasil dibuat dan langsung dipublikasikan'
          }));
          
          // Navigate back to admin events
          const refreshParam = `?refresh=${Date.now()}`;
          navigate(`/admin/events${refreshParam}`, { 
            state: { 
              refresh: true, 
              newEventId: response.data?.id,
              message: 'Event berhasil dibuat dan langsung dipublikasikan',
              timestamp: Date.now()
            },
            replace: true
          });
          
          console.log('✅ Admin navigation triggered with auto-refresh');
          
          // Dispatch custom event
          window.dispatchEvent(new CustomEvent('eventCreated', {
            detail: { eventId: response.data?.id }
          }));
        } else {
          console.error('❌ Admin event creation failed:', response);
          throw new Error(response.message || 'Failed to create event');
        }
      }
    } catch (err: any) {
      console.error('❌ Error saving event:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || err.message || 'Gagal menyimpan event. Silakan coba lagi.';
      setError(errorMessage);
      
      // Show alert for better visibility
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(isOrganizer ? '/organizer/events' : '/admin/events');
  };

  // Location picker functions
  const handleLocationSelect = useCallback((location: {lat: number, lng: number, address: string}) => {
    setSelectedLocation(location);
    setValue('location', location.address);
    setMapDialogOpen(false);
  }, [setValue]);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation tidak didukung oleh browser Anda');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocoding using Nominatim (OpenStreetMap)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.display_name) {
              // Format address from components
              const address = data.address;
              let formattedAddress = '';

              if (address.road) formattedAddress += address.road;
              if (address.suburb) formattedAddress += (formattedAddress ? ', ' : '') + address.suburb;
              if (address.city || address.city_district) {
                formattedAddress += (formattedAddress ? ', ' : '') + (address.city || address.city_district);
              }
              if (address.state) formattedAddress += (formattedAddress ? ', ' : '') + address.state;
              if (address.country) formattedAddress += (formattedAddress ? ', ' : '') + address.country;

              const finalAddress = formattedAddress || data.display_name;
              
              // Update location
              setSelectedLocation({ lat: latitude, lng: longitude, address: finalAddress });
              setValue('location', finalAddress);
            } else {
              throw new Error('Tidak dapat menemukan alamat dari lokasi Anda');
            }
          } catch (err: any) {
            setError('Gagal mendapatkan alamat dari koordinat');
          } finally {
            setDetectingLocation(false);
          }
        },
        (error) => {
          setDetectingLocation(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError('Akses lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.');
              break;
            case error.POSITION_UNAVAILABLE:
              setError('Informasi lokasi tidak tersedia.');
              break;
            case error.TIMEOUT:
              setError('Permintaan lokasi timeout.');
              break;
            default:
              setError('Terjadi kesalahan saat mendapatkan lokasi.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (err: any) {
      setDetectingLocation(false);
      setError(err.message || 'Gagal mendeteksi lokasi');
    }
  };

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect({ 
            lat: latitude, 
            lng: longitude, 
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Tidak dapat mengakses lokasi. Pastikan izin lokasi telah diberikan.');
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser ini.');
    }
  }, [handleLocationSelect]);

  // Simple map component
  const MapPicker = () => (
    <Box sx={{ height: 400, width: '100%', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '2px dashed #ddd', borderRadius: 2 }}>
      <MapIcon sx={{ fontSize: 64, color: '#999', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Peta Interaktif
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Klik pada peta untuk memilih lokasi event
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<MyLocationIcon />}
          onClick={getCurrentLocation}
          sx={{ bgcolor: '#4f46e5' }}
        >
          Gunakan Lokasi Saat Ini
        </Button>
        <Button 
          variant="outlined"
          onClick={() => {
            handleLocationSelect({
              lat: -6.2088,
              lng: 106.8456,
              address: 'Jakarta Pusat, DKI Jakarta, Indonesia'
            });
          }}
        >
          Pilih Jakarta Pusat
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
        * Integrasi peta penuh akan tersedia setelah konfigurasi API key
      </Typography>
    </Box>
  );

  // Show loading while fetching data
  if (loadingData) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#4f46e5', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Memuat data event...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#f8fafc', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: '#4f46e5', 
              width: 48, 
              height: 48,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}>
              <EventIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
                color: '#1e293b',
                background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {isCreate ? '📅 Tambah Event Baru' : '✏️ Edit Event'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isCreate ? 'Buat event baru untuk ditampilkan di platform GOMOMENT' : 'Edit informasi event yang sudah ada'}
              </Typography>
            </Box>
          </Box>
          
          {/* Status Chips */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Chip 
              label={isCreate ? "Mode: Tambah Baru" : "Mode: Edit"} 
              color="primary" 
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={certificateEnabled ? "🎓 Certificate: Aktif" : "🎓 Certificate: Nonaktif"} 
              color={certificateEnabled ? "success" : "default"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={isPaidEvent ? `💰 Berbayar: Rp ${control._formValues.price || 0}` : "✅ Gratis"} 
              color={isPaidEvent ? "warning" : "success"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={0} sx={{ 
          p: 4, 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.1)'
        }}>
          <form onSubmit={handleSubmit(handleSave as any)} noValidate>
            {/* Basic Information Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(79, 70, 229, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#4f46e5' }}>
                      📝 Informasi Event
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Masukkan informasi lengkap tentang event
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'grid', gap: 3 }}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Judul Event"
                        placeholder="Masukkan judul event yang menarik"
                        error={!!errors.title}
                        helperText={errors.title?.message as string}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4f46e5',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Deskripsi Event"
                        placeholder="Jelaskan detail event, agenda, dan informasi penting lainnya"
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message as string}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#4f46e5',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />

                  {/* Event Type and Category - Show for both Admin and EO */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Controller
                      name="event_type"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.event_type}>
                          <InputLabel>Tipe Event</InputLabel>
                          <Select
                            {...field}
                            label="Tipe Event"
                            sx={{
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#4f46e5',
                                }
                              }
                            }}
                          >
                            <MenuItem value="workshop">🛠️ Workshop</MenuItem>
                            <MenuItem value="seminar">🎤 Seminar</MenuItem>
                            <MenuItem value="conference">🏢 Conference</MenuItem>
                            <MenuItem value="webinar">💻 Webinar</MenuItem>
                            <MenuItem value="training">📚 Training</MenuItem>
                            <MenuItem value="other">🎯 Lainnya</MenuItem>
                          </Select>
                          {errors.event_type?.message && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                              {String(errors.event_type.message)}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />

                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Kategori Event"
                          placeholder="Teknologi, Bisnis, Pendidikan, dll"
                          error={!!errors.category}
                          helperText={errors.category?.message as string}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#4f46e5',
                                    }
                                  }
                                }
                              }}
                            />
                          )}
                        />
                      </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Payment Settings Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)', bgcolor: 'rgba(16, 185, 129, 0.02)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
                    <PaymentIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#10b981' }}>
                      💳 Pengaturan Pembayaran
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Atur harga tiket dan metode pembayaran untuk event
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isPaidEvent}
                        onChange={(e) => {
                          setIsPaidEvent(e.target.checked);
                          if (!e.target.checked) {
                            setValue('price', 0);
                            setPaymentMethods([]);
                            setBankAccountInfo({ bankName: '', accountNumber: '', accountHolder: '' });
                            setPaymentInstructions('');
                          }
                        }}
                        color="success"
                      />
                    }
                    label={isPaidEvent ? "Event Berbayar" : "Event Gratis"}
                  />
                </Box>

                {isPaidEvent && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Price Field */}
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Harga Tiket (IDR) *"
                          type="number"
                          placeholder="Masukkan harga tiket"
                          error={!!errors.price}
                          helperText={errors.price?.message as string}
                          inputProps={{
                            min: 0,
                            step: 1000
                          }}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>Rp</Typography>
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#10b981',
                                }
                              }
                            }
                          }}
                        />
                      )}
                    />

                    {/* Payment Methods */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: '#10b981' }}>
                        💳 Metode Pembayaran yang Diterima
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={paymentMethods.includes('bank_transfer')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPaymentMethods([...paymentMethods, 'bank_transfer']);
                                } else {
                                  setPaymentMethods(paymentMethods.filter(m => m !== 'bank_transfer'));
                                }
                              }}
                              color="success"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BankIcon sx={{ fontSize: 20, color: '#10b981' }} />
                              <Typography variant="body2">Transfer Bank</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={paymentMethods.includes('e_wallet')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPaymentMethods([...paymentMethods, 'e_wallet']);
                                } else {
                                  setPaymentMethods(paymentMethods.filter(m => m !== 'e_wallet'));
                                }
                              }}
                              color="success"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WalletIcon sx={{ fontSize: 20, color: '#10b981' }} />
                              <Typography variant="body2">E-Wallet (OVO, GoPay, DANA, dll)</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={paymentMethods.includes('credit_card')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPaymentMethods([...paymentMethods, 'credit_card']);
                                } else {
                                  setPaymentMethods(paymentMethods.filter(m => m !== 'credit_card'));
                                }
                              }}
                              color="success"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CardIcon sx={{ fontSize: 20, color: '#10b981' }} />
                              <Typography variant="body2">Kartu Kredit/Debit</Typography>
                            </Box>
                          }
                        />
                      </FormGroup>
                    </Box>

                    {/* Bank Account Info (if bank transfer selected) */}
                    {paymentMethods.includes('bank_transfer') && (
                      <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 2, border: '1px dashed #10b981' }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, color: '#10b981' }}>
                          🏦 Informasi Rekening Bank
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Nama Bank"
                            placeholder="BCA, Mandiri, BNI, dll"
                            value={bankAccountInfo.bankName}
                            onChange={(e) => setBankAccountInfo({ ...bankAccountInfo, bankName: e.target.value })}
                            sx={{ bgcolor: 'white', flex: 1 }}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            label="Nomor Rekening"
                            placeholder="1234567890"
                            value={bankAccountInfo.accountNumber}
                            onChange={(e) => setBankAccountInfo({ ...bankAccountInfo, accountNumber: e.target.value })}
                            sx={{ bgcolor: 'white', flex: 1 }}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            label="Atas Nama"
                            placeholder="Nama pemilik rekening"
                            value={bankAccountInfo.accountHolder}
                            onChange={(e) => setBankAccountInfo({ ...bankAccountInfo, accountHolder: e.target.value })}
                            sx={{ bgcolor: 'white', flex: 1 }}
                          />
                        </Box>
                      </Box>
                    )}

                    {/* Payment Instructions */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: '#10b981' }}>
                        📝 Instruksi Pembayaran (Opsional)
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Berikan instruksi pembayaran kepada peserta, misalnya cara transfer, konfirmasi pembayaran, dll."
                        value={paymentInstructions}
                        onChange={(e) => setPaymentInstructions(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>

                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <Typography variant="body2">
                        💡 <strong>Tips:</strong> Peserta akan melihat metode pembayaran dan instruksi ini saat mendaftar event.
                        Pastikan informasi yang diberikan jelas dan lengkap.
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {!isPaidEvent && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">
                      ✅ Event ini <strong>gratis</strong>. Peserta dapat mendaftar tanpa pembayaran.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Date & Time Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#8b5cf6', width: 40, height: 40 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#6366f1' }}>
                      🕒 Waktu & Lokasi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tentukan kapan dan dimana event akan berlangsung
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => {
                      const minDate = new Date();
                      minDate.setDate(minDate.getDate() + 3);
                      const minDateString = minDate.toISOString().split('T')[0];
                      
                      return (
                        <TextField
                          {...field}
                          fullWidth
                          label="Tanggal Event"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          inputProps={isOrganizer ? { min: minDateString } : {}}
                          error={!!errors.date}
                          helperText={(errors.date?.message as string) || (isOrganizer ? `Minimal H-3 dari hari ini (${minDateString})` : 'Pilih tanggal event')}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#6366f1',
                                }
                              }
                            }
                          }}
                        />
                      );
                    }}
                  />

                  <Controller
                    name="start_time"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Waktu Mulai"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.start_time}
                        helperText={errors.start_time?.message as string}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="end_time"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Waktu Selesai"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.end_time}
                        helperText={errors.end_time?.message as string}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <TextField
                          {...field}
                          value={selectedLocation ? selectedLocation.address : field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            if (!selectedLocation) {
                              // Clear selected location if user types manually
                              setSelectedLocation(null);
                            }
                          }}
                          fullWidth
                          label="Lokasi Event"
                          placeholder="Masukkan alamat lengkap event atau pilih dari peta"
                          error={!!errors.location}
                          helperText={(errors.location?.message as string) || "Klik tombol peta untuk memilih lokasi dengan mudah"}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#6366f1',
                                }
                              }
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton 
                                  onClick={handleDetectLocation}
                                  disabled={detectingLocation}
                                  sx={{ color: '#10b981' }}
                                  title="Deteksi lokasi saya"
                                >
                                  {detectingLocation ? <CircularProgress size={20} /> : <MyLocationIcon />}
                                </IconButton>
                                <IconButton 
                                  onClick={() => setMapDialogOpen(true)}
                                  sx={{ color: '#6366f1' }}
                                  title="Pilih lokasi dari peta"
                                >
                                  <MapIcon />
                                </IconButton>
                              </Box>
                            )
                          }}
                        />
                        {selectedLocation && (
                          <Typography variant="caption" sx={{ color: '#059669', mt: 1, display: 'block' }}>
                            📍 Koordinat: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                          </Typography>
                        )}
                      </Box>
                    )}
                  />

                  <Controller
                    name="registration_deadline"
                    control={control}
                    render={({ field }) => {
                      const today = new Date().toISOString().split('T')[0];
                      
                      return (
                        <TextField
                          {...field}
                          fullWidth
                          label="Deadline Pendaftaran"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ min: today }}
                          error={!!errors.registration_deadline}
                          helperText={(errors.registration_deadline?.message as string) || "Harus sebelum tanggal event"}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#6366f1',
                                }
                              }
                            }
                          }}
                        />
                      );
                    }}
                  />

                  <Controller
                    name="max_participants"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Maksimal Peserta"
                        type="number"
                        placeholder="Contoh: 100"
                        error={!!errors.max_participants}
                        helperText={errors.max_participants?.message as string}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              }
                            }
                          }
                        }}
                      />
                    )}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Certificate Settings Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(139, 92, 246, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#a855f7', width: 40, height: 40 }}>
                    <CertificateIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#8b5cf6' }}>
                      🎓 Pengaturan Sertifikat
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aktifkan sertifikat untuk peserta yang menyelesaikan event
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  p: 3, 
                  bgcolor: certificateEnabled ? 'rgba(139, 92, 246, 0.05)' : 'rgba(148, 163, 184, 0.05)', 
                  borderRadius: 2,
                  border: certificateEnabled ? '2px solid rgba(139, 92, 246, 0.2)' : '2px solid rgba(148, 163, 184, 0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={certificateEnabled}
                        onChange={(e) => setCertificateEnabled(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#8b5cf6',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body1" fontWeight="bold" sx={{ 
                          color: certificateEnabled ? '#8b5cf6' : '#64748b' 
                        }}>
                          {certificateEnabled ? '🎓 Sertifikat Diaktifkan' : '🎓 Sertifikat Dinonaktifkan'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {certificateEnabled 
                            ? 'Peserta akan mendapatkan sertifikat setelah menyelesaikan event' 
                            : 'Peserta tidak akan mendapatkan sertifikat untuk event ini'
                          }
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {certificateEnabled && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 600, mb: 1 }}>
                        ✨ Fitur Sertifikat Aktif:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Sertifikat otomatis digenerate setelah event selesai
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Peserta dapat download sertifikat dari dashboard mereka
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Template sertifikat dapat dikustomisasi di pengaturan
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Organizer Information Section - Show for both Admin and EO */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(244, 114, 182, 0.2)', bgcolor: 'rgba(244, 114, 182, 0.02)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#f472b6', width: 40, height: 40 }}>
                    <OrganizerIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#f472b6' }}>
                      👤 Informasi Penyelenggara
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Masukkan informasi lengkap penyelenggara event
                    </Typography>
                  </Box>
                </Box>
                  
                  <Box sx={{ display: 'grid', gap: 3 }}>
                    <Controller
                      name="organizer_name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Nama Penyelenggara"
                          placeholder="Masukkan nama lengkap atau organisasi penyelenggara"
                          error={!!errors.organizer_name}
                          helperText={errors.organizer_name?.message as string}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#f472b6',
                                }
                              }
                            }
                          }}
                        />
                      )}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                      <Controller
                        name="organizer_email"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Email Penyelenggara"
                            type="email"
                            placeholder="email@organizer.com"
                            error={!!errors.organizer_email}
                            helperText={errors.organizer_email?.message as string}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#f472b6',
                                  }
                                }
                              }
                            }}
                          />
                        )}
                      />

                      <Controller
                        name="organizer_contact"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Kontak Penyelenggara"
                            placeholder="+62812345678 atau nomor WhatsApp"
                            error={!!errors.organizer_contact}
                            helperText={errors.organizer_contact?.message as string}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#f472b6',
                                  }
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Box>

                  {/* Status Information - Different message for Admin vs EO */}
                  {isOrganizer ? (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: 2, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600, mb: 1 }}>
                        ⚠️ Informasi Penting untuk Event Organizer:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Event yang Anda buat akan masuk ke status "Menunggu Persetujuan"
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Admin akan meninjau dan menyetujui event sebelum dipublikasikan
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Anda akan mendapat notifikasi setelah event disetujui atau ditolak
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600, mb: 1 }}>
                        ✅ Informasi untuk Admin:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Event yang Anda buat akan langsung dipublikasikan
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Tidak perlu menunggu persetujuan karena Anda adalah admin
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Pastikan semua informasi penyelenggara sudah benar
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

            {/* Image Upload Section */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid rgba(168, 85, 247, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>
                    <ImageIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#a855f7' }}>
                      🖼️ Upload Media
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload flyer atau poster untuk menarik peserta
                    </Typography>
                  </Box>
                </Box>
                
                <TextField
                  label="Upload Flyer/Poster Event"
                  type="file"
                  inputProps={{ 
                    accept: 'image/jpeg,image/jpg,image/png,image/gif',
                    onChange: (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('🖼️ EventForm: File selected:', {
                          name: file.name,
                          size: file.size,
                          type: file.type
                        });
                        setValue('flyer', file);
                      }
                    }
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#a855f7',
                        }
                      }
                    }
                  }}
                />
                
                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, color: '#4f46e5' }}>
                    📸 Panduan Upload Image:
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>📁 Format:</strong> JPEG, JPG, PNG, GIF
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>📏 Ukuran Max:</strong> 5MB (5,000 KB)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>📐 Rasio:</strong> 16:9 (landscape)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>🖥️ Resolusi:</strong> 1920x1080px+
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>⚡ Kualitas:</strong> 85-90%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>🎨 Tips:</strong> Gunakan gambar berkualitas tinggi
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                sx={{
                  borderColor: '#64748b',
                  color: '#64748b',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#475569',
                    bgcolor: 'rgba(100, 116, 139, 0.05)'
                  }
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={16} /> : <Save />}
                disabled={isLoading}
                onClick={(e) => {
                  console.log('🖱️ Button clicked!');
                  console.log('🔍 Form errors at button click:', errors);
                  console.log('🔍 isLoading:', isLoading);
                  // Let form submit handle it, but log for debugging
                }}
                sx={{
                  bgcolor: '#4f46e5',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  '&:hover': {
                    bgcolor: '#3730a3',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)'
                  },
                  '&:disabled': {
                    bgcolor: '#94a3b8',
                    transform: 'none',
                    boxShadow: 'none'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Event'}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Map Dialog */}
        <Dialog 
          open={mapDialogOpen} 
          onClose={() => setMapDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon sx={{ color: '#4f46e5' }} />
              <Typography variant="h6">Pilih Lokasi Event</Typography>
            </Box>
            <IconButton onClick={() => setMapDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MapIcon sx={{ fontSize: 80, color: '#9e9e9e', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Peta Interaktif
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Klik pada peta untuk memilih lokasi event
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<MyLocationIcon />}
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                    },
                  }}
                >
                  {detectingLocation ? 'Mendeteksi...' : 'Gunakan Lokasi Saat Ini'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setValue('location', 'Jakarta Pusat, DKI Jakarta, Indonesia');
                    setMapDialogOpen(false);
                  }}
                >
                  Pilih Jakarta Pusat
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                * Integrasi peta penuh akan tersedia setelah konfigurasi API key
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMapDialogOpen(false)}>Batal</Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setError(null)} 
            severity="error" 
            sx={{ width: '100%', fontSize: '1rem' }}
          >
            <strong>Error:</strong> {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default EventForm;
