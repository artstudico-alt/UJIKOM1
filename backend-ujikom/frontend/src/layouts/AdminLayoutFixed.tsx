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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    { text: 'Certificate Management', icon: <School />, path: '/admin/certificate-management', description: 'Manage Event Certificates' },
    { text: 'Certificate Builder', icon: <Create />, path: '/admin/certificate-builder', description: 'Create & Design Certificates' },
    { text: 'Certificates', icon: <School />, path: '/admin/certificates', description: 'View All Certificates' },
    { text: 'Reports', icon: <Assessment />, path: '/admin/reports', description: 'Analytics & Reports' },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings', description: 'System Configuration' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
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
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
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
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '&': {
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none',
            },
          },
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Toolbar sx={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              background: 'rgba(255, 255, 255, 0.15)', 
              borderRadius: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Event sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            {!collapsed && (
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                EventHub
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={handleCollapse}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
              transition: 'transform 0.3s ease'
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Toolbar>
        
        <Box sx={{ 
          overflow: 'auto', 
          px: 2,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '&': {
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none',
          },
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
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '&': {
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none',
            },
          },
        }}
      >
        <Toolbar sx={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 44, 
              height: 44, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Event sx={{ fontSize: 26, color: 'white' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              EventHub
            </Typography>
          </Box>
        </Toolbar>
        
        <Box sx={{ 
          overflow: 'auto', 
          px: 2,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '&': {
            '-ms-overflow-style': 'none',
            'scrollbar-width': 'none',
          },
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
          minHeight: '100vh',
          bgcolor: '#f8fafc',
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
