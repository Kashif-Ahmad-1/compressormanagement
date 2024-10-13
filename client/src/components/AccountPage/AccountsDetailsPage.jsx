import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {API_BASE_URL} from './../../config';
import logo from './comp-logo.jpeg';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
  Button,
  Divider,
  TextField,
  Box,
  AppBar,
  Toolbar,
  TablePagination,
  IconButton,
} from '@mui/material';
import { Add, Download, Menu } from '@mui/icons-material';
import AppointmentSidebar from './AppointmentSidebar';
import AddMachine from './AddMachine';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../Footer';

function AppointmentDetailsPage() {
  const [appointments, setAppointments] = useState([]);
  const [showAddClientFields, setShowAddClientFields] = useState(false);
  const [showAddMachineField, setShowAddMachineField] = useState(false);
  const [clientData, setClientData] = useState({ name: '', address: '', contact: '', mobileNo: '' });
  const [machineData, setMachineData] = useState({ name: '',modelNo: '', partNo: '', qty: '' });
  const [expandedRows, setExpandedRows] = useState([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerColor = '#ff4d30'; 
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/appointments/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAppointments(data);
      } catch (error) {
        console.error('Failed to fetch appointment data', error);
      }
    };

    fetchAppointments();
  }, []);

  const handleBackClick = () => {
    navigate('/account-add-client');
  };

  const handleAddClientClick = () => {
    setShowAddClientFields(!showAddClientFields);
  };

  



  const handleAddMachineClick = () => {
    setShowAddMachineField(!showAddMachineField);
  };

  const handleInputChange = (e) => {
    setClientData({
      ...clientData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddClientSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/companies`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: clientData.name,
          contactPerson: clientData.contact,
          mobileNo: clientData.mobileNo,
          clientAddress: clientData.address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create company');
      }

      const data = await response.json();
      console.log('Company created successfully:', data);
      toast.success('Client added successfully!');

      setClientData({ name: '', address: '', contact: '', mobileNo: '' });
      setShowAddClientFields(false);
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to add client. Please try again.');
    }
  };

  const handleMachineChange = (e) => {
    setMachineData({
      ...machineData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMachineSubmit = async (machineData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/machines`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineData),
      });
      if (!response.ok) {
        throw new Error('Failed to create machine');
      }
      console.log('Machine created successfully:', machineData);
      setShowAddMachineField(true);
      toast.success('Machine added successfully!');
    } catch (error) {
      console.error('Error creating machine:', error);
    }
  };

  const handleDownloadPDF = (cloudinaryUrl) => {
    const link = document.createElement("a");
    link.href = cloudinaryUrl;
    link.setAttribute("download", cloudinaryUrl.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const toggleRow = (index) => {
    setExpandedRows((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const Header = () => (
    <AppBar position="fixed" sx={{ backgroundColor: 'gray',width: '100%' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={toggleSidebar} sx={{ mr: 2 }}>
          <Menu />
        </IconButton>
        <img
        src={logo}
        alt="Company Logo"
        style={{ width: 40, height: 40, marginRight: 10 }} // Adjust size and margin as needed
      />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
        AEROLUBE ENGINEERS
        </Typography>
      </Toolbar>
    </AppBar>
  );

 

  return (
    <>
    <div style={{ display: 'flex' }}>
      <AppointmentSidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Container sx={{ padding: 0, width: '100%', overflowX: 'auto', display: 'flex', flexDirection: 'column', minHeight: '100vh',marginTop: "62px" }} maxWidth="xl">
        <Header />
        <ToastContainer />
        <Typography variant="h4" gutterBottom sx={{ marginTop: 2, fontWeight: 'bold' }}>
          Clients Details
        </Typography>
        <Box sx={{ 
  display: 'flex', 
  flexDirection: 'row', // Keep all buttons in one row
  justifyContent: 'space-between', 
  marginBottom: 2, 

}}>
  <Button 
    variant="contained" 
    color="primary" 
    onClick={handleBackClick} 
    sx={{ marginRight: 2 }} // No marginBottom needed
    startIcon={<Add />}
  >
    Create Invoice
  </Button>
  <Box sx={{ display: 'flex', flexDirection: 'row' }}> {/* Set to 'row' */}
    <Button 
      variant="contained" 
      color="secondary" 
      onClick={handleAddClientClick} 
      sx={{ marginRight: 2 }} // Maintain spacing between buttons
    >
      Add Client
    </Button>
    <Button 
      variant="contained" 
      color="success" 
      onClick={handleAddMachineClick} 
    >
      Add Machine
    </Button>
  </Box>
</Box>

        {showAddClientFields && (
          <Box sx={{ marginBottom: 2, p: 2, borderRadius: 1, boxShadow: 1, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h6">Add New Client</Typography>
            <TextField
              label="Client Name"
              name="name"
              value={clientData.name}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: 1 }}
            />
            <TextField
              label="Client Address"
              name="address"
              value={clientData.address}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: 1 }}
            />
            <TextField
              label="Contact Person"
              name="contact"
              value={clientData.contact}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: 1 }}
            />
            <TextField
              label="Mobile No."
              name="mobileNo"
              value={clientData.mobileNo}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: 1 }}
            />
            <Button variant="contained" color="primary" onClick={handleAddClientSubmit}>Submit</Button>
          </Box>
        )}
        {showAddMachineField && <AddMachine onSubmit={handleAddMachineSubmit} />}
        <Divider sx={{ marginY: 2 }} />
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 350 }}>
            <TableHead>
            <TableRow>
                  {[
                    'SR.No',
                    "Invoice No.",
                    "Client Name",
                    "Client Address",
                    'Contact Person',
                    
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontSize: "1rem",
                        fontWeight: "bold",
                        backgroundColor: "#007acc",
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                  {/* Additional headers visible only on larger screens */}
                  {[
                    'Mobile No.',
                    "Invoice Date",
                    "Invoice Amount",
                    "Machine Name",
                    "Model",
                    "Part No.",
                    "Serial No.",
                    "Installation Date",
                    "Service Frequency (Days)",
                    "Expected Service Date",
                   'Service Engineer',
                    "Document",
                    
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        display: { xs: "none", md: "table-cell" },
                        fontSize: "1rem",
                        fontWeight: "bold",
                        backgroundColor: "#007acc",
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
            </TableHead>
            <TableBody>
              {appointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((appointment, index) => (
                <React.Fragment key={appointment._id}>
                  <TableRow onClick={() => toggleRow(index)} sx={{ cursor: "pointer", '&:hover': { backgroundColor: '#e1f5fe' } }}>
                    <TableCell sx={{ fontSize: "1rem", fontWeight: "bold" }}>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell sx={{ fontSize: "1.2rem",
                          fontWeight: 700, }}>{appointment.invoiceNumber}</TableCell>
                    <TableCell sx={{ fontSize: "1rem",
                           }}>{appointment.clientName}</TableCell>
                    <TableCell sx={{ fontSize: "1rem",
                          }}>{appointment.clientAddress}</TableCell>
                    <TableCell sx={{ fontSize: "1rem",
                           }}>{appointment.contactPerson}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{appointment.mobileNo}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{new Date(appointment.appointmentDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{typeof appointment.appointmentAmount === 'number' ? `${appointment.appointmentAmount.toFixed(2)}` : 'N/A'}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{appointment.machineName}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{appointment.model}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{appointment.partNo}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{appointment.serialNo}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{new Date(appointment.installationDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{appointment.serviceFrequency}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{new Date(appointment.expectedServiceDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>{appointment.engineer ? appointment.engineer.name : 'N/A'}</TableCell>
                    <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}>
                      {appointment.document ? (
                        <Button variant="outlined" color="primary" onClick={() => handleDownloadPDF(appointment)}>
                          <Download />
                        </Button>
                      ) : (
                        <Typography variant="body2" color="textSecondary">No Document</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedRows.includes(index) && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          {/* Mobile Data */}
                          <Box
                            sx={{
                              padding: 2,
                              backgroundColor: "#ffffff",
                              borderRadius: 2,
                              boxShadow: 1,
                              marginBottom: 2,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                marginBottom: 1,
                                fontSize: "1.5rem",
                              }}
                            >
                              Contact Details
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ color: "#555", fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Mobile Number:</strong>{" "}
                              {appointment.mobileNo}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ color: "#555", fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Contact Person:</strong>{" "}
                              {appointment.contactPerson}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#555", fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Invoice Date:</strong>{" "}
                              {new Date(
                                appointment.appointmentDate
                              ).toLocaleDateString()}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#555", fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Invoice Amount:</strong>{" "}
                              {typeof appointment.appointmentAmount === "number"
                                ? `$${appointment.appointmentAmount.toFixed(2)}`
                                : "N/A"}
                            </Typography>

                            <Divider sx={{ marginY: 2 }} />

                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                marginBottom: 1,
                                fontSize: "1.5rem",
                              }}
                            >
                              Machine Details
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Machine Name:</strong>{" "}
                              {appointment.machineName}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Model:</strong> {appointment.model}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Part No:</strong> {appointment.partNo}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Serial No:</strong> {appointment.serialNo}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Installation Date:</strong>{" "}
                              {new Date(
                                appointment.installationDate
                              ).toLocaleDateString()}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Service Frequency:</strong>{" "}
                              {appointment.serviceFrequency}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Expected Service Date:</strong>{" "}
                              {new Date(
                                appointment.expectedServiceDate
                              ).toLocaleDateString()}
                            </Typography>


                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Service Engineer:</strong>{" "}
                              {appointment.engineer ? appointment.engineer.name : 'N/A'}
                            </Typography>

                          

                            <Divider sx={{ marginY: 2 }} />

                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                marginBottom: 1,
                                fontSize: "1.5rem",
                              }}
                            >
                              Documents
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Document:</strong>
                              {appointment.document ? (
                                <span
                                  onClick={() =>
                                    handleDownloadPDF(appointment.document)
                                  }
                                  style={{
                                    cursor: "pointer",
                                    color: "#007acc",
                                    textDecoration: "underline",
                                  }}
                                >
                                  <Download sx={{ color: "blue" }} />
                                </span>
                              ) : (
                                " No Document"
                              )}
                            </Typography>

                           
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={appointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          sx={{ marginTop: 2 }}
        />
         
      </Container>
      
    </div>
    <Footer />
    </>
  );
  
}

export default AppointmentDetailsPage;
