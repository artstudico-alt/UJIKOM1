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
  Card,
  CardContent,
  Tabs,
  Tab,
  Link,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Save,
  VerifiedUser,
  Business,
  Description,
  ContentCopy,
  CameraAlt,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { eventService, authService, userService } from '../services/api';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    certificates: 0,
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    education: user?.education || '',
    address: user?.address || '',
  });

  // Load profile picture URL
  useEffect(() => {
    if (user?.profile_picture) {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const baseUrl = apiUrl.replace('/api', '');
      setProfilePictureUrl(`${baseUrl}/storage/${user.profile_picture}`);
    }
  }, [user]);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch my events
        const eventsResponse = await eventService.getMyEvents();
        const myEvents = eventsResponse.data || [];
        
        // Fetch my certificates
        const certificatesResponse = await eventService.getMyCertificates();
        const myCertificates = certificatesResponse.data || [];
        
        // Calculate stats
        const now = new Date();
        const activeEvents = myEvents.filter((event: any) => {
          const eventDate = new Date(event.date);
          return eventDate >= now;
        });
        
        setStats({
          totalEvents: myEvents.length,
          activeEvents: activeEvents.length,
          certificates: myCertificates.length,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    
    if (user) {
      fetchStats();
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
        education: formData.education,
        address: formData.address,
      });

      if (response.status === 'success' && response.data) {
        // Update context with data from API
        updateUser(response.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  // Get role badge
  const getRoleBadge = () => {
    if (user?.role === 'admin') {
      return <Chip label="Administrator" color="error" icon={<VerifiedUser />} />;
    } else if (user?.role === 'event_organizer') {
      return <Chip label="Event Organizer" color="primary" icon={<VerifiedUser />} />;
    } else {
      return <Chip label="User" color="default" icon={<Person />} />;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#f5f7fa',
    }}>
      {/* Purple Header with Decorative Circles */}
      <Box sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        height: '200px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative Circles */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: 100,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }} />
        <Box sx={{
          position: 'absolute',
          top: 50,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -40,
          left: 50,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
        }} />
        <Box sx={{
          position: 'absolute',
          top: 30,
          left: -40,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.07)',
        }} />
        <Container maxWidth="lg">
          <Box sx={{ pt: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                <Avatar src="" sx={{ width: 32, height: 32 }} />
                <Typography sx={{ color: 'white', fontSize: '14px' }}>
                  {user?.name || 'User'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 1, pb: 6 }}>

            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Left Side - Profile Card */}
              <Box sx={{ flex: { xs: '1', md: '0 0 280px' } }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
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
                          bgcolor: '#e3f2fd',
                          color: '#1976d2',
                          margin: '0 auto',
                          mb: 1,
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
                          bottom: 0,
                          right: -4,
                          width: 32,
                          height: 32,
                          bgcolor: '#4361ee',
                          border: '3px solid white',
                          '&:hover': {
                            bgcolor: '#3651d4',
                          },
                        }}
                      >
                        <CameraAlt sx={{ fontSize: 16, color: 'white' }} />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" fontWeight="600" sx={{ mt: 2, mb: 3 }}>
                      {user?.name || 'User Name'}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'left', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Event yang pernah anda ikuti
                      </Typography>
                      <Typography variant="h6" fontWeight="600" color="warning.main">
                        {stats.totalEvents}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'left', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Event yang sedang di ikuti
                      </Typography>
                      <Typography variant="h6" fontWeight="600" color="success.main">
                        {stats.activeEvents}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'left', mb: 3 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Sertifikat saya
                      </Typography>
                      <Typography variant="h6" fontWeight="600">
                        {stats.certificates}
                      </Typography>
                    </Box>

                  </Box>
                </Paper>
              </Box>

              {/* Right Side - Form */}
              <Box sx={{ flex: 1 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 2,
                    background: 'white',
                    border: '1px solid #e0e0e0',
                  }}
                >


                  {/* Single Tab - Centered */}
                  <Box sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'center',
                    py: 2,
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                      Account Settings
                    </Typography>
                  </Box>

                  <Box sx={{ p: 4 }}>
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

                    {/* Form */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
                      <TextField
                        label="Nama Lengkap"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                        size="small"
                        fullWidth
                        helperText="Email tidak dapat diubah"
                      />
                      <TextField
                        label="Nomor Telepon"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Pendidikan"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Alamat"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        size="small"
                        fullWidth
                        multiline
                        rows={3}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={loading}
                      sx={{
                        background: '#4361ee',
                        textTransform: 'none',
                        px: 4,
                        '&:hover': {
                          background: '#3651d4',
                        }
                      }}
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </Button>
                  </Box>
                </Paper>

              </Box>
            </Box>
      </Container>
    </Box>
  );
};

export default Profile;
