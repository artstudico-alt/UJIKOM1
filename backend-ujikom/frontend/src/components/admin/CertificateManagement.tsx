import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../../services/api';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  has_certificate: boolean;
  certificate_template_path?: string;
  certificate_required: boolean;
  participants_count: number;
  certificates_generated: number;
  certificates_pending: number;
}

interface Certificate {
  id: number;
  participant: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    title: string;
    date: string;
  };
  certificate_number: string;
  status: 'pending' | 'generated' | 'sent' | 'downloaded';
  generated_at?: string;
  download_count: number;
}

const CertificateManagement: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Form states
  const [eventForm, setEventForm] = useState({
    has_certificate: false,
    certificate_required: false,
    certificate_template: null as File | null,
  });

  const queryClient = useQueryClient();

  // Fetch events with certificate info
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-events-certificates'],
    queryFn: () => api.get('/admin/events/certificates'),
    select: (response: any) => response.data.data,
  });

  // Fetch certificates for selected event
  const { data: certificatesData, isLoading: certificatesLoading } = useQuery({
    queryKey: ['event-certificates', selectedEvent?.id],
    queryFn: () => api.get(`/admin/events/${selectedEvent?.id}/certificates`),
    select: (response: any) => response.data.data,
    enabled: !!selectedEvent,
  });

  const events: Event[] = eventsData || [];
  const certificates: Certificate[] = certificatesData || [];

  // Mutations
  const updateEventCertificateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/admin/events/${selectedEvent?.id}/certificate-settings`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events-certificates'] });
      setSnackbar({
        open: true,
        message: 'Pengaturan sertifikat berhasil diupdate',
        severity: 'success'
      });
      setEventDialogOpen(false);
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Gagal update pengaturan sertifikat',
        severity: 'error'
      });
    }
  });

  const generateCertificateMutation = useMutation({
    mutationFn: (participantId: number) => api.post(`/admin/events/${selectedEvent?.id}/certificates/generate`, { participant_id: participantId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-certificates', selectedEvent?.id] });
      setSnackbar({
        open: true,
        message: 'Sertifikat berhasil digenerate',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Gagal generate sertifikat',
        severity: 'error'
      });
    }
  });

  const generateAllCertificatesMutation = useMutation({
    mutationFn: () => api.post(`/admin/events/${selectedEvent?.id}/certificates/generate-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-certificates', selectedEvent?.id] });
      setSnackbar({
        open: true,
        message: 'Semua sertifikat berhasil digenerate',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Gagal generate semua sertifikat',
        severity: 'error'
      });
    }
  });

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setEventForm({
      has_certificate: event.has_certificate,
      certificate_required: event.certificate_required,
      certificate_template: null,
    });
    setEventDialogOpen(true);
  };

  const handleUpdateEventCertificate = () => {
    const formData = new FormData();
    formData.append('has_certificate', eventForm.has_certificate.toString());
    formData.append('certificate_required', eventForm.certificate_required.toString());
    
    if (eventForm.certificate_template) {
      formData.append('certificate_template', eventForm.certificate_template);
    }

    updateEventCertificateMutation.mutate(formData);
  };

  const handleGenerateCertificate = (participantId: number) => {
    generateCertificateMutation.mutate(participantId);
  };

  const handleGenerateAllCertificates = () => {
    generateAllCertificatesMutation.mutate();
  };

  const handleDownloadCertificate = (certificateId: number) => {
    window.open(`/api/admin/certificates/${certificateId}/download`, '_blank');
  };

  const handleSendCertificate = (certificateId: number) => {
    // Implement send certificate via email
    setSnackbar({
      open: true,
      message: 'Sertifikat berhasil dikirim via email',
      severity: 'success'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'success';
      case 'pending': return 'warning';
      case 'sent': return 'info';
      case 'downloaded': return 'primary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'generated': return 'Telah Digenerate';
      case 'pending': return 'Menunggu';
      case 'sent': return 'Telah Dikirim';
      case 'downloaded': return 'Telah Didownload';
      default: return status;
    }
  };

  if (eventsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          Manajemen Sertifikat Event
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kelola pengaturan sertifikat dan generate sertifikat untuk setiap event
        </Typography>
      </Box>

      {/* Events List */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Daftar Event
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Lokasi</TableCell>
                  <TableCell>Peserta</TableCell>
                  <TableCell>Sertifikat</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {event.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(event.date), 'dd MMM yyyy', { locale: id })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {event.location}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {event.participants_count} peserta
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip
                          label={event.has_certificate ? 'Ada Sertifikat' : 'Tidak Ada'}
                          color={event.has_certificate ? 'success' : 'default'}
                          size="small"
                        />
                        {event.has_certificate && (
                          <Chip
                            label={event.certificate_required ? 'Wajib' : 'Opsional'}
                            color={event.certificate_required ? 'warning' : 'info'}
                            size="small"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption">
                          Generated: {event.certificates_generated}
                        </Typography>
                        <Typography variant="caption">
                          Pending: {event.certificates_pending}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Kelola Sertifikat">
                          <IconButton
                            size="small"
                            onClick={() => handleEventSelect(event)}
                            color="primary"
                          >
                            <SchoolIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Lihat Sertifikat">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedEvent(event);
                              setCertificateDialogOpen(true);
                            }}
                            color="info"
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Event Certificate Settings Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Pengaturan Sertifikat - {selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={eventForm.has_certificate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, has_certificate: e.target.checked }))}
                    />
                  }
                  label="Event ini memiliki sertifikat"
                />
              </Box>
              
              {eventForm.has_certificate && (
                <>
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={eventForm.certificate_required}
                          onChange={(e) => setEventForm(prev => ({ ...prev, certificate_required: e.target.checked }))}
                        />
                      }
                      label="Sertifikat wajib untuk event ini"
                    />
                  </Box>
                  
                  <Box>
                    <Box sx={{ border: '2px dashed #ccc', p: 3, textAlign: 'center', borderRadius: 2 }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Upload Template Sertifikat
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload template sertifikat untuk event ini (PDF, JPG, PNG)
                      </Typography>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEventForm(prev => ({ ...prev, certificate_template: file }));
                          }
                        }}
                        style={{ display: 'none' }}
                        id="certificate-template-upload"
                      />
                      <label htmlFor="certificate-template-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                        >
                          Pilih File
                        </Button>
                      </label>
                      {eventForm.certificate_template && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                          File dipilih: {eventForm.certificate_template.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={handleUpdateEventCertificate}
            variant="contained"
            disabled={updateEventCertificateMutation.isPending}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {updateEventCertificateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certificates List Dialog */}
      <Dialog open={certificateDialogOpen} onClose={() => setCertificateDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Sertifikat Event - {selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<SchoolIcon />}
                onClick={handleGenerateAllCertificates}
                disabled={generateAllCertificatesMutation.isPending}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {generateAllCertificatesMutation.isPending ? 'Generating...' : 'Generate Semua Sertifikat'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => queryClient.invalidateQueries({ queryKey: ['event-certificates', selectedEvent?.id] })}
              >
                Refresh
              </Button>
            </Box>

            {/* Certificates Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Peserta</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tanggal Generate</TableCell>
                    <TableCell>Download Count</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificates.map((certificate) => (
                    <TableRow key={certificate.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                            color: 'white',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
                          }}>
                            {certificate.participant.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {certificate.participant.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {certificate.participant.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(certificate.status)}
                          color={getStatusColor(certificate.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {certificate.generated_at 
                            ? format(new Date(certificate.generated_at), 'dd MMM yyyy HH:mm', { locale: id })
                            : '-'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {certificate.download_count} kali
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {certificate.status === 'pending' && (
                            <Tooltip title="Generate Sertifikat">
                              <IconButton
                                size="small"
                                onClick={() => handleGenerateCertificate(certificate.participant.id)}
                                color="primary"
                              >
                                <SchoolIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {certificate.status === 'generated' && (
                            <>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownloadCertificate(certificate.id)}
                                  color="success"
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Kirim Email">
                                <IconButton
                                  size="small"
                                  onClick={() => handleSendCertificate(certificate.id)}
                                  color="info"
                                >
                                  <EmailIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateDialogOpen(false)}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CertificateManagement;
