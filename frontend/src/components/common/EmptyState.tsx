import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { 
  Event, 
  People, 
  School, 
  Search,
  Add,
  EmojiEvents,
  Celebration,
} from '@mui/icons-material';

interface EmptyStateProps {
  type?: 'events' | 'participants' | 'certificates' | 'search' | 'general';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'general',
  title,
  message,
  actionLabel,
  onAction,
  showAction = true,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'events':
        return <Event sx={{ fontSize: 80, color: 'primary.main' }} />;
      case 'participants':
        return <People sx={{ fontSize: 80, color: 'success.main' }} />;
      case 'certificates':
        return <School sx={{ fontSize: 80, color: 'warning.main' }} />;
      case 'search':
        return <Search sx={{ fontSize: 80, color: 'info.main' }} />;
      default:
        return <EmojiEvents sx={{ fontSize: 80, color: 'primary.main' }} />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'events':
        return 'Belum Ada Event';
      case 'participants':
        return 'Belum Ada Peserta';
      case 'certificates':
        return 'Belum Ada Sertifikat';
      case 'search':
        return 'Tidak Ada Hasil';
      default:
        return 'Data Kosong';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'events':
        return 'Belum ada event yang tersedia saat ini. Event akan muncul di sini setelah ditambahkan.';
      case 'participants':
        return 'Belum ada peserta yang terdaftar. Peserta akan muncul di sini setelah mendaftar.';
      case 'certificates':
        return 'Belum ada sertifikat yang tersedia. Sertifikat akan muncul setelah event selesai.';
      case 'search':
        return 'Tidak ada hasil yang ditemukan untuk pencarian Anda. Coba kata kunci yang berbeda.';
      default:
        return 'Tidak ada data yang tersedia saat ini.';
    }
  };

  const getDefaultActionLabel = () => {
    switch (type) {
      case 'events':
        return 'Tambah Event';
      case 'search':
        return 'Cari Lagi';
      default:
        return 'Mulai Sekarang';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderRadius: 4,
        border: '2px dashed',
        borderColor: 'primary.main',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 20s ease-in-out infinite',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            animation: 'bounce 2s ease-in-out infinite',
          }}
        >
          {getIcon()}
        </Box>
        
        <Typography
          variant="h4"
          component="h3"
          gutterBottom
          fontWeight="bold"
          color="primary"
          sx={{ mb: 2 }}
        >
          {title || getDefaultTitle()}
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ 
            mb: 4, 
            maxWidth: 400, 
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          {message || getDefaultMessage()}
        </Typography>
        
        {showAction && onAction && (
          <Button
            variant="contained"
            size="large"
            startIcon={type === 'events' ? <Add /> : <Celebration />}
            onClick={onAction}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {actionLabel || getDefaultActionLabel()}
          </Button>
        )}
      </Box>
      
                        <style>{`
                    @keyframes bounce {
                      0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                      }
                      40% {
                        transform: translateY(-10px);
                      }
                      60% {
                        transform: translateY(-5px);
                      }
                    }
                    @keyframes float {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-20px); }
                    }
                  `}</style>
    </Paper>
  );
};

export default EmptyState;
