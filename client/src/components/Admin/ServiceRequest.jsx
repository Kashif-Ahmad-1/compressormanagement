import React, { useEffect, useState } from 'react';
import {
  Box,
  CssBaseline,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
} from '@mui/material';
import {API_BASE_URL} from './../../config';
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled components
const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const ToolbarSpacer = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const Card = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'left',
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
}));

const StyledTable = styled(Table)(({ theme }) => ({
  '& th, & td': {
    padding: theme.spacing(1.5),
    textAlign: 'left',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& th': {
    backgroundColor: theme.palette.grey[200],
    fontWeight: 'bold',
    fontSize: '1.1rem', // Increased font size for header
  },
  '& td': {
    fontSize: '1rem', // Set a standard font size for table data
  },
  '& tr:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ServiceRequestPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const fetchServiceRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service requests');
      }

      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setServiceRequests(sortedData);
      setFilteredRequests(sortedData);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to fetch service requests.");
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, [token]);

  useEffect(() => {
    const results = serviceRequests.filter((request) =>
      request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.mobileNo.includes(searchTerm) ||
      (request.createdBy?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(results);
  }, [searchTerm, serviceRequests]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar open={drawerOpen} onClose={handleDrawerToggle} />
      <MainContent>
        <ToolbarSpacer />
        <Container>
          <SectionTitle variant="h4">Service Requests</SectionTitle>
          <TextField
            label="Search by Name, Mobile, or Email"
            variant="outlined"
            fullWidth
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Card>
            <TableContainer component={Paper}>
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell>Sr. No.</TableCell>
                    <TableCell>Client Name</TableCell>
                    <TableCell>Contact Person</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Accountant Name</TableCell>
                    <TableCell>Engineer Assigned</TableCell>
                    <TableCell>Invoice Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((request, index) => (
                      <TableRow key={request._id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{request.clientName}</TableCell>
                        <TableCell>{request.contactPerson}</TableCell>
                        <TableCell>{request.createdBy?.email || 'N/A'}</TableCell>
                        <TableCell>{request.mobileNo}</TableCell>
                        <TableCell>{request.createdBy?.name || 'N/A'}</TableCell>
                        <TableCell>{request.engineer?.name || 'N/A'}</TableCell>
                        <TableCell>{request.appointmentAmount}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No service requests available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </StyledTable>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRequests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>
      </MainContent>
      <ToastContainer />
    </Box>
  );
};

export default ServiceRequestPage;
