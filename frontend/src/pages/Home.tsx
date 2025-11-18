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
  ArrowBackIos,
  ArrowForwardIos,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { organizerApiService } from '../services/organizerApiService';
import EventCard from '../components/events/EventCard';

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

  // Load events from database (public API)
  useEffect(() => {
    const loadEvents = async () => {
      try {
        let allEvents: HomeEvent[] = [];

        // Try to fetch from public API database (includes admin and organizer events)
        try {
          console.log('📅 Home: Loading events from database...');
          const publicResponse = await organizerApiService.getEventsWithoutAuth({
            status: 'published',
            per_page: 20
          });
          
          if (publicResponse.data && publicResponse.data.length > 0) {
            console.log('📊 Home: Raw API response data:', publicResponse.data);
            
            const databaseEvents: HomeEvent[] = publicResponse.data.map((event: any) => {
              console.log('🔍 Home: Processing event:', {
                id: event.id,
                title: event.title,
                hasId: !!event.id,
                idType: typeof event.id
              });
              
              return {
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
              };
            });
            
            allEvents = [...allEvents, ...databaseEvents];
            console.log('✅ Home: Loaded events from database:', databaseEvents.length);
            console.log('📊 Home: Event IDs:', databaseEvents.map(e => e.id));
          } else {
            console.log('⚠️ Home: No published events in database');
          }
        } catch (apiError) {  
          console.error('❌ Home: Database API failed:', apiError);
          console.log('📅 Home: Will show default/sample events');
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
      </Container>

      {/* Featured Events - FULL WIDTH OUTSIDE CONTAINER */}
      <Slide direction="up" in timeout={2000}>
        <Box sx={{ 
          mb: 8, 
          py: 8,
          background: '#ffffff',
          overflow: 'hidden',
        }}>
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

          <Container maxWidth="lg">
            <Box sx={{ position: 'relative', mx: -2 }}>
              {/* Left Arrow */}
              <Button
                onClick={() => {
                  const container = document.getElementById('events-container');
                  if (container) container.scrollLeft -= 400;
                }}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: '#9c27b0',
                    color: 'white',
                    boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                  },
                }}
              >
                <ArrowBackIos sx={{ fontSize: 18, ml: 0.5 }} />
              </Button>

              {/* Right Arrow */}
              <Button
                onClick={() => {
                  const container = document.getElementById('events-container');
                  if (container) container.scrollLeft += 400;
                }}
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: '#9c27b0',
                    color: 'white',
                    boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                  },
                }}
              >
                <ArrowForwardIos sx={{ fontSize: 18 }} />
              </Button>

              <Box 
                id="events-container"
                sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  pb: 3,
                  px: 2,
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                }}
              >
              {upcomingEvents
                .slice(0, 3)
                .map((event) => {
                // Convert HomeEvent to EventCard format
                const eventCardData = {
                  id: event.id,
                  title: event.title,
                  formattedDate: event.date,
                  location: event.location,
                  start_time: event.time.split(' - ')[0] || '09:00',
                  end_time: event.time.split(' - ')[1] || '17:00',
                  image: event.image,
                  status: 'published' as const,
                  organizer: event.organizer
                };

                return (
                  <Box key={event.id} sx={{ minWidth: { xs: '280px', sm: '320px', md: '360px' }, flex: '0 0 auto' }}>
                    <EventCard
                      event={eventCardData}
                      onViewDetails={(id) => {
                        console.log('🎯 Home: View Details clicked for event ID:', id);
                        navigate(`/events/${id}`);
                      }}
                      onRegister={(id) => {
                        console.log('🎯 Home: Register clicked for event ID:', id);
                        navigate(`/events/${id}/register`);
                      }}
                      isAuthenticated={!!user}
                    />
                  </Box>
                );
              })}
              </Box>
            </Box>
          </Container>
        </Box>
      </Slide>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
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
