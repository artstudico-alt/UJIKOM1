import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Build as BuildIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import certificateService from '../services/certificateService';

interface Event {
  id: number;
  title: string;
  date: string;
  organizer: string;
  has_certificate: boolean;
  certificate_template_path?: string;
  participants_count: number;
  certificates_generated: number;
}

interface Certificate {
  id: number;
  certificate_number: string;
  participant_name: string;
  event_title: string;
  event_date: string;
  status: string;
  generated_at: string;
  download_count: number;
}

const AdminCertificateManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialogs
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  
  // Upload state
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchCertificates();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching events with certificates...');
      
      // Call real API
      const response = await fetch('http://localhost:8000/api/certificate-events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      console.log('📊 Events with certificates response:', data);
      
      if (data.status === 'success' && data.data) {
        setEvents(data.data);
        console.log('✅ Events loaded:', data.data.length);
      } else {
        console.warn('⚠️ No events data in response');
        setEvents([]);
      }
    } catch (err: any) {
      console.error('❌ Error fetching events:', err);
      setError('Gagal memuat data event: ' + (err.message || 'Unknown error'));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      console.log('🔍 Fetching all certificates...');
      
      // Call real API to get all certificates
      const response = await fetch('http://localhost:8000/api/admin/certificates/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      console.log('📊 Certificates response:', data);
      
      if (data.status === 'success' && data.data) {
        setCertificates(data.data);
        console.log('✅ Certificates loaded:', data.data.length);
      } else {
        setCertificates([]);
      }
    } catch (err: any) {
      console.error('❌ Error fetching certificates:', err);
      setCertificates([]);
    }
  };

  const handleUploadTemplate = async (eventId: number) => {
    if (!templateFile) {
      setError('Pilih file template terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await certificateService.uploadTemplate(eventId, templateFile, true);
      
      setSuccess('Template berhasil diupload!');
      setOpenUploadDialog(false);
      setTemplateFile(null);
      setUploadPreview(null);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal upload template');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificates = async (eventId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await certificateService.generateCertificatesForEvent(eventId);
      
      setSuccess(`Berhasil generate ${result.data.generated} sertifikat!`);
      setOpenGenerateDialog(false);
      fetchEvents();
      fetchCertificates();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal generate certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (PNG, JPG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setTemplateFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'success';
      case 'pending': return 'warning';
      case 'downloaded': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Certificate Management (Admin)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kelola template dan generate sertifikat untuk semua event
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Events dengan Certificate" icon={<EventIcon />} iconPosition="start" />
          <Tab label="All Certificates" icon={<CheckIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab 1: Events dengan Certificate */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Event</strong></TableCell>
                <TableCell><strong>Organizer</strong></TableCell>
                <TableCell><strong>Tanggal</strong></TableCell>
                <TableCell><strong>Peserta</strong></TableCell>
                <TableCell><strong>Generated</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {event.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{event.organizer}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{event.participants_count}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${event.certificates_generated}/${event.participants_count}`}
                      size="small"
                      color={event.certificates_generated === event.participants_count ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {event.certificate_template_path ? (
                      <Chip label="Template Ready" color="success" size="small" />
                    ) : (
                      <Chip label="No Template" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedEvent(event);
                          setOpenUploadDialog(true);
                        }}
                        title="Upload Template"
                      >
                        <UploadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => {
                          setSelectedEvent(event);
                          setOpenSettingsDialog(true);
                        }}
                        title="Settings"
                        disabled={!event.certificate_template_path}
                      >
                        <SettingsIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => {
                          setSelectedEvent(event);
                          setOpenGenerateDialog(true);
                        }}
                        title="Generate Certificates"
                        disabled={!event.certificate_template_path}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 2: All Certificates */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Certificate Number</strong></TableCell>
                <TableCell><strong>Participant</strong></TableCell>
                <TableCell><strong>Event</strong></TableCell>
                <TableCell><strong>Generated</strong></TableCell>
                <TableCell><strong>Downloads</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" py={4}>
                      Belum ada sertifikat yang di-generate
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {cert.certificate_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{cert.participant_name}</TableCell>
                    <TableCell>{cert.event_title}</TableCell>
                    <TableCell>{new Date(cert.generated_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{cert.download_count}</TableCell>
                    <TableCell>
                      <Chip 
                        label={cert.status} 
                        color={getStatusColor(cert.status)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <DownloadIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Template Dialog */}
      <Dialog 
        open={openUploadDialog} 
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Certificate Template</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Event: <strong>{selectedEvent?.title}</strong>
            </Typography>
            
            <Paper
              sx={{
                p: 4,
                mt: 2,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'primary.main',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('admin-template-upload')?.click()}
            >
              {uploadPreview ? (
                <img src={uploadPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300 }} />
              ) : (
                <>
                  <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography>Click to upload template image</Typography>
                  <Typography variant="caption" color="text.secondary">
                    PNG, JPG (Max 5MB)
                  </Typography>
                </>
              )}
              <input
                id="admin-template-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => selectedEvent && handleUploadTemplate(selectedEvent.id)}
            disabled={!templateFile || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Certificates Dialog */}
      <Dialog
        open={openGenerateDialog}
        onClose={() => setOpenGenerateDialog(false)}
      >
        <DialogTitle>Generate Certificates</DialogTitle>
        <DialogContent>
          <Typography>
            Generate sertifikat untuk semua peserta yang telah hadir di event:
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            {selectedEvent?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total peserta: {selectedEvent?.participants_count}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => selectedEvent && handleGenerateCertificates(selectedEvent.id)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog (Text Positions) */}
      <Dialog
        open={openSettingsDialog}
        onClose={() => setOpenSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Certificate Text Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Atur posisi text pada template certificate
            </Typography>
            {/* TODO: Add text position settings form */}
            <Alert severity="info" sx={{ mt: 2 }}>
              Feature coming soon: Drag & drop interface untuk set text positions
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettingsDialog(false)}>Close</Button>
          <Button variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCertificateManagement;
