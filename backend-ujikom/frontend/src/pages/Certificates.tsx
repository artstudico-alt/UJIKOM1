import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  Button,
} from '@mui/material';
import { Add, Search, School, Download } from '@mui/icons-material';

const Certificates: React.FC = () => {
  const certificates = [
    {
      id: 1,
      participant: 'John Doe',
      event: 'Web Development Workshop',
      issuedDate: '2025-08-25',
      status: 'Issued',
      eventDate: '2025-08-20',
    },
    {
      id: 2,
      participant: 'Jane Smith',
      event: 'UI/UX Design Seminar',
      issuedDate: '2025-08-22',
      status: 'Issued',
      eventDate: '2025-08-18',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Certificates
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              placeholder="Search certificates..."
              InputProps={{
                startAdornment: <Search />,
              }}
            />
          </Box>
          <Box sx={{ minWidth: { xs: '100%', md: '200px' } }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Generate Certificate
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {certificates.map((cert) => (
          <Card key={cert.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: '#4facfe' }}>
                  <School />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {cert.participant}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cert.event}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Event Date: {cert.eventDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Issued: {cert.issuedDate}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={cert.status}
                  color="success"
                  size="small"
                />
                <Button
                  size="small"
                  startIcon={<Download />}
                  sx={{ color: '#667eea' }}
                >
                  Download
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Certificates;
