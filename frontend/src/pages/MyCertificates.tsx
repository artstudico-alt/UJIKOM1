import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import certificateService, { Certificate } from '../services/certificateService';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const MyCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await certificateService.getMyCertificates();
      setCertificates(data);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      setError(err.response?.data?.message || 'Gagal memuat sertifikat');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    try {
      setDownloading(certificate.id);
      const filename = `Sertifikat_${certificate.event.title.replace(/\s+/g, '_')}_${certificate.participant_name.replace(/\s+/g, '_')}.pdf`;
      await certificateService.downloadCertificateFile(certificate.id, filename);
      
      // Refresh certificates to update download count
      await fetchCertificates();
    } catch (err: any) {
      console.error('Error downloading certificate:', err);
      alert(err.response?.data?.message || 'Gagal download sertifikat');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'd MMMM yyyy', { locale: idLocale });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Memuat sertifikat...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrophyIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" fontWeight="bold">
            Sertifikat Saya
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Semua sertifikat dari event yang pernah Anda ikuti
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: 'background.default',
            border: '2px dashed',
            borderColor: 'divider',
          }}
        >
          <TrophyIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Belum Ada Sertifikat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Anda belum memiliki sertifikat. Ikuti event dan selesaikan untuk mendapatkan sertifikat.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {certificates.map((certificate) => (
            <Box key={certificate.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    elevation: 6,
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Certificate Number */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Chip
                      label={certificate.certificate_number}
                      size="small"
                      sx={{ fontFamily: 'monospace', bgcolor: 'primary.light', color: 'primary.contrastText' }}
                    />
                    {certificate.download_count > 0 && (
                      <Chip
                        label={`Downloaded ${certificate.download_count}x`}
                        size="small"
                        variant="outlined"
                        color="success"
                      />
                    )}
                  </Box>

                  {/* Participant Name */}
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {certificate.participant_name}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Event Info */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight="medium">
                        {certificate.event.title}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(certificate.event.date)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {certificate.event.location}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Generated Date */}
                  {certificate.generated_at && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                      Diterbitkan: {formatDate(certificate.generated_at)}
                    </Typography>
                  )}
                </CardContent>

                {/* Download Button */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={downloading === certificate.id ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    disabled={!certificate.is_ready || downloading === certificate.id}
                    onClick={() => handleDownload(certificate)}
                    sx={{ textTransform: 'none' }}
                  >
                    {downloading === certificate.id
                      ? 'Mengunduh...'
                      : certificate.is_ready
                      ? 'Download Sertifikat'
                      : 'Belum Tersedia'}
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Summary */}
      {certificates.length > 0 && (
        <Paper elevation={0} sx={{ mt: 4, p: 3, bgcolor: 'primary.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrophyIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h6" color="primary.main">
              Total {certificates.length} Sertifikat
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default MyCertificates;
