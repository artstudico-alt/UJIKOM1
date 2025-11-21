import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Event,
  People,
  School,
  Settings,
  Notifications,
  AccountCircle,
  Logout,
  Assessment,
  Create,
  Lock,
  Payment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;
const collapsedWidth = 80;

interface OrganizerLayoutProps {
  children: React.ReactNode;
}

const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu items khusus untuk organizer - menghapus User Management dan mengganti Certificate
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/organizer/dashboard', description: 'Overview & Analytics' },
    { text: 'Event Management', icon: <Event />, path: '/organizer/events', description: 'Create & Manage Events' },
    { text: 'Participants', icon: <People />, path: '/organizer/participants', description: 'View & Manage Participants' },
    { text: 'Payments', icon: <Payment />, path: '/organizer/payments', description: 'Payment Management' },
    { text: 'Certificate Management', icon: <School />, path: '/organizer/certificate-management', description: 'Manage Event Certificates' },
    { text: 'Certificate Builder', icon: <Create />, path: '/organizer/certificate-builder', description: 'Create & Design Certificates' },
    { text: 'Reports', icon: <Assessment />, path: '/organizer/reports', description: 'Analytics & Reports' },
    { text: 'Settings', icon: <Settings />, path: '/organizer/settings', description: 'Account Settings' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${collapsed ? collapsedWidth : drawerWidth}px)` },
          ml: { sm: `${collapsed ? collapsedWidth : drawerWidth}px` },
          background: '#f8fafc',
          color: '#1e293b',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: 0,
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <IconButton
              onClick={handleCollapse}
              sx={{ 
                color: '#64748b',
                '&:hover': { bgcolor: '#f1f5f9' }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Event Organizer Panel
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton sx={{ 
                color: '#64748b',
                '&:hover': { bgcolor: '#f1f5f9' } 
              }}>
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ 
                  color: '#64748b',
                  '&:hover': { bgcolor: '#f1f5f9' } 
                }}
              >
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white', 
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>
                  {user?.name?.charAt(0) || 'O'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? collapsedWidth : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? collapsedWidth : drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #4f46e5 0%, #3730a3 100%)',
            color: '#ffffff',
            borderRight: 'none',
            boxShadow: '4px 0 12px rgba(0, 0, 0, 0.15)',
            borderRadius: 0,
            transition: 'width 0.3s ease',
            overflow: 'hidden',
          },
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Toolbar sx={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 2 }}>
            <img 
              src="/images/logoGOMOMENT.png" 
              alt="GOMOMENT"
              style={{
                height: '24px',
                width: 'auto',
                filter: 'brightness(0) invert(1)', // Make logo white for dark sidebar
              }}
            />
            {!collapsed && (
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                GOMOMENT
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={handleCollapse}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
        
        <Box sx={{ overflow: 'hidden', px: 2, height: 'calc(100vh - 140px)' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: location.pathname === item.path ? '#4f46e5' : 'rgba(255, 255, 255, 0.7)',
                    minWidth: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.4rem',
                    }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <Box sx={{ flex: 1 }}>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                          fontWeight: location.pathname === item.path ? 600 : 500,
                          fontSize: '0.95rem',
                          color: location.pathname === item.path ? '#2c3e50' : 'white',
                        }}
                      />
                      <Typography variant="caption" sx={{ 
                        color: location.pathname === item.path ? 'rgba(44, 62, 80, 0.6)' : 'rgba(255, 255, 255, 0.6)', 
                        fontSize: '0.75rem',
                        display: 'block',
                        mt: 0.5,
                      }}>
                        {item.description}
                      </Typography>
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            background: 'linear-gradient(180deg, #4f46e5 0%, #3730a3 100%)',
            color: '#495057',
            borderRadius: 0,
          },
        }}
      >
        <Toolbar sx={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src="/images/logoGOMOMENT.png" 
              alt="GOMOMENT"
              style={{
                height: '28px',
                width: 'auto',
                filter: 'brightness(0) invert(1)', // Make logo white for dark header
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              GOMOMENT
            </Typography>
          </Box>
        </Toolbar>
        
        <Box sx={{ overflow: 'hidden', px: 2, height: 'calc(100vh - 140px)' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: location.pathname === item.path ? '#4f46e5' : 'rgba(255, 255, 255, 0.7)',
                    minWidth: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.4rem',
                    }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <Box sx={{ flex: 1 }}>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.95rem',
                        color: location.pathname === item.path ? '#2c3e50' : 'white',
                      }}
                    />
                    <Typography variant="caption" sx={{ 
                      color: location.pathname === item.path ? 'rgba(44, 62, 80, 0.6)' : 'rgba(255, 255, 255, 0.6)', 
                      fontSize: '0.75rem',
                      display: 'block',
                      mt: 0.5,
                    }}>
                      {item.description}
                    </Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        className="organizer-main-content"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${collapsed ? collapsedWidth : drawerWidth}px)` },
          maxWidth: '100%',
          bgcolor: '#ffffff',
          transition: 'all 0.3s ease',
          minHeight: '100vh',
          overflow: 'auto',
          height: '100vh',
        }}
      >
        <Toolbar sx={{ minHeight: 70 }} />
        <Box 
          className="organizer-content"
          sx={{ 
            minHeight: 'calc(100vh - 70px)',
            overflow: 'visible',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 2,
          }
        }}
      >
        <MenuItem onClick={() => navigate('/organizer/profile')} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrganizerLayout;
