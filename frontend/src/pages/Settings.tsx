import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Save, Notifications, Security, Person } from '@mui/icons-material';

const Settings: React.FC = () => {
  return (
    <Box sx={{
      overflow: 'hidden',
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
      '& *': {
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none'
      }
    }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Settings
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Profile Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Person sx={{ mr: 2, color: '#667eea' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Profile Settings
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField fullWidth label="Full Name" defaultValue="Admin User" />
              <TextField fullWidth label="Email" defaultValue="admin@example.com" />
              <TextField fullWidth label="Phone" defaultValue="+1234567890" />
              <Button
                variant="contained"
                startIcon={<Save />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Save Changes
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Notifications sx={{ mr: 2, color: '#f093fb' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Notification Settings
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email Notifications"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="SMS Notifications"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Switch />}
                label="Push Notifications"
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Manage how you receive notifications about events and updates.
            </Typography>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Security sx={{ mr: 2, color: '#4facfe' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Security Settings
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
              />
              <Button
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                }}
              >
                Change Password
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Settings;
