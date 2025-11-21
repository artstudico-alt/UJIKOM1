import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Fade,
  Slide,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Event,
  Person,
  Login,
  Home,
  Info,
  ContactSupport,
  Search,
  Notifications,
  AccountCircle,
  Dashboard,
  School,
  Logout,
  Settings,
  KeyboardArrowDown,
  Star,
  EmojiEvents,
  MonetizationOn,
  Lock,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/common/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleProfileMenuClose();
  };

  const menuItems = [
    { text: 'Beranda', path: '/', icon: <Home /> },
    { text: 'Event', path: '/events', icon: <Event /> },
    { text: 'Tentang Kami', path: '/about', icon: <Info /> },
    { text: 'Kontak', path: '/contact', icon: <ContactSupport /> },
    { text: 'Cari Sertifikat', path: '/certificates/search', icon: <Search /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          borderRadius: 0,
          background: scrolled
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(10px)',
          borderBottom: scrolled
            ? '1px solid rgba(156, 39, 176, 0.2)'
            : '1px solid rgba(156, 39, 176, 0.1)',
          boxShadow: scrolled
            ? '0 8px 32px rgba(156, 39, 176, 0.15)'
            : '0 4px 20px rgba(156, 39, 176, 0.08)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#333',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(156, 39, 176, 0.3), transparent)',
          }
        }}
      >
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              py: scrolled ? 1.5 : 2,
              minHeight: scrolled ? 64 : 72,
              px: { xs: 2, sm: 3, md: 4 },
              maxWidth: 'none',
            }}
          >
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  fontSize: scrolled ? '1.5rem' : '1.8rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <img 
                  src="/images/logoGOMOMENT.png" 
                  alt="GOMOMENT"
                  style={{
                    height: scrolled ? '32px' : '40px',
                    width: 'auto',
                    transition: 'all 0.3s ease',
                  }}
                />
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1,
                    }}
                  >
                    GOMOMENT
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Professional Events
                  </Typography>
                </Box>
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                {menuItems.slice(0, 4).map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: location.pathname === item.path ? '#9c27b0' : '#666',
                      textTransform: 'none',
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.08)',
                        color: '#9c27b0',
                        transform: 'translateY(-1px)',
                      },
                      '&::after': location.pathname === item.path ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60%',
                        height: '2px',
                        background: 'linear-gradient(90deg, #9c27b0, #2196f3)',
                        borderRadius: 2,
                      } : {},
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {/* Auth Section */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1 },
              flexShrink: 0,
            }}>
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Tooltip title="Notifikasi">
                    <IconButton
                      onClick={handleNotificationsOpen}
                      sx={{
                        color: '#666',
                        '&:hover': {
                          color: '#9c27b0',
                          backgroundColor: 'rgba(156, 39, 176, 0.08)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Badge badgeContent={3} color="error">
                        <Notifications />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  {/* Quick Actions */}
                  <Button
                    variant="contained"
                    startIcon={<Event />}
                    onClick={() => navigate('/my-events')}
                    sx={{
                      background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: { xs: 1.5, sm: 2 },
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      minWidth: { xs: 'auto', sm: '120px' },
                      boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                      '& .MuiButton-startIcon': {
                        marginRight: { xs: 0.5, sm: 1 }
                      },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7b1fa2, #1976d2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      My Events
                    </Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                      Events
                    </Box>
                  </Button>

                  {/* Profile Menu */}
                  <Button
                    variant="outlined"
                    startIcon={<AccountCircle />}
                    endIcon={<KeyboardArrowDown />}
                    onClick={handleProfileMenuOpen}
                    sx={{
                      borderColor: 'rgba(156, 39, 176, 0.3)',
                      color: '#9c27b0',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: { xs: 1.5, sm: 2 },
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      borderWidth: 1.5,
                      maxWidth: { xs: '140px', sm: '180px', md: '220px' },
                      minWidth: '100px',
                      '& .MuiButton-startIcon': {
                        marginRight: { xs: 0.5, sm: 1 }
                      },
                      '& .MuiButton-endIcon': {
                        marginLeft: { xs: 0.5, sm: 1 }
                      },
                      '&:hover': {
                        borderColor: '#9c27b0',
                        backgroundColor: 'rgba(156, 39, 176, 0.08)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                      }}
                    >
                      {user?.name ? (
                        user.name.length > 15 
                          ? `${user.name.substring(0, 12)}...`
                          : user.name
                      ) : 'Profile'}
                    </Box>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Login />}
                    onClick={() => navigate('/login')}
                    sx={{
                      borderColor: 'rgba(156, 39, 176, 0.3)',
                      color: '#9c27b0',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      borderWidth: 1.5,
                      '&:hover': {
                        borderColor: '#9c27b0',
                        backgroundColor: 'rgba(156, 39, 176, 0.08)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Person />}
                    onClick={() => navigate('/register')}
                    sx={{
                      background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7b1fa2, #1976d2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Register
                  </Button>
                </>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{
                    ml: 1,
                    p: 1.5,
                    border: '1.5px solid rgba(156, 39, 176, 0.3)',
                    color: '#9c27b0',
                    '&:hover': {
                      backgroundColor: 'rgba(156, 39, 176, 0.08)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
            </Container>
          </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
            border: '1px solid rgba(156, 39, 176, 0.1)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <AccountCircle sx={{ mr: 2, color: '#9c27b0' }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/pricing'); handleProfileMenuClose(); }}>
          <MonetizationOn sx={{ mr: 2, color: '#9c27b0' }} />
          Pricing
        </MenuItem>
        <MenuItem onClick={() => { navigate('/my-certificates'); handleProfileMenuClose(); }}>
          <School sx={{ mr: 2, color: '#9c27b0' }} />
          My Certificates
        </MenuItem>
        <Divider />
        {user && ['event_organizer', 'admin'].includes(user.role) && (
          <MenuItem onClick={() => { navigate('/organizer/dashboard'); handleProfileMenuClose(); }}>
            <Dashboard sx={{ mr: 2, color: '#9c27b0' }} />
            Organizer Dashboard
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2, color: '#f44336' }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(156, 39, 176, 0.15)',
            border: '1px solid rgba(156, 39, 176, 0.1)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(156, 39, 176, 0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            Notifications
          </Typography>
        </Box>
        <MenuItem onClick={handleNotificationsClose}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#9c27b0',
              mr: 2
            }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                New event registration
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                2 minutes ago
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#2196f3',
              mr: 2
            }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Certificate generated
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                1 hour ago
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationsClose}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              mr: 2
            }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Event reminder
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                3 hours ago
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, pt: scrolled ? 8 : 10 }}>
        {children}
      </Box>

      {/* Footer */}
      <Footer />

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
                mr: 2,
              }}
            >
              <Event sx={{ color: 'white', fontSize: '1.4rem' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                EventHub
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Professional Events
              </Typography>
            </Box>
          </Box>

          {/* Navigation Items */}
          <List sx={{ mb: 2 }}>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(156, 39, 176, 0.1)',
                      '& .MuiListItemIcon-root': {
                        color: '#9c27b0',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#9c27b0',
                        fontWeight: 600,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(156, 39, 176, 0.05)',
                    },
                  }}
                >
                  <Box sx={{ mr: 2, color: location.pathname === item.path ? '#9c27b0' : '#666' }}>
                    {item.icon}
                  </Box>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: location.pathname === item.path ? 600 : 500,
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Auth Section */}
          {isAuthenticated ? (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ color: '#666', mb: 1, px: 2 }}>
                My Account
              </Typography>
              <List>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate('/pricing');
                      setMobileMenuOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, color: '#9c27b0' }}>
                      <MonetizationOn />
                    </Box>
                    <ListItemText primary="Pricing" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate('/my-certificates');
                      setMobileMenuOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, color: '#9c27b0' }}>
                      <School />
                    </Box>
                    <ListItemText primary="My Certificates" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, color: '#9c27b0' }}>
                      <AccountCircle />
                    </Box>
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, color: '#f44336' }}>
                      <Logout />
                    </Box>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Login />}
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  mb: 2,
                  borderColor: 'rgba(156, 39, 176, 0.3)',
                  color: '#9c27b0',
                  '&:hover': {
                    borderColor: '#9c27b0',
                    backgroundColor: 'rgba(156, 39, 176, 0.05)',
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Person />}
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7b1fa2, #1976d2)',
                  },
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default PublicLayout;
