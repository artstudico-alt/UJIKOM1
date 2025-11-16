import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Avatar,
  Chip,
  Fade,
  Slide,
  Zoom,
  Grid,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  Person,
  TrendingUp,
  Star,
  EmojiEvents,
  MonetizationOn,
  Event,
  School,
  Rocket,
  AutoAwesome,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { eventService } from '../services/eventService';
import { organizerApiService } from '../services/organizerApiService';

// Interface untuk event data yang ditampilkan di Home
interface HomeEvent {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  badges: string[];
  featured: boolean;
  early_bird_enabled: boolean;
  early_bird_discount: number;
  organizer: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const isNewUser = location.state?.message?.includes('berhasil diverifikasi') ||
                     location.state?.message?.includes('Selamat datang');

    if (isNewUser) {
      const timer = setTimeout(() => {
        setShowConfetti(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    navigate('/', { replace: true });
  };

  // State untuk event data
  const [upcomingEvents, setUpcomingEvents] = useState<HomeEvent[]>([]);

  // Load events from database (public API) and localStorage fallback
  useEffect(() => {
    const loadEvents = async () => {
      try {
        let allEvents: HomeEvent[] = [];

        // 1. Try to fetch from public API database first (includes admin and organizer events)
        try {
          console.log('📅 Home: Loading events from public API database...');
          const publicResponse = await organizerApiService.getEventsWithoutAuth({
            status: 'published',
            per_page: 20
          });
          
          if (publicResponse.data && publicResponse.data.length > 0) {
            const databaseEvents: HomeEvent[] = publicResponse.data.map((event: any) => ({
              id: event.id || 0,
              title: event.title || 'Event',
              subtitle: event.category || 'Event',
              date: event.date || '',
              time: `${event.start_time || '09:00'} - ${event.end_time || '17:00'}`,
              location: event.location || '',
              description: event.description || '',
              // Use processed image URL from backend EventResource first
              image: event.image || event.image_url || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
              badges: ['Certificate', '8+ Hours', 'Intermediate'],
              featured: false,
              early_bird_enabled: false,
              early_bird_discount: 0,
              organizer: event.organizer_name || 'GOMOMENT'
            }));
            allEvents = [...allEvents, ...databaseEvents];
            console.log('✅ Home: Loaded events from database:', databaseEvents.length);
          }
        } catch (apiError) {
          console.warn('📅 Home: Public API not available, falling back to localStorage:', apiError);
          
          // 2. Fallback to localStorage if database API fails
          try {
            const publishedEvents = eventService.getEventsByStatus('published');
            console.log('📅 Home: Loaded organizer events from localStorage fallback:', publishedEvents.length);
            
            const localStorageEvents: HomeEvent[] = publishedEvents.map(event => ({
              id: event.id + 10000, // Offset to avoid ID conflicts
              title: event.name || event.title || 'Event',
              subtitle: event.category || 'Event',
              date: event.eventDate || event.date || '',
              time: `${event.startTime || '09:00'} - ${event.endTime || '17:00'}`,
              location: event.location || '',
              description: event.description || '',
              image: event.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
              badges: ['Certificate', '8+ Hours', 'Intermediate'],
              featured: false,
              early_bird_enabled: false,
              early_bird_discount: 0,
              organizer: event.organizerName || event.organizer || 'Event Organizer'
            }));
            allEvents = [...allEvents, ...localStorageEvents];
          } catch (localError) {
            console.warn('📅 Home: localStorage events error:', localError);
          }
        }

        // 3. If no events found, show default events
        if (allEvents.length === 0) {
          const defaultEvents: HomeEvent[] = [
            {
              id: 1,
              title: 'Workshop Web Development',
              subtitle: 'Modern Web Tech',
              date: '15 September 2025',
              time: '09:00 - 17:00',
              location: 'Auditorium Utama',
              description: 'Workshop intensif untuk mempelajari web development modern.',
              image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
              badges: ['Certificate', '8+ Hours', 'Intermediate'],
              featured: true,
              early_bird_enabled: true,
              early_bird_discount: 20,
              organizer: 'GOMOMENT'
            },
            {
              id: 2,
              title: 'Seminar Digital Marketing',
              subtitle: 'Boost Your Business',
              date: '20 September 2025',
              time: '13:00 - 16:00',
              location: 'Ruang Meeting A',
              description: 'Strategi digital marketing untuk bisnis di era digital.',
              image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop',
              badges: ['Certificate', '3+ Hours', 'Beginner'],
              featured: false,
              early_bird_enabled: false,
              early_bird_discount: 0,
              organizer: 'GOMOMENT'
            },
            {
              id: 3,
              title: 'UI/UX Design Masterclass',
              subtitle: 'From Concept to Prototype',
              date: '25 September 2025',
              time: '10:00 - 18:00',
              location: 'Design Studio',
              description: 'Masterclass lengkap tentang UI/UX design dengan Figma.',
              image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=200&fit=crop',
              badges: ['Certificate', '8+ Hours', 'Advanced'],
              featured: false,
              early_bird_enabled: true,
              early_bird_discount: 15,
              organizer: 'GOMOMENT'
            },
          ];
          allEvents = defaultEvents;
        }

        // Sort events by date (upcoming first)
        allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setUpcomingEvents(allEvents);
        console.log('📅 Home: Final events loaded:', allEvents);

      } catch (error) {
        console.error('Error loading events:', error);
        // Fallback to empty array if all methods fail
        setUpcomingEvents([]);
      }
    };

    loadEvents();
  }, []);

  const gettingStarted = [
    {
      title: 'Jelajahi Event',
      description: 'Temukan workshop dan seminar yang sesuai dengan minat dan kebutuhan karir Anda',
      icon: <Event sx={{ fontSize: 40, color: '#9c27b0' }} />,
      action: () => navigate('/events'),
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0, #e91e63)',
      step: '1'
    },
    {
      title: 'Daftar & Ikuti',
      description: 'Pilih event yang menarik dan daftar dengan mudah. Proses pendaftaran hanya hitungan menit',
      icon: <CalendarToday sx={{ fontSize: 40, color: '#2196f3' }} />,
      action: () => navigate('/events'),
      color: '#2196f3',
      gradient: 'linear-gradient(135deg, #2196f3, #00bcd4)',
      step: '2'
    },
    {
      title: 'Yuk, Daftar Event Sekarang!',
      description: 'Mari daftar event dengan materi berkualitas tinggi dan instruktur berpengalaman untuk mengembangkan skill Anda',
      icon: <School sx={{ fontSize: 40, color: '#f44336' }} />,
      action: () => navigate('/events'),
      color: '#f44336',
      gradient: 'linear-gradient(135deg, #f44336, #ff9800)',
      step: '3'
    },
    {
      title: 'Ayo Daftar & Dapatkan Sertifikat!',
      description: 'Daftar event sekarang dan dapatkan sertifikat resmi untuk meningkatkan CV Anda. Jangan sampai ketinggalan!',
      icon: <EmojiEvents sx={{ fontSize: 40, color: '#4caf50' }} />,
      action: () => navigate('/events'),
      color: '#4caf50',
      gradient: 'linear-gradient(135deg, #4caf50, #8bc34a)',
      step: '4'
    },
  ];

  return (
    <>
      {/* Global CSS to permanently hide all scrollbars */}
      <style>
        {`
          html, body {
            overflow-x: hidden !important;
            overflow-y: auto !important;
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          html::-webkit-scrollbar, 
          body::-webkit-scrollbar {
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
            display: none !important;
          }
          html::-webkit-scrollbar-track,
          body::-webkit-scrollbar-track {
            background: transparent !important;
            display: none !important;
          }
          html::-webkit-scrollbar-thumb,
          body::-webkit-scrollbar-thumb {
            background: transparent !important;
            display: none !important;
          }
          * {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          *::-webkit-scrollbar {
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
            display: none !important;
          }
          *::-webkit-scrollbar-track {
            background: transparent !important;
            display: none !important;
          }
          *::-webkit-scrollbar-thumb {
            background: transparent !important;
            display: none !important;
          }
          *::-webkit-scrollbar-corner {
            background: transparent !important;
            display: none !important;
          }
          .MuiDrawer-root, 
          .MuiDrawer-paper,
          .MuiDrawer-root *,
          .MuiDrawer-paper * {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
            overflow-x: hidden !important;
          }
          .MuiDrawer-root::-webkit-scrollbar, 
          .MuiDrawer-paper::-webkit-scrollbar,
          .MuiDrawer-root *::-webkit-scrollbar,
          .MuiDrawer-paper *::-webkit-scrollbar {
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
            display: none !important;
          }
          .MuiDrawer-root::-webkit-scrollbar-track,
          .MuiDrawer-paper::-webkit-scrollbar-track,
          .MuiDrawer-root *::-webkit-scrollbar-track,
          .MuiDrawer-paper *::-webkit-scrollbar-track {
            background: transparent !important;
            display: none !important;
          }
          .MuiDrawer-root::-webkit-scrollbar-thumb,
          .MuiDrawer-paper::-webkit-scrollbar-thumb,
          .MuiDrawer-root *::-webkit-scrollbar-thumb,
          .MuiDrawer-paper *::-webkit-scrollbar-thumb {
            background: transparent !important;
            display: none !important;
          }
          /* Prevent scrollbar from appearing on hover or focus */
          *:hover::-webkit-scrollbar,
          *:focus::-webkit-scrollbar,
          *:active::-webkit-scrollbar {
            width: 0px !important;
            height: 0px !important;
            background: transparent !important;
            display: none !important;
          }
          /* Allow vertical scrolling while preventing horizontal scroll */
          html {
            overflow-x: hidden !important;
            overflow-y: auto !important;
          }
          body {
            overflow-x: hidden !important;
            overflow-y: auto !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
          #root {
            overflow-x: hidden !important;
            overflow-y: auto !important;
          }
          /* Ensure AppBar/Navbar is not affected */
          .MuiAppBar-root {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 1100 !important;
          }
          /* Prevent any element from showing scrollbars */
          div, span, section, article, aside, nav, header, footer, main {
            overflow-x: hidden !important;
          }
          /* Material-UI specific overrides */
          .MuiBox-root {
            overflow-x: hidden !important;
          }
          .MuiContainer-root {
            overflow-x: hidden !important;
          }
          /* Force hide scrollbars on all pseudo-states */
          *:hover, *:focus, *:active, *:visited {
            overflow-x: hidden !important;
          }
          *:hover::-webkit-scrollbar-track,
          *:focus::-webkit-scrollbar-track,
          *:active::-webkit-scrollbar-track {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
          }
          *:hover::-webkit-scrollbar-thumb,
          *:focus::-webkit-scrollbar-thumb,
          *:active::-webkit-scrollbar-thumb {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
          }
        `}
      </style>
      <Box sx={{
        minHeight: '100vh',
        background: '#ffffff',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
        '& *': {
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none'
        }
      }}>
      {/* Ribbon component removed - not available */}

      {/* Floating Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '120px',
          height: '120px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
          filter: 'blur(1px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '80px',
          height: '80px',
          background: 'rgba(118, 75, 162, 0.08)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite reverse',
          filter: 'blur(1px)',
        }
      }} />

      {/* Geometric Shapes */}
      <Box sx={{
        position: 'absolute',
        top: '15%',
        right: '20%',
        width: '80px',
        height: '80px',
        background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
        borderRadius: '20px',
        animation: 'float 12s ease-in-out infinite',
        zIndex: 1,
        filter: 'blur(1px)',
        transform: 'rotate(45deg)',
      }} />

      <Container maxWidth="lg" sx={{ 
        position: 'relative', 
        zIndex: 2, 
        pt: { xs: 12, md: 14 },
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none'
      }}>

        {/* Welcome Section */}
        <Fade in timeout={800}>
          <Box sx={{
            p: 6,
            mb: 6,
            background: 'linear-gradient(135deg, rgba(243, 229, 245, 0.4) 0%, rgba(227, 242, 253, 0.4) 100%)',
            borderRadius: 4,
            position: 'relative'
          }}>
            {location.state?.message && (
              <Zoom in timeout={1200}>
                <Box sx={{
                  textAlign: 'center',
                  mb: 4,
                  p: 3,
                  bgcolor: 'rgba(156, 39, 176, 0.1)',
                  borderRadius: 3,
                  border: '1px solid rgba(156, 39, 176, 0.2)'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#9c27b0' }}>
                    🎉 Selamat Datang di Platform Kami! 🎉
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    {location.state.message}
                  </Typography>
                </Box>
              </Zoom>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
              <Slide direction="right" in timeout={1000}>
                <Avatar sx={{
                  width: 100,
                  height: 100,
                  background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '2.5rem',
                  boxShadow: '0 4px 16px rgba(156, 39, 176, 0.2)',
                  border: '4px solid white'
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </Slide>

              <Slide direction="left" in timeout={1200}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: '#9c27b0' }}>
                    Selamat Datang, {user?.name || 'User'}! 👋
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                    Selamat datang di platform event management kami
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<Star sx={{ color: '#ff9800' }} />}
                      label="Premium Events"
                      sx={{ bgcolor: '#fff3e0', color: '#e65100' }}
                    />
                    <Chip
                      icon={<EmojiEvents sx={{ color: '#9c27b0' }} />}
                      label="Certificates"
                      sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2' }}
                    />
                    <Chip
                      icon={<Rocket sx={{ color: '#2196f3' }} />}
                      label="Career Growth"
                      sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}
                    />
                  </Box>
                </Box>
              </Slide>
            </Box>

            <Typography variant="body1" sx={{
              color: '#666',
              lineHeight: 1.8,
              fontSize: '1.1rem',
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto'
            }}>
              Platform ini menyediakan berbagai event menarik dan sertifikat yang dapat membantu
              pengembangan karir dan pengetahuan Anda. Jelajahi event yang tersedia dan daftar sekarang!
            </Typography>
          </Box>
        </Fade>

        {/* Getting Started Section */}
        <Slide direction="up" in timeout={1600}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{
              fontWeight: 'bold',
              mb: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #9c27b0, #2196f3, #f44336, #4caf50)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              Mulai Perjalanan Anda
            </Typography>

            <Box sx={{
              maxWidth: '700px',
              mx: 'auto',
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)'
              },
              gap: 3
            }}>
              {gettingStarted.map((step, index) => (
                <Box key={index}>
                  <Box
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.01)',
                        boxShadow: `0 15px 30px ${step.color}40`,
                        background: 'rgba(255, 255, 255, 0.95)',
                      }
                    }}
                    onClick={step.action}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        mx: 'auto',
                        transition: 'all 0.6s ease',
                        '&:hover': {
                          background: step.gradient,
                          transform: 'scale(1.1)',
                          '& svg': {
                            color: 'white !important'
                          }
                        }
                      }}
                    >
                      {step.icon}
                    </Box>

                    <Typography variant="h6" sx={{
                      fontWeight: 'bold',
                      mb: 1.5,
                      color: '#333',
                      fontSize: '1rem'
                    }}>
                      {step.title}
                    </Typography>

                    <Typography variant="body2" sx={{
                      color: '#666',
                      lineHeight: 1.5,
                      fontSize: '0.85rem'
                    }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Slide>

        {/* Pricing Section - Component not available */}
        <Box sx={{ mb: 8 }}>
          {/* PricingSection component removed - not available */}
        </Box>

        {/* Featured Events */}
        <Slide direction="up" in timeout={2000}>
          <Box sx={{ mb: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}>
                🎯 Event Mendatang
              </Typography>
              <Typography variant="h6" sx={{
                color: '#666',
                fontWeight: 500,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}>
                Jangan lewatkan kesempatan emas untuk mengembangkan skill dan berkarir bersama kami
              </Typography>
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: 3,
              justifyContent: 'center',
              pt: 2,
              pb: 2
            }}>
              {upcomingEvents.map((event, index) => (
                <Box key={event.id} sx={{
                  pt: 1,
                  pb: 1
                }}>
                  <Card sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: '100%',
                    minHeight: '480px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
                    border: '1px solid rgba(156, 39, 176, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #9c27b0 0%, #2196f3 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(156, 39, 176, 0.15)',
                      '&::before': {
                        opacity: 1
                      }
                    }
                  }}>
                    <Box sx={{
                      position: 'relative',
                      height: 180,
                      overflow: 'hidden',
                      borderRadius: '12px 12px 0 0'
                    }}>
                      <Box sx={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(45deg, rgba(156, 39, 176, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%), url(${event.image}) center/cover`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'scale(1.08)'
                        }
                      }} />

                      {/* Gradient overlay */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '50%',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                        pointerEvents: 'none'
                      }} />

                      {event.early_bird_enabled && (
                        <Chip
                          label={`🔥 Early Bird ${event.early_bird_discount}% OFF`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            background: 'linear-gradient(135deg, #ff5722, #ff9800)',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            boxShadow: '0 4px 12px rgba(255, 87, 34, 0.4)',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                      )}

                      {/* Status badge */}
                      <Chip
                        label="✨ Tersedia"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          background: 'rgba(76, 175, 80, 0.9)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    </Box>

                    <CardContent sx={{
                      flexGrow: 1,
                      p: 2.5,
                      background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
                      overflow: 'hidden',
                      '&::-webkit-scrollbar': {
                        display: 'none'
                      },
                      '-ms-overflow-style': 'none',
                      'scrollbar-width': 'none'
                    }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: '#1a1a1a',
                        fontSize: '1rem',
                        lineHeight: 1.3,
                        height: '1.3em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" sx={{
                        mb: 2,
                        color: '#666',
                        lineHeight: 1.5,
                        fontSize: '0.85rem',
                        height: '3em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word'
                      }}>
                        {event.description}
                      </Typography>

                      <Box sx={{ 
                        display: 'flex', 
                        gap: 0.5, 
                        mb: 2, 
                        flexWrap: 'wrap',
                        overflow: 'hidden',
                        maxHeight: '32px'
                      }}>
                        {event.badges.map((badge, badgeIndex) => (
                          <Chip
                            key={badgeIndex}
                            label={badge}
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: '24px',
                              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1), rgba(33, 150, 243, 0.1))',
                              color: '#9c27b0',
                              fontWeight: 600,
                              border: '1px solid rgba(156, 39, 176, 0.2)'
                            }}
                          />
                        ))}
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        background: 'rgba(156, 39, 176, 0.05)',
                        border: '1px solid rgba(156, 39, 176, 0.1)'
                      }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #9c27b0, #7c3aed)'
                        }}>
                          <CalendarToday sx={{ fontSize: '0.9rem', color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{
                            color: '#9c27b0',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            Tanggal & Waktu
                          </Typography>
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: '#333',
                            fontSize: '0.8rem'
                          }}>
                            {event.date} • {event.time}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        background: 'rgba(33, 150, 243, 0.05)',
                        border: '1px solid rgba(33, 150, 243, 0.1)'
                      }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #2196f3, #1976d2)'
                        }}>
                          <LocationOn sx={{ fontSize: '0.9rem', color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{
                            color: '#2196f3',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            Lokasi Event
                          </Typography>
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: '#333',
                            fontSize: '0.8rem'
                          }}>
                            {event.location}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2.5, pt: 0, pb: 2.5, mt: 'auto' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #9c27b0, #673ab7, #2196f3)',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          py: 1.2,
                          minHeight: '44px',
                          boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7b1fa2, #512da8, #1976d2)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)'
                          }
                        }}
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        🎯 Daftar Sekarang
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </Slide>

        {/* Why Choose Us */}
        <Slide direction="up" in timeout={2200}>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{
              fontWeight: 'bold',
              mb: 6,
              textAlign: 'center',
              color: '#333'
            }}>
              Mengapa Memilih Kami?
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {/* Baris Atas - Kualitas Premium */}
              {/* @ts-ignore */}
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in timeout={2600}>
                  <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 24px rgba(156, 39, 176, 0.15)'
                    }
                  }}>
                    <AutoAwesome sx={{ fontSize: '3rem', color: '#9c27b0', mb: 2 }} />
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      color: '#9c27b0',
                      mb: 2
                    }}>
                      Kualitas Premium
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                      Event dengan standar tinggi, materi terbaru, dan instruktur berpengalaman
                    </Typography>
                  </Box>
                </Zoom>
              </Grid>

              {/* Baris Atas - Sertifikat Resmi */}
              {/* @ts-ignore */}
              <Grid item xs={12} sm={6} md={4}>
                <Zoom in timeout={2800}>
                  <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 24px rgba(33, 150, 243, 0.15)'
                    }
                  }}>
                    <School sx={{ fontSize: '3rem', color: '#2196f3', mb: 2 }} />
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      color: '#2196f3',
                      mb: 2
                    }}>
                      Sertifikat Resmi
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                      Dapatkan sertifikat resmi untuk meningkatkan nilai CV Anda
                    </Typography>
                  </Box>
                </Zoom>
              </Grid>

              {/* Baris Bawah - Pengembangan Karir (Center) */}
              {/* @ts-ignore */}
              <Grid item xs={12} sm={8} md={4}>
                <Zoom in timeout={3000}>
                  <Box sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 24px rgba(244, 67, 54, 0.15)'
                    }
                  }}>
                    <TrendingUp sx={{ fontSize: '3rem', color: '#f44336', mb: 2 }} />
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      color: '#f44336',
                      mb: 2
                    }}>
                      Pengembangan Karir
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                      Tingkatkan skill dan pengetahuan untuk mendukung kemajuan karir Anda
                    </Typography>
                  </Box>
                </Zoom>
              </Grid>
            </Grid>
          </Box>
        </Slide>
      </Container>
    </Box>
    </>
  );
};

export default Home;
