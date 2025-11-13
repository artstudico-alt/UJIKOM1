import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const OrganizerSettings: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+62812345678',
    bio: 'Event organizer profesional dengan pengalaman 5+ tahun',
    website: 'https://myevents.com',
    location: 'Jakarta, Indonesia'
  });

  // Organization Settings
  const [organizationData, setOrganizationData] = useState({
    organizationName: 'PT. Event Organizer Indonesia',
    organizationType: 'company',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    taxId: '01.234.567.8-901.000',
    businessLicense: 'NIB-1234567890123',
    bankAccount: '1234567890',
    bankName: 'Bank Mandiri'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    eventReminders: true,
    participantUpdates: true,
    paymentNotifications: true,
    marketingEmails: false
  });

  // Security Settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    defaultCurrency: 'IDR',
    paymentMethods: {
      bankTransfer: true,
      creditCard: true,
      eWallet: true,
      qris: true
    },
    autoRefund: true,
    refundPolicy: '7 days before event'
  });

  const handleProfileSave = () => {
    // Simulate API call
    console.log('Saving profile:', profileData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleOrganizationSave = () => {
    console.log('Saving organization:', organizationData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleNotificationSave = () => {
    console.log('Saving notifications:', notificationSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSecuritySave = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }
    console.log('Saving security settings');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePaymentSave = () => {
    console.log('Saving payment settings:', paymentSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#f8f9fa', 
      py: 4,
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
      <Container maxWidth="lg" sx={{
        overflow: 'hidden',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none'
      }}>
        {/* Header */}
        <Paper sx={{ p: 4, borderRadius: 3, background: 'white', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
            Pengaturan
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Kelola profil dan preferensi akun Anda
          </Typography>
        </Paper>

        {/* Success Alert */}
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Pengaturan berhasil disimpan!
          </Alert>
        )}

        {/* Settings Tabs */}
        <Paper sx={{ 
          borderRadius: 3, 
          background: 'white',
          overflow: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              px: 4, 
              pt: 2,
              overflow: 'hidden',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none'
            }}
          >
            <Tab icon={<BusinessIcon />} label="Profil" />
            <Tab icon={<BusinessIcon />} label="Organisasi" />
            <Tab icon={<NotificationsIcon />} label="Notifikasi" />
            <Tab icon={<SecurityIcon />} label="Keamanan" />
            <Tab icon={<PaymentIcon />} label="Pembayaran" />
          </Tabs>

          {/* Profile Tab */}
          {tabValue === 0 && (
            <Box sx={{ 
              p: 4,
              overflow: 'hidden',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none'
            }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Informasi Profil
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar 
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    mr: 3,
                    bgcolor: '#4f46e5',
                    fontSize: '2rem'
                  }}
                >
                  {user?.name?.charAt(0) || 'O'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {user?.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Event Organizer
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    size="small"
                  >
                    Ubah Foto
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                <TextField
                  label="Nama Lengkap"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Nomor Telepon"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
                <TextField
                  label="Website"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Lokasi"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  fullWidth
                />
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleProfileSave}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Simpan Perubahan
                </Button>
              </Box>
            </Box>
          )}

          {/* Organization Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Informasi Organisasi
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                <TextField
                  label="Nama Organisasi"
                  value={organizationData.organizationName}
                  onChange={(e) => setOrganizationData({ ...organizationData, organizationName: e.target.value })}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Tipe Organisasi</InputLabel>
                  <Select
                    value={organizationData.organizationType}
                    onChange={(e) => setOrganizationData({ ...organizationData, organizationType: e.target.value })}
                    label="Tipe Organisasi"
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="company">Perusahaan</MenuItem>
                    <MenuItem value="foundation">Yayasan</MenuItem>
                    <MenuItem value="government">Pemerintah</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Alamat"
                  value={organizationData.address}
                  onChange={(e) => setOrganizationData({ ...organizationData, address: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
                <TextField
                  label="NPWP"
                  value={organizationData.taxId}
                  onChange={(e) => setOrganizationData({ ...organizationData, taxId: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="NIB/Izin Usaha"
                  value={organizationData.businessLicense}
                  onChange={(e) => setOrganizationData({ ...organizationData, businessLicense: e.target.value })}
                  fullWidth
                />
                <Divider />
                <Typography variant="subtitle1" fontWeight="bold">
                  Informasi Bank
                </Typography>
                <TextField
                  label="Nama Bank"
                  value={organizationData.bankName}
                  onChange={(e) => setOrganizationData({ ...organizationData, bankName: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Nomor Rekening"
                  value={organizationData.bankAccount}
                  onChange={(e) => setOrganizationData({ ...organizationData, bankAccount: e.target.value })}
                  fullWidth
                />
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleOrganizationSave}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Simpan Perubahan
                </Button>
              </Box>
            </Box>
          )}

          {/* Notifications Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Pengaturan Notifikasi
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Metode Notifikasi
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          emailNotifications: e.target.checked 
                        })}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          smsNotifications: e.target.checked 
                        })}
                      />
                    }
                    label="SMS Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          pushNotifications: e.target.checked 
                        })}
                      />
                    }
                    label="Push Notifications"
                  />
                </Card>

                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Jenis Notifikasi
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.eventReminders}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          eventReminders: e.target.checked 
                        })}
                      />
                    }
                    label="Pengingat Event"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.participantUpdates}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          participantUpdates: e.target.checked 
                        })}
                      />
                    }
                    label="Update Peserta"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.paymentNotifications}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          paymentNotifications: e.target.checked 
                        })}
                      />
                    }
                    label="Notifikasi Pembayaran"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          marketingEmails: e.target.checked 
                        })}
                      />
                    }
                    label="Email Marketing"
                  />
                </Card>

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleNotificationSave}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Simpan Perubahan
                </Button>
              </Box>
            </Box>
          )}

          {/* Security Tab */}
          {tabValue === 3 && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Pengaturan Keamanan
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Ubah Password
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Password Saat Ini"
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Password Baru"
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Konfirmasi Password Baru"
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      fullWidth
                    />
                  </Box>
                </Card>

                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Autentikasi Dua Faktor
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securityData.twoFactorEnabled}
                        onChange={(e) => setSecurityData({ 
                          ...securityData, 
                          twoFactorEnabled: e.target.checked 
                        })}
                      />
                    }
                    label="Aktifkan 2FA untuk keamanan tambahan"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Dengan mengaktifkan 2FA, Anda akan diminta memasukkan kode verifikasi setiap kali login.
                  </Typography>
                </Card>

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSecuritySave}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Simpan Perubahan
                </Button>
              </Box>
            </Box>
          )}

          {/* Payment Tab */}
          {tabValue === 4 && (
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Pengaturan Pembayaran
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Mata Uang Default
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Mata Uang</InputLabel>
                    <Select
                      value={paymentSettings.defaultCurrency}
                      onChange={(e) => setPaymentSettings({ 
                        ...paymentSettings, 
                        defaultCurrency: e.target.value 
                      })}
                      label="Mata Uang"
                    >
                      <MenuItem value="IDR">Indonesian Rupiah (IDR)</MenuItem>
                      <MenuItem value="USD">US Dollar (USD)</MenuItem>
                      <MenuItem value="EUR">Euro (EUR)</MenuItem>
                    </Select>
                  </FormControl>
                </Card>

                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Metode Pembayaran yang Diterima
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={paymentSettings.paymentMethods.bankTransfer}
                        onChange={(e) => setPaymentSettings({ 
                          ...paymentSettings, 
                          paymentMethods: {
                            ...paymentSettings.paymentMethods,
                            bankTransfer: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Transfer Bank"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={paymentSettings.paymentMethods.creditCard}
                        onChange={(e) => setPaymentSettings({ 
                          ...paymentSettings, 
                          paymentMethods: {
                            ...paymentSettings.paymentMethods,
                            creditCard: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Kartu Kredit/Debit"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={paymentSettings.paymentMethods.eWallet}
                        onChange={(e) => setPaymentSettings({ 
                          ...paymentSettings, 
                          paymentMethods: {
                            ...paymentSettings.paymentMethods,
                            eWallet: e.target.checked
                          }
                        })}
                      />
                    }
                    label="E-Wallet (OVO, GoPay, Dana)"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={paymentSettings.paymentMethods.qris}
                        onChange={(e) => setPaymentSettings({ 
                          ...paymentSettings, 
                          paymentMethods: {
                            ...paymentSettings.paymentMethods,
                            qris: e.target.checked
                          }
                        })}
                      />
                    }
                    label="QRIS"
                  />
                </Card>

                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    Kebijakan Refund
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={paymentSettings.autoRefund}
                        onChange={(e) => setPaymentSettings({ 
                          ...paymentSettings, 
                          autoRefund: e.target.checked 
                        })}
                      />
                    }
                    label="Refund Otomatis"
                  />
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Batas Waktu Refund</InputLabel>
                    <Select
                      value={paymentSettings.refundPolicy}
                      onChange={(e) => setPaymentSettings({ 
                        ...paymentSettings, 
                        refundPolicy: e.target.value 
                      })}
                      label="Batas Waktu Refund"
                    >
                      <MenuItem value="1 day before event">1 hari sebelum event</MenuItem>
                      <MenuItem value="3 days before event">3 hari sebelum event</MenuItem>
                      <MenuItem value="7 days before event">7 hari sebelum event</MenuItem>
                      <MenuItem value="14 days before event">14 hari sebelum event</MenuItem>
                      <MenuItem value="no refund">Tidak ada refund</MenuItem>
                    </Select>
                  </FormControl>
                </Card>

                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handlePaymentSave}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Simpan Perubahan
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default OrganizerSettings;
