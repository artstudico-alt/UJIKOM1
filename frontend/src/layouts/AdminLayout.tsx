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
  ChevronLeft,
  ChevronRight,
  Assessment,
  AdminPanelSettings,
  Create,
  Lock,
  Payment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/notifications/NotificationBell';

const drawerWidth = 280;
const collapsedWidth = 80;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Ensure menu is closed on mount to prevent overlay issues
  React.useEffect(() => {
    setAnchorEl(null);
  }, []);

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

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin', description: 'Overview & Analytics' },
    { text: 'User Management', icon: <People />, path: '/admin/users', description: 'Manage Users & Permissions' },
    { text: 'Event Management', icon: <Event />, path: '/admin/events', description: 'Create & Manage Events' },
    { text: 'Participants', icon: <People />, path: '/admin/participants', description: 'View & Manage Participants' },
    { text: 'Payments', icon: <Payment />, path: '/admin/payments', description: 'Payment Management' },
    { text: 'Certificate Management', icon: <School />, path: '/admin/certificate-management', description: 'Manage Event Certificates' },
    { text: 'Certificate Builder', icon: <Create />, path: '/admin/certificate-builder', description: 'Create & Design Certificates' },
    { text: 'Certificates', icon: <School />, path: '/admin/certificates', description: 'View All Certificates' },
    { text: 'Reports', icon: <Assessment />, path: '/admin/reports', description: 'Analytics & Reports' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings', description: 'System Configuration' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${collapsed ? collapsedWidth : drawerWidth}px)` },
          ml: { sm: `${collapsed ? collapsedWidth : drawerWidth}px` },
          background: '#f8fafc',
          color: '#1e293b',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              Admin Panel
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationBell onNotificationClick={() => navigate('/admin/notifications')} />
            
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
                color: 'white', 
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        ModalProps={{
          keepMounted: false,
          disablePortal: true,
        }}
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
        <Toolbar sx={{ 
          minHeight: collapsed ? 120 : 70, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'space-between', 
          px: collapsed ? 1 : 2,
          py: collapsed ? 2 : 0,
          flexDirection: collapsed ? 'column' : 'row',
          gap: collapsed ? 2 : 0
        }}>
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
              bgcolor: collapsed ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                transform: collapsed ? 'scale(1.1)' : 'none'
              },
              transition: 'all 0.3s ease',
              width: collapsed ? 36 : 40,
              height: collapsed ? 36 : 40,
              borderRadius: collapsed ? 2 : 1.5,
              border: collapsed ? '2px solid rgba(255, 255, 255, 0.3)' : 'none',
              boxShadow: collapsed ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            {collapsed ? <ChevronRight sx={{ fontSize: 20 }} /> : <ChevronLeft sx={{ fontSize: 24 }} />}
          </IconButton>
        </Toolbar>
        
        <Box sx={{ 
          overflow: 'hidden', 
          px: 2,
        }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <Tooltip title={collapsed ? item.text : ''} placement="right">
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': {
                        backgroundColor: '#ffffff',
                        borderRadius: '20px 0 0 20px',
                        marginRight: '-16px',
                        paddingRight: '32px',
                        position: 'relative',
                        transform: 'translateX(8px) scale(1.02)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                        '&:hover': {
                          backgroundColor: '#ffffff',
                          transform: 'translateX(12px) scale(1.03)',
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: location.pathname === item.path ? '#4f46e5' : 'rgba(255, 255, 255, 0.7)',
                      minWidth: collapsed ? 'auto' : 44,
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
                </Tooltip>
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
        
        <Box sx={{ 
          overflow: 'hidden', 
          px: 2,
        }}>
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
                      borderRadius: '20px 0 0 20px',
                      marginRight: '-16px',
                      paddingRight: '32px',
                      position: 'relative',
                      transform: 'translateX(8px) scale(1.02)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      zIndex: 10,
                      '&:hover': {
                        backgroundColor: '#ffffff',
                        transform: 'translateX(12px) scale(1.03)',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${collapsed ? collapsedWidth : drawerWidth}px)` },
          height: '100vh',
          bgcolor: '#f8fafc',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        disableScrollLock={true}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <MenuItem onClick={() => navigate('/admin/profile')} sx={{ py: 1.5 }}>
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

export default AdminLayout;
