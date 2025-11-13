import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Warning,
  Timer,
  Refresh,
} from '@mui/icons-material';

interface SessionTimeoutDialogProps {
  open: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

const SessionTimeoutDialog: React.FC<SessionTimeoutDialogProps> = ({
  open,
  timeRemaining,
  onExtend,
  onLogout,
}) => {
  const [countdown, setCountdown] = useState(Math.ceil(timeRemaining / 1000));

  useEffect(() => {
    setCountdown(Math.ceil(timeRemaining / 1000));
  }, [timeRemaining]);

  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (countdown / 60) * 100; // Assuming 1 minute warning

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      data-session-timeout-dialog
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          <Typography variant="h6" fontWeight="bold">
            Session Timeout Warning
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Sesi Anda akan berakhir dalam:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Timer color="warning" />
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {formatTime(countdown)}
            </Typography>
          </Box>
          <Typography variant="body2">
            Klik "Perpanjang Sesi" untuk melanjutkan atau "Logout" untuk keluar.
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Waktu tersisa:
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            color="warning"
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Untuk keamanan, sesi akan otomatis berakhir setelah 5 menit tidak ada aktivitas.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onLogout}
          variant="outlined"
          color="error"
          sx={{ minWidth: 100 }}
        >
          Logout
        </Button>
        <Button
          onClick={onExtend}
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          sx={{ 
            minWidth: 150,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          Perpanjang Sesi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutDialog;
