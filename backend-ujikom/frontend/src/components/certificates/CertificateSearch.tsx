import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import {
  Search,
  Download,
  VerifiedUser,
  Event,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import { certificateService } from '../../services/api';

// Interface untuk response API certificate search
interface CertificateSearchResult {
  id: number;
  certificate_number: string;
  certificate_url: string;
  issued_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  event: {
    id: number;
    title: string;
    event_date: string;
  };
}

const CertificateSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CertificateSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await certificateService.searchCertificates({
        search: searchQuery,
        page: 1,
        per_page: 10,
      });
      setSearchResults(response.data || []);
    } catch (err) {
      setError('Gagal mencari sertifikat. Silakan coba lagi.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownload = async (certificateId: number) => {
    try {
      const blob = await certificateService.downloadCertificate(certificateId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download certificate:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Fade in timeout={1000}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <VerifiedUser sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
                <Typography variant="h3" component="h1" fontWeight="bold" color="primary">
                  Pencarian Sertifikat
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary">
                Cari dan verifikasi sertifikat event yang telah diterbitkan
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* Search Section */}
        <Slide direction="up" in timeout={800}>
          <Card
            sx={{
              p: 4,
              mb: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom color="primary">
                Cari Sertifikat
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Masukkan nomor sertifikat, nama peserta, atau email untuk mencari sertifikat
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  label="Cari sertifikat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={isSearching}
                  startIcon={isSearching ? <CircularProgress size={20} /> : <Search />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                    },
                  }}
                >
                  {isSearching ? 'Mencari...' : 'Cari'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Slide>

        {/* Results Section */}
        {error && (
          <Slide direction="up" in timeout={600}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </Slide>
        )}

        {searchResults.length > 0 && (
          <Slide direction="up" in timeout={1000}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom color="primary">
                  Hasil Pencarian
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Ditemukan {searchResults.length} sertifikat
                </Typography>

                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>No. Sertifikat</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Peserta</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Event</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tanggal Terbit</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchResults.map((certificate, index) => (
                        <Grow in timeout={1000 + index * 200} key={certificate.id}>
                          <TableRow hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <VerifiedUser sx={{ mr: 1, color: 'success.main' }} />
                                {certificate.certificate_number}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ mr: 1, color: 'primary.main' }} />
                                {certificate.user.name}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Event sx={{ mr: 1, color: 'secondary.main' }} />
                                {certificate.event.title}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday sx={{ mr: 1, color: 'info.main' }} />
                                {formatDate(certificate.issued_at)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Download />}
                                onClick={() => handleDownload(certificate.id)}
                                sx={{ borderRadius: 2 }}
                              >
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        </Grow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Slide>
        )}

        {searchQuery && !isSearching && searchResults.length === 0 && !error && (
          <Slide direction="up" in timeout={800}>
            <Card
              sx={{
                p: 4,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <VerifiedUser sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Tidak ada sertifikat ditemukan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Coba dengan kata kunci yang berbeda atau periksa kembali nomor sertifikat Anda
                </Typography>
              </CardContent>
            </Card>
          </Slide>
        )}
      </Container>
    </Box>
  );
};

export default CertificateSearch;
