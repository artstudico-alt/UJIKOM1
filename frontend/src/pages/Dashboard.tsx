import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
} from '@mui/material';
import { keyframes } from '@mui/system';
import {
  TrendingUp,
  People,
  Event,
  School,
  Download,
  MoreVert,
  FilterList,
  CalendarToday,
  AttachMoney,
  Visibility,
  PersonAdd,
  EventAvailable,
  Assessment,
  ArrowUpward,
  ArrowDownward,
  Circle,
  CheckCircle,
  Schedule,
  LocationOn,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import LoadingOverlay from '../components/common/LoadingOverlay';

// Define animations
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('Events');

  // Fetch dashboard statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats'),
    select: (response: any) => response.data.data,
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-charts', selectedYear],
    queryFn: () => api.get('/dashboard/chart-data', { params: { year: selectedYear } }),
    select: (response: any) => response.data.data,
  });

  // Prepare monthly data for charts
  const monthlyData = React.useMemo(() => {
    if (!chartData) return [];
    
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, index) => {
      const monthNumber = index + 1;
      const eventsData = (chartData as any)?.monthly_events?.find((item: any) => item.month === monthNumber);
      const participantsData = (chartData as any)?.monthly_participants?.find((item: any) => item.month === monthNumber);
      
      return {
        month,
        events: eventsData?.count || 0,
        participants: participantsData?.count || 0,
      };
    });
  }, [chartData]);

  // Prepare top events data
  const topEventsData = React.useMemo(() => {
    if (!(chartData as any)?.top_events) return [];
    
    return (chartData as any).top_events.map((event: any) => ({
      name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
      participants: event.event_participants_count || 0,
    }));
  }, [chartData]);

  // Mock data for rich dashboard
  const recentEvents = [
    { id: 1, name: 'Tech Conference 2024', date: '08 Aug 2024', price: '$12.70', status: 'Pending', avatar: '🎯' },
    { id: 2, name: 'Digital Marketing Summit', date: '08 Aug 2024', price: '$32.70', status: 'Complete', avatar: '📱' },
    { id: 3, name: 'Startup Networking', date: '08 Aug 2024', price: '$14.70', status: 'Complete', avatar: '🚀' },
    { id: 4, name: 'Web Development Workshop', date: '10 Aug 2024', price: '$25.00', status: 'Pending', avatar: '💻' },
    { id: 5, name: 'AI & Machine Learning Summit', date: '12 Aug 2024', price: '$45.00', status: 'Complete', avatar: '🤖' },
  ];

  const performanceData = [
    { name: 'Jan', events: 65, participants: 280, revenue: 15000 },
    { name: 'Feb', events: 59, participants: 320, revenue: 18000 },
    { name: 'Mar', events: 80, participants: 450, revenue: 25000 },
    { name: 'Apr', events: 81, participants: 520, revenue: 28000 },
    { name: 'May', events: 56, participants: 380, revenue: 22000 },
    { name: 'Jun', events: 55, participants: 420, revenue: 24000 },
  ];

  const eventStatusData = [
    { status: 'Upcoming', count: 24, color: '#2196f3', icon: '📅' },
    { status: 'Ongoing', count: 8, color: '#4caf50', icon: '🎪' },
    { status: 'Completed', count: 156, color: '#9e9e9e', icon: '✅' },
    { status: 'Cancelled', count: 3, color: '#f44336', icon: '❌' },
  ];

  const topEvents = [
    { name: 'Tech Summit 2024', registrations: 450, revenue: 22500, rating: 4.8 },
    { name: 'Digital Marketing Expo', registrations: 380, revenue: 19000, rating: 4.7 },
    { name: 'Startup Bootcamp', registrations: 320, revenue: 16000, rating: 4.9 },
    { name: 'AI Conference', registrations: 290, revenue: 14500, rating: 4.6 },
    { name: 'Web Dev Workshop', registrations: 250, revenue: 12500, rating: 4.5 },
  ];

  const recentActivity = [
    { action: 'New registration for Tech Conference', time: '2 mins ago', type: 'success' },
    { action: 'Payment received - $150', time: '5 mins ago', type: 'success' },
    { action: 'Event approved: Marketing Summit', time: '10 mins ago', type: 'info' },
    { action: 'Low ticket alert: Web Workshop', time: '15 mins ago', type: 'warning' },
    { action: 'New organizer registered', time: '20 mins ago', type: 'info' },
  ];

  const upcomingEvents = [
    { name: 'Product Launch Event', date: 'Tomorrow', time: '10:00 AM', attendees: 120 },
    { name: 'Tech Meetup #5', date: 'Oct 28', time: '2:00 PM', attendees: 85 },
    { name: 'Business Workshop', date: 'Oct 30', time: '9:00 AM', attendees: 65 },
  ];

  const handleExportData = async () => {
    try {
      const response = await api.get('/dashboard/export', {
        params: { year: selectedYear },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard_data_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (statsLoading || chartLoading) {
    return (
      <Box sx={{ position: 'relative', minHeight: '50vh' }}>
        <LoadingOverlay 
          open={true}
          message="Memuat data dashboard..."
          variant="overlay"
          spinnerVariant="gradient"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', width: '100%' }}>
      <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 3, lg: 3, xl: 4 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pt: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4f46e5', mb: 0.5 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d' }}>
            Your recent transaction activity and all
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value="September 23"
              sx={{ 
                bgcolor: 'white',
                '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #e0e0e0' }
              }}
            >
              <MenuItem value="September 23">📅 September 23</MenuItem>
              <MenuItem value="October 23">📅 October 23</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{ 
              borderColor: '#e0e0e0',
              color: '#6c757d',
              bgcolor: 'white',
              '&:hover': { borderColor: '#4f46e5', color: '#4f46e5' }
            }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, borderBottom: '1px solid #e0e0e0' }}>
          {['Events', 'Customer'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                textTransform: 'none',
                color: activeTab === tab ? '#4f46e5' : '#6c757d',
                borderBottom: activeTab === tab ? '2px solid #4f46e5' : 'none',
                borderRadius: 0,
                pb: 2,
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* @ts-ignore */}
        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0',
            position: 'relative',
            overflow: 'visible'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: '#4f46e515',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <Event sx={{ color: '#4f46e5', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6c757d', display: 'block' }}>
                  Available Event
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  150.00
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpward sx={{ color: '#4caf50', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                3% New deal
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: '#e8f5e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <People sx={{ color: '#4caf50', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6c757d', display: 'block' }}>
                  Total Orders
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4f46e5' }}>
                  11,000
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpward sx={{ color: '#4caf50', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                8% New Order
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: '#e3f2fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <AttachMoney sx={{ color: '#2196f3', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6c757d', display: 'block' }}>
                  Total Sales
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4f46e5' }}>
                  2,77000
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpward sx={{ color: '#4caf50', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                7.8% Coupon
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* @ts-ignore */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: '#f3e5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <TrendingUp sx={{ color: '#9c27b0', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6c757d', display: 'block' }}>
                  Total Profit
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4f46e5' }}>
                  35,000
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ArrowUpward sx={{ color: '#4caf50', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                6.8% Increase
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Event Status Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 2 }}>
          Event Status Overview
        </Typography>
        <Grid container spacing={3}>
          {eventStatusData.map((item, index) => (
            // @ts-ignore
            <Grid key={index} item xs={6} sm={6} md={3}>
              <Card sx={{ 
                p: 2.5, 
                bgcolor: 'white', 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${item.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    mr: 2
                  }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4f46e5' }}>
                      {item.count}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#6c757d', fontWeight: 500 }}>
                  {item.status} Events
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: 4, 
                  bgcolor: '#f0f0f0', 
                  borderRadius: 2, 
                  mt: 1.5,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    width: `${(item.count / 191) * 100}%`, 
                    height: '100%', 
                    bgcolor: item.color,
                    borderRadius: 2
                  }} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#4f46e5', mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {[
            { label: 'Create New Event', icon: '➕', color: '#4f46e5' },
            { label: 'Approve Pending', icon: '✓', color: '#4caf50' },
            { label: 'Send Notifications', icon: '🔔', color: '#ff9800' },
            { label: 'Generate Report', icon: '📊', color: '#4f46e5' },
            { label: 'Manage Users', icon: '👥', color: '#9c27b0' },
            { label: 'View Analytics', icon: '📈', color: '#00bcd4' },
          ].map((action, index) => (
            // @ts-ignore
            <Grid key={index} item xs={6} sm={4} md={2}>
              <Button
                fullWidth
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: 'white',
                  color: action.color,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 0.5, sm: 1 },
                  textTransform: 'none',
                  minHeight: { xs: 80, sm: 100 },
                  '&:hover': {
                    bgcolor: action.color,
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>{action.icon}</Typography>
                <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, fontWeight: 600 }}>
                  {action.label}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content Grid - Flexible Layout */}
      <Grid container spacing={3} sx={{ pb: 3 }}>
        {/* Left Column - Charts and Analytics */}
        {/* @ts-ignore */}
        <Grid item xs={12} lg={8}>
          {/* Total Revenue Chart */}
          <Card sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                Total Revenue
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <Box sx={{ width: '100%', height: { xs: 250, sm: 300, md: 320 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6c757d" fontSize={12} />
                  <YAxis stroke="#6c757d" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }} 
                  />
                  <Bar dataKey="events" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>

          {/* Bottom Row - Recent Events and Analytics */}
          <Grid container spacing={3}>
            {/* Recent Events */}
            {/* @ts-ignore */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', minHeight: { xs: 300, md: 350 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                    Recent Event
                  </Typography>
                  <Button sx={{ color: '#6c757d', fontSize: '0.875rem' }}>
                    →
                  </Button>
                </Box>
                <List sx={{ p: 0, flex: 1, overflow: 'auto' }}>
                  {recentEvents.map((event) => (
                    <ListItem key={event.id} sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#4f46e515', color: '#4f46e5', width: 40, height: 40 }}>
                          {event.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                            {event.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#6c757d' }}>
                            {event.date}
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                          {event.price}
                        </Typography>
                        <Chip
                          label={event.status}
                          size="small"
                          sx={{
                            bgcolor: event.status === 'Complete' ? '#e8f5e8' : '#fff3e0',
                            color: event.status === 'Complete' ? '#4caf50' : '#ff9800',
                            fontSize: '0.75rem',
                            mt: 0.5
                          }}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>

            {/* Top Performers */}
            {/* @ts-ignore */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', minHeight: { xs: 300, md: 350 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                    🏆 Top Performers
                  </Typography>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflow: 'auto' }}>
                  {topEvents.map((event, index) => (
                    <Box key={index} sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: '#f8f9fa',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#e9ecef',
                        transform: 'translateX(4px)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5', mb: 0.5 }}>
                            #{index + 1} {event.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip 
                              label={`${event.registrations} registrations`} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#4f46e515', 
                                color: '#4f46e5', 
                                fontSize: '0.7rem',
                                height: 20
                              }} 
                            />
                            <Chip 
                              label={`$${event.revenue.toLocaleString()}`} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#4caf5015', 
                                color: '#4caf50', 
                                fontSize: '0.7rem',
                                height: 20
                              }} 
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ fontSize: '0.875rem', color: '#ff9800' }}>⭐</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                            {event.rating}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - Performance and Customer Data */}
        {/* @ts-ignore */}
        <Grid item xs={12} lg={4}>
          {/* Performance Section */}
          <Card sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                Performance
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#4f46e5', mb: 1, fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
                2,375
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.875rem' }}>
                Keep your info organized to increase the number of interactions.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Event Count
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Percentage 36%
              </Typography>
            </Box>
          </Card>

          {/* Real-time Activity */}
          <Card sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                📡 Live Activity
              </Typography>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: '#4caf50',
                animation: 'pulse 2s infinite'
              }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 200, maxHeight: 300, overflow: 'auto' }}>
              {recentActivity.map((activity, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'start', 
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#f8f9fa',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#e9ecef'
                  }
                }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: activity.type === 'success' ? '#4caf50' : activity.type === 'warning' ? '#ff9800' : '#2196f3',
                    mt: 0.5,
                    flexShrink: 0
                  }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#4f46e5', fontSize: '0.875rem', mb: 0.5 }}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6c757d' }}>
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Upcoming Events Calendar */}
          <Card sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                📅 Upcoming Events
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {upcomingEvents.map((event, index) => (
                <Box key={index} sx={{ 
                  p: 2, 
                  borderLeft: '4px solid #4f46e5',
                  bgcolor: '#f8f9fa',
                  borderRadius: 1
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5', mb: 0.5 }}>
                    {event.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#6c757d' }}>
                      {event.date} • {event.time}
                    </Typography>
                    <Chip 
                      label={`${event.attendees} attendees`}
                      size="small"
                      sx={{ 
                        bgcolor: '#4f46e515',
                        color: '#4f46e5',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Your Customer */}
          <Card sx={{ p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                Your Customer
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4f46e5' }}>
                  3750
                </Typography>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  All Shop
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4f46e5' }}>
                  5410
                </Typography>
                <Typography variant="caption" sx={{ color: '#6c757d' }}>
                  Online Shop
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={75} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#4f46e5',
                  borderRadius: 4
                }
              }} 
            />
            <Button 
              fullWidth 
              sx={{ 
                mt: 2, 
                color: '#4f46e5', 
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              View More
            </Button>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
