import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { Download, BarChart, PieChart, TrendingUp } from '@mui/icons-material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Reports & Analytics
      </Typography>

      {/* Report Controls */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, alignItems: 'center' }}>
          <Box>
            <TextField
              fullWidth
              select
              label="Report Type"
              defaultValue="events"
            >
              <MenuItem value="events">Events Report</MenuItem>
              <MenuItem value="participants">Participants Report</MenuItem>
              <MenuItem value="attendance">Attendance Report</MenuItem>
              <MenuItem value="certificates">Certificates Report</MenuItem>
            </TextField>
          </Box>
          <Box>
            <TextField
              fullWidth
              select
              label="Time Period"
              defaultValue="month"
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </TextField>
          </Box>
          <Box>
            <TextField
              fullWidth
              select
              label="Format"
              defaultValue="pdf"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </TextField>
          </Box>
          <Box>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Generate Report
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Analytics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ textAlign: 'center', p: 3 }}>
          <BarChart sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            24
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Total Events
          </Typography>
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            +12% from last month
          </Typography>
        </Card>
        <Card sx={{ textAlign: 'center', p: 3 }}>
          <PieChart sx={{ fontSize: 48, color: '#f093fb', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            1,234
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Active Participants
          </Typography>
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            +8% from last month
          </Typography>
        </Card>
        <Card sx={{ textAlign: 'center', p: 3 }}>
          <TrendingUp sx={{ fontSize: 48, color: '#43e97b', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            89%
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Average Attendance
          </Typography>
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            +5% from last month
          </Typography>
        </Card>
      </Box>

      {/* Quick Reports */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Quick Reports
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ mb: 2 }}
              >
                Events Summary
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ mb: 2 }}
              >
                Participants List
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ mb: 2 }}
              >
                Attendance Report
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ mb: 2 }}
              >
                Certificates Issued
              </Button>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Scheduled Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No scheduled reports configured.
            </Typography>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              }}
            >
              Schedule Report
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Reports;
