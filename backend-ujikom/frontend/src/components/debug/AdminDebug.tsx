import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  BugReport, 
  Refresh, 
  Delete, 
  AdminPanelSettings,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const AdminDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, logout } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    collectDebugInfo();
  }, [user, isAuthenticated]);

  const collectDebugInfo = () => {
    const info = {
      // Authentication State
      isAuthenticated,
      isLoading,
      authError: error,
      user: user,
      
      // LocalStorage Data
      authToken: localStorage.getItem('auth_token'),
      userData: localStorage.getItem('user'),
      lastActivity: localStorage.getItem('last_activity'),
      
      // Browser Info
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      
      // Session Storage
      sessionKeys: Object.keys(sessionStorage),
      localStorageKeys: Object.keys(localStorage),
    };
    
    setDebugInfo(info);
  };

  const clearAllData = () => {
    localStorage.clear();
    sessionStorage.clear();
    setShowClearDialog(false);
    collectDebugInfo();
    
    // Reload page after clearing
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const setMockAdmin = () => {
    const mockUser = {
      id: 1,
      name: 'Admin Utama',
      email: 'admin@gomoment.com',
      role: 'admin',
      avatar: null,
      created_at: new Date().toISOString()
    };
    
    const mockToken = 'mock_admin_token_' + Date.now();
    
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('last_activity', Date.now().toString());
    
    collectDebugInfo();
    
    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? 
      <CheckCircle sx={{ color: '#22c55e' }} /> : 
      <Error sx={{ color: '#ef4444' }} />;
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BugReport sx={{ mr: 2, color: '#667eea' }} />
            <Typography variant="h5" fontWeight="bold">
              Admin Debug Panel
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Halaman ini membantu mendiagnosis masalah akses admin panel yang mengalami layar gelap atau notifikasi change password.
          </Alert>

          {/* Authentication Status */}
          <Typography variant="h6" gutterBottom>
            🔐 Authentication Status
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(isAuthenticated)}
                    <span>Authenticated</span>
                    <Chip 
                      label={isAuthenticated ? 'YES' : 'NO'} 
                      color={getStatusColor(isAuthenticated)}
                      size="small"
                    />
                  </Box>
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(!isLoading)}
                    <span>Loading Complete</span>
                    <Chip 
                      label={isLoading ? 'LOADING' : 'READY'} 
                      color={isLoading ? 'warning' : 'success'}
                      size="small"
                    />
                  </Box>
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(user?.role === 'admin')}
                    <span>Admin Role</span>
                    <Chip 
                      label={user?.role || 'NONE'} 
                      color={user?.role === 'admin' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(!!debugInfo.authToken)}
                    <span>Auth Token</span>
                    <Chip 
                      label={debugInfo.authToken ? 'PRESENT' : 'MISSING'} 
                      color={debugInfo.authToken ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                }
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          {/* User Information */}
          <Typography variant="h6" gutterBottom>
            👤 User Information
          </Typography>
          
          {user ? (
            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography><strong>Name:</strong> {user.name}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography><strong>Role:</strong> {user.role}</Typography>
              <Typography><strong>ID:</strong> {user.id}</Typography>
            </Box>
          ) : (
            <Alert severity="warning">No user data available</Alert>
          )}

          {/* Error Information */}
          {error && (
            <>
              <Typography variant="h6" gutterBottom sx={{ color: '#ef4444' }}>
                ❌ Error Information
              </Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Debug Actions */}
          <Typography variant="h6" gutterBottom>
            🛠️ Debug Actions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={collectDebugInfo}
            >
              Refresh Info
            </Button>
            
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Delete />}
              onClick={() => setShowClearDialog(true)}
            >
              Clear All Data
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AdminPanelSettings />}
              onClick={setMockAdmin}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Set Mock Admin
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Quick Links */}
          <Typography variant="h6" gutterBottom>
            🔗 Quick Navigation
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/admin'}
            >
              Try Admin Panel
            </Button>
            
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Warning sx={{ color: '#f59e0b' }} />
            Confirm Clear All Data
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            This will clear all localStorage, sessionStorage, and reload the page. 
            You will need to login again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={clearAllData} 
            color="warning" 
            variant="contained"
          >
            Clear All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDebug;
