import React, { useEffect, useState } from 'react';
import {
  Box,
  CssBaseline,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { Edit, Delete, Send } from '@mui/icons-material';

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const ToolbarSpacer = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Card = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  overflowX: 'auto',
}));

const Table = styled('table')(({ theme }) => ({
  width: '100%',
  borderCollapse: 'collapse',
  '& th, & td': {
    padding: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: '1rem',
    fontWeight: '600',
  },
  '& th': {
    backgroundColor: theme.palette.grey[200],
  },
}));

const ButtonContainer = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SmallCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  margin: 'auto',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
}));

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ 
    name: '', 
    email: '', 
    password: '',
    mobileNumber: '', 
    address: ''
  });
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const token = localStorage.getItem('token');

  const handleToggleSidebar = () => {
    setDrawerOpen((prev) => !prev);
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/admins`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAdmins(sortedData);
      setFilteredAdmins(sortedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  useEffect(() => {
    const results = admins.filter(admin => 
      (admin.name && admin.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (admin.mobileNumber && admin.mobileNumber.includes(searchQuery)) ||
      (admin.address && admin.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredAdmins(results);
  }, [searchQuery, admins]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingAdminId 
      ? `${API_BASE_URL}/api/users/${editingAdminId}`
      : `${API_BASE_URL}/api/auth/register`;
    const method = editingAdminId ? 'PUT' : 'POST';

    const payload = { ...newAdmin, role: 'admin' };
    if (!editingAdminId && !newAdmin.password) {
      toast.error("Password is required for new users.");
      return;
    }

    if (editingAdminId && !newAdmin.password) {
      delete payload.password; // Omit password if not provided during update
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save admin');
      }

      await fetchAdmins();
      toast.success(editingAdminId ? 'Admin updated successfully!' : 'Admin added successfully!');
      setDialogOpen(false);
      setNewAdmin({ name: '', email: '', password: '', mobileNumber: '', address: '' });
      setEditingAdminId(null);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleEdit = (admin) => {
    setNewAdmin({ 
      name: admin.name, 
      email: admin.email, 
      mobileNumber: admin.mobileNumber, 
      address: admin.address,
      password: '' // Set password to empty on edit
    });
    setEditingAdminId(admin._id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete admin');
        }

        await fetchAdmins();
        toast.success('Admin deleted successfully!');
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    }
  };

  const handleSendResetLink = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Password reset email sent successfully!');
      } else {
        toast.error(data.message || 'Failed to send reset email.');
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('An error occurred while sending the reset email.');
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar onMenuClick={handleToggleSidebar} />
      <Sidebar open={drawerOpen} onClose={handleToggleSidebar} />
      <MainContent>
        <ToolbarSpacer />
        <Container>
          <SectionTitle variant="h4">Search By Type</SectionTitle>

          {/* Search Box */}
          <TextField
            label="Name , Email , Mobile Number"
            variant="outlined"
            fullWidth
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />

          <ButtonContainer>
            <Button variant="contained" color="primary" onClick={() => {
              setEditingAdminId(null);
              setNewAdmin({ name: '', email: '', password: '', mobileNumber: '', address: '' });
              setDialogOpen(true);
            }}>
              Add Admin
            </Button>
          </ButtonContainer>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>{editingAdminId ? 'Edit Admin' : 'Add New Admin'}</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <TextField
                 type="string"
                  label="Name"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '100%' }} 
                  required
                />
                <TextField
                 type="string"
                  label="Email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '100%' }}
                  required
                />
                <TextField
  label="Password"
  name="password"
   type="string"
  value={newAdmin.password}
  onChange={handleChange}
  sx={{ mb: 1, width: '100%' }}
  required={!editingAdminId} // Password required only on add
/>
                <TextField
                 type="string"
                  label="Mobile Number"
                  name="mobileNumber"
                  value={newAdmin.mobileNumber}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '100%' }}
                  required
                />
                <TextField
                 type="string"
                  label="Address"
                  name="address"
                  value={newAdmin.address}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '100%' }}
                  required
                />
                <DialogActions>
                  <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="contained" color="primary">
                    {editingAdminId ? 'Update Admin' : 'Add Admin'}
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <Typography sx={{ fontWeight: "bold" }} variant="h4">List Of All Existing Admins</Typography>
            <Paper sx={{ overflowX: 'auto', mt: 2 }}>
              <Table>
                <thead>
                  <tr>
                    <th>SR No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile Number</th>
                    <th>Address</th>
                    <th>Actions</th>
                    <th>Password Reset</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin, index) => (
                    <tr key={admin._id}>
                      <td>{index + 1}</td>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.mobileNumber}</td>
                      <td>{admin.address}</td>
                      <td>
                        <IconButton 
                          variant="contained" 
                          color="secondary" 
                          sx={{ mr: 1 }} 
                          onClick={() => handleEdit(admin)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          variant="outlined" 
                          color="error" 
                          onClick={() => handleDelete(admin._id)}
                        >
                          <Delete />
                        </IconButton>
                      </td>
                      <td>
                        <IconButton 
                          variant="contained" 
                          color="secondary" 
                          onClick={() => handleSendResetLink(admin.email)}
                        >
                          <Send />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          </Card>
        </Container>
      </MainContent>
      <ToastContainer /> 
    </Box>
  );
};

export default AdminList;
