import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Avatar,
  Switch,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  AdminPanelSettings as AdminIcon,
  VerifiedUser as VerifiedIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { userService } from '../../services/api';
import { User } from '../../types';

const UserManagement: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerification, setFilterVerification] = useState('all');
  const [filterAdmin, setFilterAdmin] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    is_verified: false,
    role: 'user' as 'admin' | 'event_organizer' | 'user',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', page, rowsPerPage, searchTerm, filterVerification, filterAdmin],
    queryFn: () => userService.getUsers({
      page: page + 1,
      per_page: rowsPerPage,
      search: searchTerm,
      verification_status: filterVerification === 'all' ? undefined : filterVerification,
      admin_status: filterAdmin === 'all' ? undefined : filterAdmin,
    }),
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: { id: number; userData: Partial<User> }) =>
      userService.updateUser(data.id, data.userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSnackbar({
        open: true,
        message: 'User berhasil diperbarui',
        severity: 'success'
      });
      setEditDialogOpen(false);
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: `Gagal memperbarui user: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: (data: { user_ids: number[]; action: string }) =>
      userService.bulkAction(data.user_ids, data.action),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUsers([]);
      setSnackbar({
        open: true,
        message: data.message || 'Bulk action berhasil',
        severity: 'success'
      });
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: `Gagal melakukan bulk action: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    },
  });

  const users = usersData?.data || [];
  const totalUsers = usersData?.total || 0;

  const handleSearch = () => {
    setPage(0);
    refetch();
  };

  const handleFilterChange = () => {
    setPage(0);
    refetch();
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      setSnackbar({
        open: true,
        message: 'Pilih user terlebih dahulu',
        severity: 'warning'
      });
      return;
    }

    bulkActionMutation.mutate({ user_ids: selectedUsers, action });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      education: user.education || '',
      status: user.status,
      is_verified: user.is_verified,
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    updateUserMutation.mutate({
      id: selectedUser.id,
      userData: editForm,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Gagal memuat data users. Silakan coba lagi.
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h3" component="h1" fontWeight="bold" color="primary">
            User Management
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          Kelola semua user dalam sistem EventHub
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Search Users"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Verification Status</InputLabel>
              <Select
                value={filterVerification}
                label="Verification Status"
                onChange={(e) => {
                  setFilterVerification(e.target.value);
                  handleFilterChange();
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="unverified">Unverified</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Admin Status</InputLabel>
              <Select
                value={filterAdmin}
                label="Admin Status"
                onChange={(e) => {
                  setFilterAdmin(e.target.value);
                  handleFilterChange();
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="event_organizer">Event Organizer</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>

            <Button
              variant="outlined"
              onClick={() => refetch()}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                {selectedUsers.length} user(s) selected
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkAction('verify')}
                startIcon={<CheckIcon />}
              >
                Verify
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkAction('unverify')}
                startIcon={<CancelIcon />}
              >
                Unverify
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkAction('activate')}
                startIcon={<CheckIcon />}
              >
                Activate
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkAction('deactivate')}
                startIcon={<WarningIcon />}
              >
                Deactivate
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleBulkAction('delete')}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.length === users.length && users.length > 0}
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                      onChange={handleSelectAllUsers}
                    />
                  </TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verification</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          mr: 2, 
                          background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
                          color: 'white',
                          fontWeight: 700,
                          boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                          {user.email}
                        </Typography>
                        {user.phone && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                            {user.phone}
                          </Typography>
                        )}
                        {user.address && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                            {user.address}
                          </Typography>
                        )}
                        {user.education && (
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <SchoolIcon sx={{ mr: 1, fontSize: 16 }} />
                            {user.education}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={user.status === 'active' ? 'success' : user.status === 'inactive' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_verified ? 'Verified' : 'Unverified'}
                        color={user.is_verified ? 'success' : 'warning'}
                        size="small"
                        icon={user.is_verified ? <VerifiedIcon /> : <PersonIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                        color={user.role === 'admin' ? 'secondary' : user.role === 'event_organizer' ? 'primary' : 'default'}
                        size="small"
                        icon={user.role === 'admin' ? <AdminIcon /> : user.role === 'event_organizer' ? <VerifiedIcon /> : <PersonIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(user.created_at), 'dd MMM yyyy', { locale: id })}
                      </Typography>
                      {user.last_login_at && (
                        <Typography variant="caption" color="text.secondary">
                          Last: {format(new Date(user.last_login_at), 'dd MMM HH:mm', { locale: id })}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[15, 25, 50, 100]}
          />
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Email"
              fullWidth
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
            />
            <TextField
              label="Phone"
              fullWidth
              value={editForm.phone}
              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
            />
            <TextField
              label="Education"
              fullWidth
              value={editForm.education}
              onChange={(e) => setEditForm(prev => ({ ...prev, education: e.target.value }))}
            />
            <TextField
              label="Address"
              fullWidth
              multiline
              rows={3}
              value={editForm.address}
              onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.is_verified}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_verified: e.target.checked }))}
                />
              }
              label="Email Verified"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role}
                label="Role"
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'event_organizer' | 'user' }))}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="event_organizer">Event Organizer</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;
