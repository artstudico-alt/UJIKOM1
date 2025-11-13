import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  School,
  Download,
  Visibility,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../../services/api';
import api from '../../services/api';
import { Certificate } from '../../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const MyCertificates: React.FC = () => {
  const {
    data: certificatesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => eventService.getMyCertificates(),
  });

  const certificates = certificatesResponse?.data || [];

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: id });
  };

  const handleDownload = async (certificate: any) => {
    try {
      const response = await api.get(`/certificates/${certificate.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificate.certificate_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleView = (certificate: any) => {
    // Open certificate verification page
    window.open(`/certificates/verify/${certificate.certificate_number}`, '_blank');
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Gagal memuat sertifikat Anda. Silakan coba lagi.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Sertifikat Saya
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Daftar sertifikat yang telah Anda peroleh
        </Typography>

        {certificates.length === 0 ? (
          <Alert severity="info">
            Anda belum memiliki sertifikat. Ikuti event dan isi daftar hadir untuk mendapatkan sertifikat.
          </Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {certificates.map((certificate: Certificate) => (
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <School sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Sertifikat
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {certificate.certificate_number}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2, flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {(certificate as any).event?.title || 'Event Title'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Event: {formatDate((certificate as any).event?.date || certificate.issued_at)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircle sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Diterbitkan: {formatDate(certificate.issued_at)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          Status: Telah Diverifikasi
                        </Typography>
                      </Box>

                      {(certificate as any).attendance && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CheckCircle sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" color="primary.main">
                            Kehadiran: {formatDate((certificate as any).attendance.time_in)}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        fullWidth
                        onClick={() => handleView(certificate)}
                      >
                        Lihat
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        fullWidth
                        onClick={() => handleDownload(certificate)}
                      >
                        Download
                      </Button>
                    </Box>
                                  </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MyCertificates;
