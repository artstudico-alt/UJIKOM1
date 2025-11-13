import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Pagination,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Certificate {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
  };
  certificate_number: string;
  issue_date: string;
  status: 'pending' | 'issued' | 'revoked';
  template: string;
  download_count: number;
}

const Certificates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const queryClient = useQueryClient();

  // Mock data for demonstration - Website baru, data kosong
  const mockCertificates: Certificate[] = [];

  // Filter certificates based on search and status
  const filteredCertificates = mockCertificates.filter(cert => {
    const matchesSearch = cert.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (certificateId: number, newStatus: string) => {
    // Implement status update logic
    setSnackbar({
      open: true,
      message: 'Status sertifikat berhasil diupdate',
      severity: 'success'
    });
  };

  const handleGenerateCertificate = (certificateId: number) => {
    // Implement certificate generation logic
    setSnackbar({
      open: true,
      message: 'Sertifikat berhasil digenerate',
      severity: 'success'
    });
  };

  const handleSendEmail = (certificateId: number) => {
    // Implement email sending logic
    setSnackbar({
      open: true,
      message: 'Email sertifikat berhasil dikirim',
      severity: 'success'
    });
  };

  const handleExport = async (format: 'xlsx' | 'csv') => {
    try {
      // Implement export functionality
      setSnackbar({
        open: true,
        message: `Data sertifikat berhasil diexport ke ${format.toUpperCase()}`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Gagal export data sertifikat',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'success';
      case 'pending': return 'warning';
      case 'revoked': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'issued': return 'Telah Dikeluarkan';
      case 'pending': return 'Menunggu';
      case 'revoked': return 'Dibatalkan';
      default: return status;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              Manajemen Sertifikat
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Kelola dan monitor semua sertifikat event di EventHub
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => {}} sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('xlsx')}
            >
              Export XLSX
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {filteredCertificates.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Sertifikat
                </Typography>
              </Box>
              <SchoolIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {filteredCertificates.filter(c => c.status === 'issued').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Telah Dikeluarkan
                </Typography>
              </Box>
              <CheckIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {filteredCertificates.filter(c => c.status === 'pending').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Menunggu
                </Typography>
              </Box>
              <CancelIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {filteredCertificates.reduce((sum, c) => sum + c.download_count, 0)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Download
                </Typography>
              </Box>
              <DownloadIcon sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Cari sertifikat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status Sertifikat</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status Sertifikat"
            >
              <MenuItem value="all">Semua Status</MenuItem>
              <MenuItem value="issued">Telah Dikeluarkan</MenuItem>
              <MenuItem value="pending">Menunggu</MenuItem>
              <MenuItem value="revoked">Dibatalkan</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Certificates Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Peserta</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Nomor Sertifikat</TableCell>
                  <TableCell>Tanggal Keluaran</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>Download</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCertificates.map((certificate) => (
                  <TableRow key={certificate.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {certificate.user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {certificate.user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {certificate.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {certificate.event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(certificate.event.date), 'dd MMM yyyy', { locale: id })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {certificate.certificate_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(certificate.issue_date), 'dd MMM yyyy', { locale: id })}
                      </Typography>
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
                        {certificate.template}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {certificate.download_count} kali
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Lihat Detail">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCertificate(certificate);
                              setDialogOpen(true);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {certificate.status === 'pending' && (
                          <>
                            <Tooltip title="Generate Sertifikat">
                              <IconButton
                                size="small"
                                onClick={() => handleGenerateCertificate(certificate.id)}
                                color="primary"
                              >
                                <SchoolIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Kirim Email">
                              <IconButton
                                size="small"
                                onClick={() => handleSendEmail(certificate.id)}
                                color="info"
                              >
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {certificate.status === 'issued' && (
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() => {}}
                              color="success"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Certificate Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detail Sertifikat - {selectedCertificate?.certificate_number}
        </DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Informasi Peserta</Typography>
                  <Typography variant="body2"><strong>Nama:</strong> {selectedCertificate.user.name}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {selectedCertificate.user.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>Informasi Event</Typography>
                  <Typography variant="body2"><strong>Event:</strong> {selectedCertificate.event.title}</Typography>
                  <Typography variant="body2"><strong>Tanggal:</strong> {format(new Date(selectedCertificate.event.date), 'dd MMM yyyy', { locale: id })}</Typography>
                  <Typography variant="body2"><strong>Lokasi:</strong> {selectedCertificate.event.location}</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>Informasi Sertifikat</Typography>
                  <Typography variant="body2"><strong>Nomor:</strong> {selectedCertificate.certificate_number}</Typography>
                  <Typography variant="body2"><strong>Tanggal Keluaran:</strong> {format(new Date(selectedCertificate.issue_date), 'dd MMM yyyy', { locale: id })}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {getStatusLabel(selectedCertificate.status)}</Typography>
                  <Typography variant="body2"><strong>Template:</strong> {selectedCertificate.template}</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>Statistik</Typography>
                  <Typography variant="body2"><strong>Download Count:</strong> {selectedCertificate.download_count} kali</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Certificates;
