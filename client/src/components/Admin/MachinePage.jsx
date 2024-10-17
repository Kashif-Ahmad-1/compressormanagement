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
  MenuItem
} from '@mui/material';
import { API_BASE_URL } from './../../config';
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Edit, Delete, Add } from '@mui/icons-material';

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
    fontSize: '1.2rem',
    fontWeight: '400',
  },
  '& th': {
    backgroundColor: theme.palette.grey[200],
  },
}));

const ButtonContainer = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const PaginationContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(2),
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

const MachinePage = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMachine, setNewMachine] = useState({
    name: '',
    quantity: '',
    modelNo: '',
    partNo: '',
    serialNo: '',
    type: '' // New field
  });
  
  const [newSparePart, setNewSparePart] = useState({
    name: '',
    quantity: '',
    modelNo: '',
    partNo: '',
    price: '',
  });
  const [editingMachineId, setEditingMachineId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sparePartModalOpen, setSparePartModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [machinesPerPage] = useState(15);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/machines`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch machines');
        const data = await response.json();
        setMachines(data);
      } catch (error) {
        toast.error(error.message || 'Error fetching machines');
      }
    };

    fetchMachines();
  }, []);

  useEffect(() => {
    const results = machines.filter(machine =>
      (machine.name && machine.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (machine.quantity && machine.quantity.toString().includes(searchQuery)) ||
      (machine.modelNo && machine.modelNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (machine.partNo && machine.partNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (machine.serialNo && machine.serialNo.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredMachines(results);
  }, [searchQuery, machines]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMachine((prev) => ({ ...prev, [name]: value }));
  };

  const handleSparePartChange = (e) => {
    const { name, value } = e.target;
    setNewSparePart((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const machineData = {
      ...newMachine,
      createdAt: new Date().toISOString(),
    };

    if (editingMachineId) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/machines/${editingMachineId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(machineData),
        });
        if (!response.ok) throw new Error('Failed to update machine');
        const updatedMachine = await response.json();
        setMachines(prev => prev.map(machine => (machine._id === editingMachineId ? updatedMachine : machine)));
        toast.success('Machine updated successfully!');
      } catch (error) {
        toast.error(error.message || 'Error updating machine');
      }
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/api/machines`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(machineData),
        });
        if (!response.ok) throw new Error('Failed to add machine');
        const addedMachine = await response.json();
        setMachines(prev => [addedMachine, ...prev]);
        toast.success('Machine added successfully!');
      } catch (error) {
        toast.error(error.message || 'Error adding machine');
      }
    }

    setModalOpen(false);
    setNewMachine({ name: '', quantity: '', modelNo: '', partNo: '' });
    setEditingMachineId(null);
  };

  const handleEdit = (machine) => {
    setNewMachine(machine);
    setEditingMachineId(machine._id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${API_BASE_URL}/api/machines/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to delete machine');
        setMachines(prev => prev.filter(machine => machine._id !== id));
        toast.success('Machine deleted successfully!');
      } catch (error) {
        toast.error(error.message || 'Error deleting machine');
      }
    }
  };

  const handleAddSparePart = async (machineId) => {
    const token = localStorage.getItem('token');

    const sparePartData = {
      ...newSparePart,
      machineId: machineId,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/spareparts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sparePartData),
      });
      if (!response.ok) throw new Error('Failed to add spare part');
      const addedSparePart = await response.json();
      toast.success('Spare part added successfully!');
    } catch (error) {
      toast.error(error.message || 'Error adding spare part');
    }

    setSparePartModalOpen(false);
    setNewSparePart({ name: '', quantity: '', modelNo: '', partNo: '', price: '' });
  };

  // Pagination Logic
  const indexOfLastMachine = currentPage * machinesPerPage;
  const indexOfFirstMachine = indexOfLastMachine - machinesPerPage;
  const currentMachines = filteredMachines.slice(indexOfFirstMachine, indexOfLastMachine);
  const totalPages = Math.ceil(filteredMachines.length / machinesPerPage);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar open={drawerOpen} onClose={handleDrawerToggle} />
      <MainContent>
        <ToolbarSpacer />
        <Container>
        
          <SectionTitle variant="h4">Search By Type</SectionTitle>

          <TextField
            label="Machine Model Part No."
            variant="outlined"
            fullWidth
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <ButtonContainer>
            <Button variant="contained" onClick={() => setModalOpen(true)}>
              Add Machine
            </Button>
          </ButtonContainer>

          <Table>
            <thead>
              <tr>
                <th>Name</th>
                
                <th>Model No.</th>
                <th>Part No.</th>
                <th>Actions</th>
                <th>Spare Parts</th>
              </tr>
            </thead>
            <tbody>
              {currentMachines.map(machine => (
                <tr key={machine._id}>
                  <td>{machine.name}</td>
                  
                  <td>{machine.modelNo}</td>
                  <td>{machine.partNo}</td>
                  <td>
                    <IconButton onClick={() => handleEdit(machine)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(machine._id)}>
                      <Delete />
                    </IconButton>
                  </td>
                  <td>
                    <Button variant="outlined" onClick={() => {
                      setNewSparePart({ name: '', quantity: '', modelNo: '', partNo: '', price: '' });
                      setEditingMachineId(machine._id); 
                      setSparePartModalOpen(true);
                    }}>
                      Add Spare Part
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <PaginationContainer>
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <Typography>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </PaginationContainer>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Box sx={modalStyle}>
              <Typography variant="h6">{editingMachineId ? 'Edit Machine' : 'Add Machine'}</Typography>
              <form onSubmit={handleSubmit}>
              <TextField
  select
  label="Type"
  name="type"
  value={newMachine.type}
  onChange={handleChange}
  fullWidth
  required
>
  <MenuItem value="compressor">Compressor</MenuItem>
  <MenuItem value="dryer">Dryer</MenuItem>
  <MenuItem value="filter">Filter</MenuItem>
</TextField>

                <TextField
                type="string"
                  label="Name"
                  name="name"
                  value={newMachine.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
             
                <TextField
                type="string"
                  label="Model No."
                  name="modelNo"
                  value={newMachine.modelNo}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                type="string"
                  label="Part No."
                  name="partNo"
                  value={newMachine.partNo}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                type="string"
                  label="Serial No."
                  name="serialNo"
                  value={newMachine.serialNo}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained">
                  Submit
                </Button>
              </form>
            </Box>
          </Modal>

          <Modal open={sparePartModalOpen} onClose={() => setSparePartModalOpen(false)}>
  <Box sx={modalStyle}>
    <Typography variant="h6">Add Spare Part</Typography>
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      handleAddSparePart(editingMachineId);  // Use the machine ID stored in editingMachineId
    }}>
      <TextField
      type="string"
        label="Name"
        name="name"
        value={newSparePart.name}
        onChange={handleSparePartChange}
        fullWidth
        required
      />
      <TextField
      type="string"
        label="Quantity"
        name="quantity"
        value={newSparePart.quantity}
        onChange={handleSparePartChange}
        fullWidth
        required
        
      />
      <TextField
      type="string"
        label="Model No."
        name="modelNo"
        value={newSparePart.modelNo}
        onChange={handleSparePartChange}
        fullWidth
        required
      />
      <TextField
      type="string"
        label="Part No."
        name="partNo"
        value={newSparePart.partNo}
        onChange={handleSparePartChange}
        fullWidth
        required
      />
      <TextField
      type="string"
        label="Price"
        name="price"
        value={newSparePart.price}
        onChange={handleSparePartChange}
        fullWidth
        required
        
      />
      <Button type="submit" variant="contained">
        Add Spare Part
      </Button>
    </form>
  </Box>
</Modal>


          <ToastContainer />
          
        </Container>
      </MainContent>
    </Box>
  );
};

export default MachinePage;
