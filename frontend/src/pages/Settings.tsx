import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Save, Notifications, Security, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService, authService } from '../services/api';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const response = await userService.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
      });

      if (response.status === 'success' && response.data) {
        updateUser(response.data);
        setSnackbar({
          open: true,
          message: 'Profile berhasil diperbarui!',
          severity: 'success',
        });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Gagal memperbarui profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setSnackbar({
        open: true,
        message: 'Password baru dan konfirmasi tidak cocok',
        severity: 'error',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await authService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation,
      });

      if (response.status === 'success') {
        setSnackbar({
          open: true,
          message: 'Password berhasil diubah!',
          severity: 'success',
        });
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Gagal mengubah password',
        severity: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box sx={{
      overflow: 'hidden',
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
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Settings
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Profile Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Person sx={{ mr: 2, color: '#667eea' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Profile Settings
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Full Name" 
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
              <TextField 
                fullWidth 
                label="Email" 
                value={profileData.email}
                disabled
                helperText="Email tidak dapat diubah"
              />
              <TextField 
                fullWidth 
                label="Phone" 
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleProfileUpdate}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {loading ? 'Menyimpan...' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Notifications sx={{ mr: 2, color: '#f093fb' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Notification Settings
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  />
                }
                label="Email Notifications"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                  />
                }
                label="SMS Notifications"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  />
                }
                label="Push Notifications"
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Manage how you receive notifications about events and updates.
            </Typography>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Security sx={{ mr: 2, color: '#4facfe' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Security Settings
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                helperText="Min 8 karakter, huruf besar, kecil, angka, spesial"
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.new_password_confirmation}
                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
              />
              <Button
                variant="contained"
                startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
                onClick={handlePasswordChange}
                disabled={passwordLoading}
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                }}
              >
                {passwordLoading ? 'Mengubah...' : 'Change Password'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
