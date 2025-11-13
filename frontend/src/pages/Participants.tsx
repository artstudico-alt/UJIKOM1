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
import { Add, Search, Person } from '@mui/icons-material';

const Participants: React.FC = () => {
  const participants = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      status: 'Active',
      events: 3,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      status: 'Active',
      events: 2,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Participants
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              placeholder="Search participants..."
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
              Add Participant
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {participants.map((participant) => (
          <Card key={participant.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: '#667eea' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {participant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {participant.email}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {participant.phone}
                </Typography>
                <Chip
                  label={participant.status}
                  color="success"
                  size="small"
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {participant.events} events attended
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Participants;
