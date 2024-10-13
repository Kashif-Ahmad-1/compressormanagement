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
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
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
  // textAlign: 'left',
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

const AccountantPage = () => {
  const [accountants, setAccountants] = useState([]);
  const [filteredAccountants, setFilteredAccountants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newAccountant, setNewAccountant] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    address: '',
  });
  const [editingAccountantId, setEditingAccountantId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem('token');

  const handleToggleSidebar = () => {
    setDrawerOpen((prev) => !prev);
  };

  const fetchAccountants = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/accountants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accountants');
      }

      const data = await response.json();
      setAccountants(data);
      setFilteredAccountants(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAccountants();
  }, [token]);

  useEffect(() => {
    const results = accountants.filter(accountant =>
      (accountant.name && accountant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (accountant.email && accountant.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (accountant.mobileNumber && accountant.mobileNumber.includes(searchQuery)) ||
      (accountant.address && accountant.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredAccountants(results);
  }, [searchQuery, accountants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAccountant((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingAccountantId
      ? `${API_BASE_URL}/api/users/${editingAccountantId}`
      : `${API_BASE_URL}/api/auth/register`;
    const method = editingAccountantId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newAccountant, role: 'accountant' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save accountant');
      }

      await fetchAccountants();
      toast.success(editingAccountantId ? 'Accountant updated successfully!' : 'Accountant added successfully!');
      setModalOpen(false);
      setNewAccountant({ name: '', email: '', password: '', mobileNumber: '', address: '' });
      setEditingAccountantId(null);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleEdit = (accountant) => {
    setNewAccountant({ 
      name: accountant.name, 
      email: accountant.email, 
      mobileNumber: accountant.mobileNumber, 
      address: accountant.address,
      password: '' // Set password to empty on edit
    });
    setEditingAccountantId(accountant._id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this accountant?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete accountant');
        }

        await fetchAccountants();
        toast.success('Accountant deleted successfully!');
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
            label="Name, Email, Mobile Number"
            variant="outlined"
            fullWidth
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <ButtonContainer>
            <Button variant="contained" color="primary" onClick={() => {
              setNewAccountant({ name: '', email: '', password: '', mobileNumber: '', address: '' });
              setEditingAccountantId(null);
              setModalOpen(true);
            }}>
              Add Accountant
            </Button>
          </ButtonContainer>

          {/* Modal for Add/Edit Accountant */}
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          >
            <Box sx={modalStyle}>
              <Typography variant="h6" align="center">{editingAccountantId ? 'Edit Accountant' : 'Add New Accountant'}</Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Name"
                  type="string"
                  name="name"
                  value={newAccountant.name}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required
                />
                <TextField
                 type="string"
                  label="Email"
                  name="email"
                  value={newAccountant.email}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required
                />
                <TextField
                  label="Password"
                  name="password"
                   type="string"
                  value={newAccountant.password}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required={!editingAccountantId} // Password required only on add
                />
                <TextField
                 type="string"
                  label="Mobile Number"
                  name="mobileNumber"
                  value={newAccountant.mobileNumber}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required
                />
                <TextField
                 type="string"
                  label="Address"
                  name="address"
                  value={newAccountant.address}
                  onChange={handleChange}
                  sx={{ mb: 1, width: '90%' }}
                  required
                />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                  {editingAccountantId ? 'Update Accountant' : 'Add Accountant'}
                </Button>
              </form>
            </Box>
          </Modal>
          <Card>
            <Typography sx={{ fontWeight: "bold" }} variant="h4">List Of All Existing Accountants</Typography>
            <Paper sx={{ overflowX: 'auto', mt: 2 }}>
          {/* Accountant List */}
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile Number</th>
                <th>Address</th>
                <th>Actions</th>
                <th>Send</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccountants.map(accountant => (
                <tr key={accountant._id}>
                  <td>{accountant.name}</td>
                  <td>{accountant.email}</td>
                  <td>{accountant.mobileNumber}</td>
                  <td>{accountant.address}</td>
                  <td>
                    <IconButton onClick={() => handleEdit(accountant)}>
                      <Edit />
                    </IconButton>

                    <IconButton onClick={() => handleDelete(accountant._id)}>
                      <Delete />
                    </IconButton>
                   
                  </td>
                  <td> <IconButton onClick={() => handleSendResetLink(accountant.email)}>
                      <Send />
                    </IconButton></td>
                </tr>
              ))}
            </tbody>
          </Table>
          </Paper>
          </Card>
        </Container>
        <ToastContainer />
      </MainContent>
    </Box>
  );
};

export default AccountantPage;
