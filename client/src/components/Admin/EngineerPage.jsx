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
  Modal,
} from '@mui/material';
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Download, Delete, Edit, Send } from "@mui/icons-material";

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

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const EngineerPage = () => {
  const [engineers, setEngineers] = useState([]);
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newEngineer, setNewEngineer] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    address: '',
  });
  const [editingEngineerId, setEditingEngineerId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem('token');

  const handleToggleSidebar = () => {
    setDrawerOpen((prev) => !prev);
  };

  const fetchEngineers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/engineers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch engineers');
      }

      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEngineers(sortedData);
      setFilteredEngineers(sortedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEngineers();
  }, [token]);

  useEffect(() => {
    const results = engineers.filter(engineer =>
      (engineer.name && engineer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (engineer.email && engineer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (engineer.mobileNumber && engineer.mobileNumber.includes(searchQuery)) ||
      (engineer.address && engineer.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredEngineers(results);
  }, [searchQuery, engineers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEngineer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingEngineerId
      ? `${API_BASE_URL}/api/users/${editingEngineerId}`
      : `${API_BASE_URL}/api/auth/register`;
    const method = editingEngineerId ? 'PUT' : 'POST';

    const payload = { ...newEngineer, role: 'engineer' };
    if (!editingEngineerId && !newEngineer.password) {
      toast.error("Password is required for new users.");
      return;
    }

    if (editingEngineerId && !newEngineer.password) {
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
        throw new Error(errorData.message || 'Failed to save engineer');
      }

      await fetchEngineers();
      toast.success(editingEngineerId ? 'Engineer updated successfully!' : 'Engineer added successfully!');
      setModalOpen(false);
      setNewEngineer({ name: '', email: '', password: '', mobileNumber: '', address: '' });
      setEditingEngineerId(null);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleEdit = (engineer) => {
    setNewEngineer({ 
      name: engineer.name, 
      email: engineer.email, 
      mobileNumber: engineer.mobileNumber, 
      address: engineer.address,
      password: '' // Set password to empty on edit
    });
    setEditingEngineerId(engineer._id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this engineer?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete engineer');
        }

        await fetchEngineers();
        toast.success('Engineer deleted successfully!');
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
            label="Search"
            variant="outlined"
            fullWidth
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />

          <ButtonContainer>
            <Button variant="contained" color="primary" onClick={() => {
              setNewEngineer({ name: '', email: '', password: '', mobileNumber: '', address: '' });
              setEditingEngineerId(null);
              setModalOpen(true);
            }}>
              Add Engineer
            </Button>
          </ButtonContainer>

          {/* Modal for Add/Edit Engineer */}
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          >
            <Box sx={modalStyle}>
              <Typography variant="h6" align="center">{editingEngineerId ? 'Edit Engineer' : 'Add New Engineer'}</Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                type='string'
                  label="Name"
                  name="name"
                  value={newEngineer.name}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required
                />
                <TextField
                 type='string'
                  label="Email"
                  name="email"
                  value={newEngineer.email}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required
                />
                <TextField
                 
                  label="Password"
                  name="password"
                  type='string'
                  value={newEngineer.password}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required={!editingEngineerId} // Only required for new users
                />
                <TextField
                  type='string'
                  label="Mobile Number"
                  name="mobileNumber"
                  value={newEngineer.mobileNumber}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required
                />
                <TextField
                 type='string'
                  label="Address"
                  name="address"
                  value={newEngineer.address}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required
                />
                <Button type="submit" variant="contained" color="primary" sx={{ width: '90%' }}>
                  {editingEngineerId ? 'Update Engineer' : 'Add Engineer'}
                </Button>
              </form>
            </Box>
          </Modal>

          <Card>
            <Typography sx={{ fontWeight: "bold" }} variant="h4">List Of All Existing Engineers</Typography>
            <Paper sx={{ overflowX: 'auto', mt: 2 }}>
              <Table>
                <thead>
                  <tr>
                    <th>SR No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile Number</th>
                    <th>Address</th>
                    <th>Edit</th>
                    <th>Delete</th>
                    <th>Password Reset</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEngineers.map((engineer, index) => (
                    <tr key={engineer._id}>
                      <td>{index + 1}</td>
                      <td>{engineer.name}</td>
                      <td>{engineer.email}</td>
                      <td>{engineer.mobileNumber}</td>
                      <td>{engineer.address}</td>
                      <td>
                        <IconButton
                          variant="contained"
                          color="secondary"
                          sx={{ mr: 1 }}
                          onClick={() => handleEdit(engineer)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </td>
                      <td>
                        <IconButton
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(engineer._id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </td>
                      <td>
                        <IconButton
                          variant="contained"
                          color="secondary"
                          onClick={() => handleSendResetLink(engineer.email)}
                        >
                          <Send fontSize="small" />
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

export default EngineerPage;
