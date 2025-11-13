import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School as SchoolIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface Certificate {
  id: number;
  participantName: string;
  participantEmail: string;
  eventName: string;
  eventDate: string;
  issueDate: string;
  certificateNumber: string;
  status: 'issued' | 'sent' | 'downloaded' | 'pending';
  templateId: number;
  templateName: string;
}

interface CertificateTemplate {
  id: number;
  name: string;
  description: string;
  createdDate: string;
  usageCount: number;
  isActive: boolean;
}

const OrganizerCertificateManagement: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([
    // REAL DATA: Kosong sampai ada peserta yang menyelesaikan event dan mendapat sertifikat
    // Data akan diisi dari backend API berdasarkan peserta yang hadir di event organizer
  ]);

  const [templates, setTemplates] = useState<CertificateTemplate[]>([
    // REAL DATA: Kosong sampai organizer membuat template sertifikat
    // Data akan diisi dari backend API berdasarkan template yang dibuat organizer
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'issued': return 'primary';
      case 'sent': return 'success';
      case 'downloaded': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'issued': return 'Diterbitkan';
      case 'sent': return 'Terkirim';
      case 'downloaded': return 'Diunduh';
      default: return status;
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.participantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || cert.eventName === eventFilter;
    return matchesSearch && matchesStatus && matchesEvent;
  });

  const handleSendCertificate = (certificateId: number) => {
    setCertificates(certificates.map(cert => 
      cert.id === certificateId ? { ...cert, status: 'sent' as const } : cert
    ));
  };

  const handleBulkSend = () => {
    const issuedCertificates = certificates.filter(cert => cert.status === 'issued');
    setCertificates(certificates.map(cert => 
      cert.status === 'issued' ? { ...cert, status: 'sent' as const } : cert
    ));
    alert(`${issuedCertificates.length} sertifikat berhasil dikirim!`);
  };

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setOpenDialog(true);
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `Certificate_${certificate.certificateNumber}.pdf`;
    link.click();
    
    // Update status
    setCertificates(certificates.map(cert => 
      cert.id === certificate.id ? { ...cert, status: 'downloaded' as const } : cert
    ));
  };

  const handleDeleteTemplate = (templateId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      setTemplates(templates.filter(template => template.id !== templateId));
    }
  };

  const handleToggleTemplate = (templateId: number) => {
    setTemplates(templates.map(template => 
      template.id === templateId ? { ...template, isActive: !template.isActive } : template
    ));
  };

  // Statistics
  const totalCertificates = certificates.length;
  const sentCertificates = certificates.filter(cert => cert.status === 'sent').length;
  const downloadedCertificates = certificates.filter(cert => cert.status === 'downloaded').length;
  const pendingCertificates = certificates.filter(cert => cert.status === 'pending').length;

  const uniqueEvents = Array.from(new Set(certificates.map(cert => cert.eventName)));

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper sx={{ p: 4, borderRadius: 3, background: 'white', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Manajemen Sertifikat
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Kelola sertifikat peserta event
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<SendIcon />}
                onClick={handleBulkSend}
              >
                Kirim Semua
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => window.open('/organizer/certificate-builder', '_blank')}
                sx={{
                  background: 'linear-gradient(45deg, #4f46e5, #3730a3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3730a3, #312e81)',
                  }
                }}
              >
                Buat Template
              </Button>
            </Box>
          </Box>

          {/* Statistics Cards */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4
          }}>
            <Card sx={{ borderRadius: 2, border: '2px solid #4f46e520' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#4f46e515', color: '#4f46e5', mr: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#4f46e5">
                    {totalCertificates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sertifikat
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: '2px solid #10b98120' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#10b98115', color: '#10b981', mr: 2 }}>
                  <SendIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#10b981">
                    {sentCertificates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Terkirim
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: '2px solid #06b6d420' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#06b6d415', color: '#06b6d4', mr: 2 }}>
                  <DownloadIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#06b6d4">
                    {downloadedCertificates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Diunduh
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, border: '2px solid #f59e0b20' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b15', color: '#f59e0b', mr: 2 }}>
                  <CancelIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#f59e0b">
                    {pendingCertificates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Menunggu
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, background: 'white', mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 4, pt: 2 }}
          >
            <Tab label="Sertifikat" />
            <Tab label="Template" />
          </Tabs>

          {/* Certificates Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 4 }}>
              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  placeholder="Cari sertifikat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">Semua Status</MenuItem>
                    <MenuItem value="pending">Menunggu</MenuItem>
                    <MenuItem value="issued">Diterbitkan</MenuItem>
                    <MenuItem value="sent">Terkirim</MenuItem>
                    <MenuItem value="downloaded">Diunduh</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Event</InputLabel>
                  <Select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    label="Event"
                  >
                    <MenuItem value="all">Semua Event</MenuItem>
                    {uniqueEvents.map(event => (
                      <MenuItem key={event} value={event}>{event}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Certificates Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Peserta</strong></TableCell>
                      <TableCell><strong>Event</strong></TableCell>
                      <TableCell><strong>No. Sertifikat</strong></TableCell>
                      <TableCell><strong>Tanggal Terbit</strong></TableCell>
                      <TableCell><strong>Template</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Aksi</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCertificates.map((certificate) => (
                      <TableRow key={certificate.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: '#4f46e5' }}>
                              {certificate.participantName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="bold">{certificate.participantName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {certificate.participantEmail}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">{certificate.eventName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(certificate.eventDate).toLocaleDateString('id-ID')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontFamily="monospace" fontWeight="bold">
                            {certificate.certificateNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(certificate.issueDate).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={certificate.templateName} 
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusText(certificate.status)} 
                            color={getStatusColor(certificate.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewCertificate(certificate)}
                              sx={{ color: '#4f46e5' }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadCertificate(certificate)}
                              sx={{ color: '#06b6d4' }}
                            >
                              <DownloadIcon />
                            </IconButton>
                            {certificate.status === 'issued' && (
                              <IconButton 
                                size="small" 
                                onClick={() => handleSendCertificate(certificate.id)}
                                sx={{ color: '#10b981' }}
                              >
                                <SendIcon />
                              </IconButton>
                            )}
                            <IconButton 
                              size="small" 
                              onClick={() => window.open(`mailto:${certificate.participantEmail}`)}
                              sx={{ color: '#f59e0b' }}
                            >
                              <EmailIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Templates Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Template Sertifikat
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => window.open('/organizer/certificate-builder', '_blank')}
                >
                  Buat Template Baru
                </Button>
              </Box>

              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 3
              }}>
                {templates.map((template) => (
                  <Card key={template.id} sx={{ 
                    borderRadius: 3,
                    border: template.isActive ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: template.isActive ? '#4f46e5' : '#9ca3af', 
                          width: 48, 
                          height: 48 
                        }}>
                          <SchoolIcon />
                        </Avatar>
                        <Chip 
                          label={template.isActive ? 'Aktif' : 'Nonaktif'} 
                          color={template.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>

                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        {template.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {template.description}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2">
                          <strong>{template.usageCount}</strong> kali digunakan
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(template.createdDate).toLocaleDateString('id-ID')}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => window.open('/organizer/certificate-builder', '_blank')}
                          sx={{ color: '#4f46e5' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleTemplate(template.id)}
                          sx={{ color: template.isActive ? '#f59e0b' : '#10b981' }}
                        >
                          {template.isActive ? <CancelIcon /> : <CheckCircleIcon />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteTemplate(template.id)}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Certificate Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detail Sertifikat</DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: '#4f46e5', fontSize: '1.5rem' }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedCertificate.participantName}
                  </Typography>
                  <Typography color="text.secondary">
                    {selectedCertificate.participantEmail}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Event</Typography>
                  <Typography>{selectedCertificate.eventName}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Nomor Sertifikat</Typography>
                  <Typography fontFamily="monospace" fontWeight="bold">
                    {selectedCertificate.certificateNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Tanggal Event</Typography>
                  <Typography>
                    {new Date(selectedCertificate.eventDate).toLocaleDateString('id-ID')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Tanggal Terbit</Typography>
                  <Typography>
                    {new Date(selectedCertificate.issueDate).toLocaleDateString('id-ID')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Template</Typography>
                  <Typography>{selectedCertificate.templateName}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={getStatusText(selectedCertificate.status)} 
                    color={getStatusColor(selectedCertificate.status) as any}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Tutup</Button>
          {selectedCertificate && (
            <>
              <Button 
                variant="outlined"
                onClick={() => handleDownloadCertificate(selectedCertificate)}
              >
                Download
              </Button>
              <Button 
                variant="contained" 
                onClick={() => window.open(`mailto:${selectedCertificate.participantEmail}`)}
              >
                Kirim Email
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizerCertificateManagement;
