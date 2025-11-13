import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const features = [
  { feature: 'Akses ke semua event publik', user: true, organizer: true, enterprise: true },
  { feature: 'Pendaftaran event tanpa batas', user: true, organizer: true, enterprise: true },
  { feature: 'Download sertifikat', user: true, organizer: true, enterprise: true },
  { feature: 'Dukungan standar via email', user: true, organizer: true, enterprise: true },
  { feature: 'Upload dan kelola event Anda sendiri', user: false, organizer: true, enterprise: true },
  { feature: 'Dashboard analitik event', user: false, organizer: true, enterprise: true },
  { feature: 'Promosikan event Anda', user: false, organizer: '✓', enterprise: true },
  { feature: 'Dukungan prioritas (chat & email)', user: false, organizer: true, enterprise: true },
  { feature: 'Manajemen tim & role', user: false, organizer: false, enterprise: true },
  { feature: 'Branding kustom untuk halaman event', user: false, organizer: false, enterprise: true },
  { feature: 'Akses API & integrasi', user: false, organizer: false, enterprise: true },
  { feature: 'Dukungan khusus 24/7 & Manajer Akun', user: false, organizer: false, enterprise: true },
];

const FeatureComparisonTable: React.FC = () => {
  return (
    <Box sx={{ my: 8 }}>
      <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
        Perbandingan Fitur Rinci
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Table aria-label="feature comparison table" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 'bold', fontSize: '1.1rem', py: 2 } }}>
              <TableCell>Fitur</TableCell>
              <TableCell align="center">User</TableCell>
              <TableCell align="center">
                <Chip label="Event Organizer" color="primary" />
              </TableCell>
              <TableCell align="center">Enterprise</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((item) => (
              <TableRow key={item.feature} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                  {item.feature}
                </TableCell>
                <TableCell align="center">
                  {item.user ? <Tooltip title="Termasuk"><CheckCircleIcon color="success" /></Tooltip> : <Tooltip title="Tidak Termasuk"><RemoveCircleOutlineIcon color="disabled" /></Tooltip>}
                </TableCell>
                <TableCell align="center">
                  {item.organizer ? <Tooltip title="Termasuk"><CheckCircleIcon color="success" /></Tooltip> : <Tooltip title="Tidak Termasuk"><RemoveCircleOutlineIcon color="disabled" /></Tooltip>}
                </TableCell>
                <TableCell align="center">
                  {item.enterprise ? <Tooltip title="Termasuk"><CheckCircleIcon color="success" /></Tooltip> : <Tooltip title="Tidak Termasuk"><RemoveCircleOutlineIcon color="disabled" /></Tooltip>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FeatureComparisonTable;
