import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
  Image as ImageIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

interface CertificateTemplateUploadProps {
  eventId?: number;
  existingTemplate?: string | null;
  onTemplateUploaded?: (templateUrl: string) => void;
}

interface TextPosition {
  x: number;
  y: number;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
}

const CertificateTemplateUpload: React.FC<CertificateTemplateUploadProps> = ({
  eventId,
  existingTemplate,
  onTemplateUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingTemplate || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Text position settings
  const [showSettings, setShowSettings] = useState(false);
  const [namePosition, setNamePosition] = useState<TextPosition>({
    x: 400,
    y: 350,
    fontSize: 32,
    color: '#000000',
    align: 'center',
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (PNG, JPG, JPEG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Pilih file terlebih dahulu');
      return;
    }

    setUploading(true);
    setError(null);

    // Simulate upload - In production, this will call certificateService.uploadTemplate()
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      if (onTemplateUploaded && previewUrl) {
        onTemplateUploaded(previewUrl);
      }
    }, 1500);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ImageIcon sx={{ mr: 1 }} />
        Template Sertifikat
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload template sertifikat untuk event ini. Desain template di Canva/Photoshop sebagai background image.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          Template berhasil diupload!
        </Alert>
      )}

      {/* Upload Area */}
      {!previewUrl ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'primary.main',
            bgcolor: 'primary.light',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'primary.lighter',
            },
          }}
          onClick={() => document.getElementById('template-file-input')?.click()}
        >
          <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Upload Template Sertifikat
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Klik atau drag file ke sini
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Format: PNG, JPG, JPEG (Max 5MB)
          </Typography>
          <input
            id="template-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </Paper>
      ) : (
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardMedia
            component="img"
            image={previewUrl}
            alt="Certificate Template"
            sx={{ maxHeight: 400, objectFit: 'contain', bgcolor: '#f5f5f5' }}
          />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => window.open(previewUrl, '_blank')}
              >
                Preview
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleRemove}
              >
                Hapus
              </Button>
              {selectedFile && !success && (
                <Button
                  variant="contained"
                  startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Template'}
                </Button>
              )}
              {success && (
                <Tooltip title="Template sudah diupload">
                  <Button variant="contained" color="success" startIcon={<CheckIcon />} disabled>
                    Berhasil
                  </Button>
                </Tooltip>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Text Position Settings (Optional - will be expanded later) */}
      {previewUrl && showSettings && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Pengaturan Text Sertifikat
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Atur posisi text nama peserta pada template
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <TextField
              label="Position X"
              type="number"
              fullWidth
              value={namePosition.x}
              onChange={(e) => setNamePosition({ ...namePosition, x: Number(e.target.value) })}
              size="small"
            />
            <TextField
              label="Position Y"
              type="number"
              fullWidth
              value={namePosition.y}
              onChange={(e) => setNamePosition({ ...namePosition, y: Number(e.target.value) })}
              size="small"
            />
            <TextField
              label="Font Size"
              type="number"
              fullWidth
              value={namePosition.fontSize}
              onChange={(e) => setNamePosition({ ...namePosition, fontSize: Number(e.target.value) })}
              size="small"
            />
            <TextField
              label="Color"
              type="color"
              fullWidth
              value={namePosition.color}
              onChange={(e) => setNamePosition({ ...namePosition, color: e.target.value })}
              size="small"
            />
          </Box>
        </Paper>
      )}

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          Cara Membuat Template:
        </Typography>
        <Typography variant="body2" component="div">
          1. Design template di Canva/Photoshop dengan ukuran A4 landscape (29.7cm x 21cm)<br />
          2. Buat background dan dekorasi sertifikat<br />
          3. Sisakan ruang kosong untuk nama peserta, tanggal, dan nomor sertifikat<br />
          4. Export sebagai PNG atau JPG<br />
          5. Upload template di sini<br />
          6. Sistem akan otomatis menambahkan text nama peserta dan data event
        </Typography>
      </Alert>
    </Box>
  );
};

export default CertificateTemplateUpload;
