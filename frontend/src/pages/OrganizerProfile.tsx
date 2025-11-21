import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  Alert,
  Stack,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Edit,
  Save,
  Cancel,
  VerifiedUser,
  AdminPanelSettings,
  Event as EventIcon,
  CameraAlt,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authService, userService } from '../services/api';

const OrganizerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Load profile picture URL
  useEffect(() => {
    if (user?.profile_picture) {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const baseUrl = apiUrl.replace('/api', '');
      setProfilePictureUrl(`${baseUrl}/storage/${user.profile_picture}`);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 2MB');
      return;
    }

    setUploadingPicture(true);
    setError('');

    try {
      const response = await authService.uploadProfilePicture(file);
      if (response.status === 'success' && response.data) {
        // Update profile picture URL
        setProfilePictureUrl(response.data.profile_picture_url);
        // Update user context
        if (user) {
          updateUser({ ...user, profile_picture: response.data.profile_picture });
        }
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal upload foto profile');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      // Send update to API
      const response = await userService.updateProfile({
        name: formData.name,
        phone: formData.phone,
      });

      if (response.status === 'success' && response.data) {
        // Update context with data from API
        updateUser(response.data);
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  // Get role info
  const getRoleInfo = () => {
    if (user?.role === 'admin') {
      return {
        label: 'Administrator',
        color: 'error' as const,
        icon: <AdminPanelSettings />,
        bgcolor: '#f44336',
      };
    } else if (user?.role === 'event_organizer') {
      return {
        label: 'Event Organizer',
        color: 'primary' as const,
        icon: <EventIcon />,
        bgcolor: '#2196f3',
      };
    }
    return {
      label: 'User',
      color: 'default' as const,
      icon: <Person />,
      bgcolor: '#757575',
    };
  };

  const roleInfo = getRoleInfo();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* Main Profile Card */}
        <Box sx={{ flex: 2 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profilePictureUrl || ''}
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: '2.5rem',
                    bgcolor: roleInfo.bgcolor,
                    margin: '0 auto',
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                  onClick={handleProfilePictureClick}
                >
                  {!profilePictureUrl && (user?.name?.charAt(0) || 'U')}
                </Avatar>
                {uploadingPicture && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                  }}>
                    <CircularProgress size={30} sx={{ color: 'white' }} />
                  </Box>
                )}
                <IconButton
                  onClick={handleProfilePictureClick}
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: -4,
                    width: 32,
                    height: 32,
                    bgcolor: roleInfo.bgcolor,
                    border: '3px solid white',
                    '&:hover': {
                      bgcolor: roleInfo.bgcolor,
                      opacity: 0.8,
                    },
                  }}
                >
                  <CameraAlt sx={{ fontSize: 16, color: 'white' }} />
                </IconButton>
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {user?.name || 'User Name'}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user?.email || 'user@example.com'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label={roleInfo.label} 
                  color={roleInfo.color} 
                  icon={roleInfo.icon} 
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Success/Error Messages */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Profil berhasil diperbarui!
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Edit Button */}
            {!isEditing && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profil
                </Button>
              </Box>
            )}

            {/* Form */}
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                disabled={true}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                helperText="Email tidak dapat diubah"
              />
              <TextField
                fullWidth
                label="Nomor Telepon"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Stack>

            {/* Action Buttons */}
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Sidebar - Account Info */}
        <Box sx={{ flex: 1 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Informasi Akun
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Role
                </Typography>
                <Chip 
                  label={roleInfo.label}
                  icon={roleInfo.icon}
                  color={roleInfo.color}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status Akun
                </Typography>
                <Chip 
                  label="Aktif"
                  icon={<VerifiedUser />}
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Member Sejak
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  {new Date().getFullYear()}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID Pengguna
                </Typography>
                <Typography variant="body1" fontWeight="600" sx={{ fontFamily: 'monospace' }}>
                  {user?.id || 'N/A'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
};

export default OrganizerProfile;
