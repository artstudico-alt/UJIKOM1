import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  Fade,
  Slide,
  Grow,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Grid,
  Zoom,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  School,
  Edit,
  Save,
  Cancel,
  Security,
  Notifications,
  AutoAwesome,
  AccountCircle,
  VerifiedUser,
  CalendarToday,
  Logout,
  PhotoCamera,
  Event,
  QrCode,
  Star,
  EmojiEvents,
  TrendingUp,
  Settings,
  CloudUpload,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    education: user?.education || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(user?.profile_image || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Update user data in context
      if (user) {
        const updatedUser = { ...user, ...formData };
        // Here you would typically call an API to update the user
        // For now, we'll just update the local state
        
        // Update the user context to reflect changes immediately
        // This ensures the profile card shows updated information
        updateUser(updatedUser);
      }
      
      setSnackbar({
        open: true,
        message: 'Profil berhasil diperbarui!',
        severity: 'success',
      });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Gagal memperbarui profil',
        severity: 'error',
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      education: user?.education || '',
    });
    setIsEditing(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      
      // Validasi file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: 'Ukuran file terlalu besar. Maksimal 5MB.',
          severity: 'error',
        });
        setIsUploadingImage(false);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.',
          severity: 'error',
        });
        setIsUploadingImage(false);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageDataUrl = e.target?.result as string;
          setProfileImage(imageDataUrl);
          
          // Update user context dengan foto baru
          if (user) {
            const updatedUser = { 
              ...user, 
              profile_image: imageDataUrl 
            };
            updateUser(updatedUser);
            
            setSnackbar({
              open: true,
              message: '✅ Foto profil berhasil diperbarui!',
              severity: 'success',
            });
          }
        } catch (error) {
          setSnackbar({
            open: true,
            message: 'Gagal memproses gambar. Silakan coba lagi.',
            severity: 'error',
          });
        } finally {
          setIsUploadingImage(false);
        }
      };
      
      reader.onerror = () => {
        setSnackbar({
          open: true,
          message: 'Gagal membaca file. Silakan coba lagi.',
          severity: 'error',
        });
        setIsUploadingImage(false);
      };
      
      reader.readAsDataURL(file);
    }
    
    // Reset input value agar bisa upload file yang sama lagi
    event.target.value = '';
  };

  const stats = [
    { label: 'Event Diikuti', value: '0', icon: <Person /> },
    { label: 'Sertifikat', value: '0', icon: <VerifiedUser /> },
    { label: 'Bergabung Sejak', value: '2025', icon: <CalendarToday /> },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `
        radial-gradient(circle at 20% 20%, rgba(156, 39, 176, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(33, 150, 243, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(244, 67, 54, 0.05) 0%, transparent 50%),
        #f8f9fa
      `,
      position: 'relative',
      overflow: 'hidden',
      py: 4 
    }}>
      {/* Background Decorative Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(156, 39, 176, 0.08), rgba(33, 150, 243, 0.08))',
          animation: 'float 6s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(244, 67, 54, 0.08), rgba(156, 39, 176, 0.08))',
          animation: 'float 8s ease-in-out infinite reverse',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        }
      }} />

      <Box sx={{
        position: 'absolute',
        top: '40%',
        left: '5%',
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(33, 150, 243, 0.06)',
        animation: 'pulse 4s ease-in-out infinite',
        zIndex: 0,
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
          '50%': { transform: 'scale(1.2)', opacity: 0.4 },
        }
      }} />

      <Box sx={{
        position: 'absolute',
        bottom: '40%',
        right: '15%',
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'rgba(156, 39, 176, 0.06)',
        animation: 'bounce 3s ease-in-out infinite',
        zIndex: 0,
        '@keyframes bounce': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Fade in timeout={1000}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <AutoAwesome sx={{ 
                  fontSize: 48, 
                  mr: 2, 
                  color: '#9c27b0',
                  backgroundColor: 'transparent',
                  animation: 'glow 2s ease-in-out infinite alternate',
                  '@keyframes glow': {
                    '0%': { filter: 'drop-shadow(0 0 5px rgba(156, 39, 176, 0.3))' },
                    '100%': { filter: 'drop-shadow(0 0 20px rgba(156, 39, 176, 0.6))' },
                  }
                }} />
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Profil Saya
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ color: '#666' }}>
                Kelola informasi profil dan pengaturan akun Anda
              </Typography>
            </Box>
          </Fade>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' }, gap: 4 }}>
          {/* Profile Card */}
          <Box>
            <Slide direction="up" in timeout={800}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(156, 39, 176, 0.1)',
                  boxShadow: '0 20px 60px rgba(156, 39, 176, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #9c27b0, #2196f3, #4caf50)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar
                    src={profileImage || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      fontSize: '3rem',
                      background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                      color: 'white',
                      fontWeight: 700,
                      boxShadow: '0 10px 30px rgba(156, 39, 176, 0.3)',
                      border: '4px solid rgba(156, 39, 176, 0.2)',
                      animation: 'glow 2s ease-in-out infinite alternate',
                      '@keyframes glow': {
                        '0%': { boxShadow: '0 10px 30px rgba(156, 39, 176, 0.3)' },
                        '100%': { boxShadow: '0 10px 30px rgba(156, 39, 176, 0.6)' },
                      }
                    }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                    
                    {/* Upload Photo Button */}
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-image-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <Tooltip title={isUploadingImage ? "Mengupload..." : "Ubah foto profil"}>
                      <label htmlFor="profile-image-upload">
                        <IconButton
                          component="span"
                          disabled={isUploadingImage}
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: isUploadingImage ? '#ccc' : '#9c27b0',
                            color: 'white',
                            width: 48,
                            height: 48,
                            border: '3px solid white',
                            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                            '&:hover': {
                              backgroundColor: isUploadingImage ? '#ccc' : '#7b1fa2',
                              transform: isUploadingImage ? 'none' : 'scale(1.1)',
                            },
                            '&:disabled': {
                              backgroundColor: '#ccc',
                              color: '#999',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {isUploadingImage ? (
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                          ) : (
                            <PhotoCamera />
                          )}
                        </IconButton>
                      </label>
                    </Tooltip>
                    
                    <Chip
                      label="Verified"
                      color="success"
                      size="small"
                      icon={<VerifiedUser />}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>

                  <Typography variant="h4" component="h2" sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {user?.name || 'User Name'}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                    {user?.email || 'user@example.com'}
                  </Typography>
                  <Chip
                    label={user?.role === 'admin' ? '👑 Administrator' : user?.role === 'event_organizer' ? '🎯 Event Organizer' : '👤 Member'}
                    sx={{
                      background: user?.role === 'admin' ? 'linear-gradient(135deg, #ff6b35, #f7931e)' : 
                                 user?.role === 'event_organizer' ? 'linear-gradient(135deg, #9c27b0, #2196f3)' :
                                 'linear-gradient(135deg, #4caf50, #8bc34a)',
                      color: 'white',
                      fontWeight: 600,
                      mb: 2
                    }}
                  />
                  
                  <Typography variant="caption" sx={{ 
                    color: '#666', 
                    mb: 3,
                    display: 'block',
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    📸 Klik ikon kamera untuk mengubah foto profil
                    <br />
                    (Maks. 5MB - JPG, PNG, GIF, WebP)
                  </Typography>

                  <Box sx={{ 
                    height: 1, 
                    background: 'linear-gradient(90deg, transparent, rgba(156, 39, 176, 0.3), transparent)',
                    my: 3 
                  }} />

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 2,
                    }}
                  >
                    {stats.map((stat, index) => (
                      <Box key={index}>
                        <Grow in timeout={1000 + index * 200}>
                          <Card
                            elevation={0}
                            sx={{
                              p: 2,
                              textAlign: 'center',
                              background: 'rgba(156, 39, 176, 0.05)',
                              border: '1px solid rgba(156, 39, 176, 0.1)',
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(156, 39, 176, 0.15)',
                                background: 'rgba(156, 39, 176, 0.08)',
                              }
                            }}
                          >
                            <Avatar sx={{ 
                              bgcolor: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                              width: 40,
                              height: 40,
                              mx: 'auto',
                              mb: 1
                            }}>
                              {stat.icon}
                            </Avatar>
                            <Typography variant="h5" component="div" sx={{ 
                              fontWeight: 800, 
                              color: '#9c27b0',
                              mb: 0.5
                            }}>
                              {stat.value}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: '#666',
                              fontWeight: 500
                            }}>
                              {stat.label}
                            </Typography>
                          </Card>
                        </Grow>
                      </Box>
                    ))}
                  </Box>

                  {/* Quick Actions */}
                  <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(156, 39, 176, 0.2)' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      color: '#9c27b0',
                      textAlign: 'center'
                    }}>
                      🚀 Quick Actions
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Event />}
                        onClick={() => navigate('/events')}
                        sx={{
                          py: 1.5,
                          background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                          fontWeight: 600,
                          borderRadius: 3,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7b1fa2, #1976d2)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(156, 39, 176, 0.3)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        🎯 Jelajahi Event
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<EmojiEvents />}
                        onClick={() => navigate('/my-certificates')}
                        sx={{
                          py: 1.5,
                          borderWidth: 2,
                          borderColor: '#4caf50',
                          color: '#4caf50',
                          fontWeight: 600,
                          borderRadius: 3,
                          '&:hover': {
                            borderWidth: 2,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        🏆 Sertifikat Saya
                      </Button>
                    </Box>
                  </Box>

                  {/* Logout Button */}
                  <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(156, 39, 176, 0.2)' }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Logout />}
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      sx={{
                        py: 1.5,
                        borderWidth: 2,
                        borderColor: '#f44336',
                        color: '#f44336',
                        fontWeight: 600,
                        '&:hover': {
                          borderWidth: 2,
                          backgroundColor: '#f44336',
                          color: 'white',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Logout
                    </Button>
                  </Box>
              </Card>
            </Slide>
          </Box>

          {/* Profile Form */}
          <Box>
            <Slide direction="right" in timeout={1200}>
              <Card
                elevation={0}
                sx={{
                  p: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(156, 39, 176, 0.1)',
                  boxShadow: '0 20px 60px rgba(156, 39, 176, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #2196f3, #4caf50, #ff9800)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                      <Settings />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h2" sx={{ 
                        fontWeight: 800, 
                        background: 'linear-gradient(45deg, #9c27b0, #2196f3)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        Informasi Profil
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Kelola data pribadi Anda
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    {!isEditing ? (
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setIsEditing(true)}
                        sx={{
                          background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7b1fa2, #1976d2)',
                          },
                        }}
                      >
                        Edit Profil
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleSave}
                          sx={{
                            background: 'linear-gradient(135deg, #4caf50, #45a049)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #45a049, #3d8b40)',
                            },
                          }}
                        >
                          Simpan
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleCancel}
                          sx={{
                            borderColor: '#f44336',
                            color: '#f44336',
                            '&:hover': {
                              borderColor: '#d32f2f',
                              backgroundColor: '#f44336',
                              color: 'white',
                            },
                          }}
                        >
                          Batal
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                      gap: 3,
                    }}
                  >
                    <Box>
                      <TextField
                        fullWidth
                        label="Nama Lengkap"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: '#9c27b0' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={true} // Email tidak bisa diedit
                        variant="outlined"
                        InputProps={{
                          startAdornment: <Email sx={{ mr: 1, color: '#9c27b0' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.04)', // Background abu-abu untuk disabled field
                          },
                        }}
                        helperText="Email tidak dapat diubah"
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Nomor Telepon"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={true} // Phone tidak bisa diedit
                        variant="outlined"
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: '#9c27b0' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.04)', // Background abu-abu untuk disabled field
                          },
                        }}
                        helperText="Nomor telepon tidak dapat diubah"
                      />
                    </Box>
                    <Box>
                      <TextField
                        fullWidth
                        label="Pendidikan"
                        name="education"
                        value={formData.education}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <School sx={{ mr: 1, color: '#9c27b0' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                      <TextField
                        fullWidth
                        label="Alamat"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        multiline
                        rows={3}
                        variant="outlined"
                        InputProps={{
                          startAdornment: <LocationOn sx={{ mr: 1, color: '#9c27b0' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </Box>
              </Card>
            </Slide>
          </Box>
        </Box>

        {/* Settings Section */}
        <Box sx={{ mt: 6 }}>
          <Slide direction="up" in timeout={1400}>
            <Card
              elevation={0}
              sx={{
                p: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                border: '1px solid rgba(156, 39, 176, 0.1)',
                boxShadow: '0 20px 60px rgba(156, 39, 176, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #4caf50, #ff9800, #e91e63)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                  <Settings />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h2" sx={{ 
                    fontWeight: 800, 
                    background: 'linear-gradient(45deg, #4caf50, #ff9800)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Pengaturan Akun
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Kelola preferensi dan pengaturan akun Anda
                  </Typography>
                </Box>
              </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 4,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Security sx={{ color: '#9c27b0', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Keamanan
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pengaturan keamanan akun
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Ubah
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Notifications sx={{ color: '#9c27b0', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Notifikasi Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Terima notifikasi via email
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label=""
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AccountCircle sx={{ color: '#9c27b0', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Privasi
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pengaturan privasi profil
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Atur
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <VerifiedUser sx={{ color: '#9c27b0', mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          Verifikasi Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status verifikasi email
                        </Typography>
                      </Box>
                      <Chip
                        label="Terverifikasi"
                        color="success"
                        size="small"
                        icon={<VerifiedUser />}
                      />
                    </Box>
                  </Box>
                </Box>
            </Card>
          </Slide>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Profile;
