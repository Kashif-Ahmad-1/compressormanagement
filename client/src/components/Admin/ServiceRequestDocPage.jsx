import React, { useEffect, useState } from "react";
import {
  Box,
  CssBaseline,
  Container,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
} from "@mui/material";

import MessageTemplate from "../MessageTemplate";
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
import logo from './comp-logo.jpeg';
import { styled } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download, Menu, Delete,Send } from "@mui/icons-material"; 
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import axios from "axios";
const MainContent = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
}));

const ToolbarSpacer = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Card = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
  overflowX: "auto",
}));

const Table = styled("table")(({ theme }) => ({
  width: "100%",
  borderCollapse: "collapse",
  "& th, & td": {
    padding: theme.spacing(1),
    // textAlign: "left",
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontSize: "1rem",
    fontWeight: "600",
  },
  "& th": {
    backgroundColor: theme.palette.grey[200],
  },
}));

const ServiceRequestDocPage = () => {
  const [checklists, setChecklists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);


  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);



  const fetchServiceRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/checklist`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch service requests");
      }

      const data = await response.json();
      const sortedChecklists = data.sort((a, b) => new Date(b.generatedOn) - new Date(a.generatedOn));
      setChecklists(sortedChecklists);
    } catch (error) {
      toast.error(error.message || "Error fetching service requests!");
    }
  };

  const handleDownloadPDF = (cloudinaryUrl) => {
    const link = document.createElement("a");
    link.href = cloudinaryUrl; // Use the Cloudinary URL directly
    link.setAttribute("download", cloudinaryUrl.split("/").pop()); // Extract file name from URL
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  const handleDeleteChecklist = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to delete a checklist.");
        return;
      }
  
      const response = await fetch(`${API_BASE_URL}/api/checklist/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorMessage = await response.json(); // Assuming the server returns a JSON error message
        throw new Error(errorMessage.message || "Failed to delete checklist");
      }
  
      setChecklists((prevChecklists) => prevChecklists.filter((checklist) => checklist._id !== id));
      toast.success("Checklist deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Error deleting checklist!");
    }
  };
  

  // Search functionality
  const filteredChecklists = checklists.filter((checklist) => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    return (
      checklist.clientInfo?.name.toLowerCase().includes(lowerCaseTerm) ||
      checklist.invoiceNo.toLowerCase().includes(lowerCaseTerm) ||
      checklist.clientInfo?.contactPerson?.toLowerCase().includes(lowerCaseTerm) ||
      checklist.clientInfo?.phone?.toLowerCase().includes(lowerCaseTerm)
    );
  });

  // Pagination logic
  const indexOfLastChecklist = currentPage * itemsPerPage;
  const indexOfFirstChecklist = indexOfLastChecklist - itemsPerPage;
  const currentChecklists = filteredChecklists.slice(indexOfFirstChecklist, indexOfLastChecklist);
  const totalPages = Math.ceil(filteredChecklists.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSendPdfToMobile = async (pdfUrl, mobileNumber) => {
    try {
      // Fetch templates from the backend
      const response = await axios.get(`${API_BASE_URL}/api/templates`); 
      const { template1 } = response.data; 
  
      // Use the message template function with the PDF URL
      const message = MessageTemplate(pdfUrl, template1); // Replace {pdfUrl} with the actual URL
  
      const responseWhatsapp = await axios.post(WHATSAPP_CONFIG.url, {
        receiverMobileNo: mobileNumber,
        message: [message], // Send the final message as an array
      }, {
        headers: {
          'x-api-key': WHATSAPP_CONFIG.apiKey, // Use the API key from the config
          'Content-Type': 'application/json',
        },
      });
  
      toast.success("PDF sent to mobile successfully!");
    } catch (error) {
      toast.error("Error sending PDF to mobile!");
      console.error("WhatsApp Error:", error);
    }
  };
  

  
  
  
  

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar open={drawerOpen} onClose={handleDrawerToggle} />
      <MainContent>
       
        <ToolbarSpacer />
        <Container>
          <SectionTitle variant="h4">Search By Type</SectionTitle>
          <Card>
            <TextField
              variant="outlined"
              placeholder="Search by Client Name, Invoice No, Contact Person, or Phone"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
            />
            <Typography  variant="h4" sx={{ marginTop: 2 , fontWeight:"bold"}}>
              Service Requests
            </Typography>
            <Paper sx={{ overflowX: "auto", mt: 2 }}>
              <Table>
                <thead>
                  <tr>
                    <th>SR No</th>
                    <th>Invoice No</th>
                    <th>Client Name</th>
                    <th>Contact Person</th>
                    <th>Mobile Number</th>
                    <th>Engineer</th>
                    <th>Document</th>
                    <th>Actions</th>
                    <th>Send</th>
                  </tr>
                </thead>
                <tbody>
                  {currentChecklists.length > 0 ? (
                    currentChecklists.map((checklist, index) => (
                      <tr key={checklist._id}>
                        <td>{index + 1 + indexOfFirstChecklist}</td>
                        <td>{checklist.invoiceNo || "N/A"}</td>
                        <td>{checklist.clientInfo?.name || "N/A"}</td>
                        <td>{checklist.clientInfo?.contactPerson || "N/A"}</td>
                        <td>{checklist.clientInfo?.phone || "N/A"}</td>
                        <td>{checklist.clientInfo?.engineer || "N/A"}</td>
                        <td>
                          <IconButton
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDownloadPDF(checklist.pdfPath)}
                          >
                            <Download />
                          </IconButton>
                        </td>
                        <td>
                          <IconButton
                            variant="contained"
                            color="error"
                            onClick={() => handleDeleteChecklist(checklist._id)}
                          >
                            <Delete />
                          </IconButton>
                        </td>

                        <td>
                          <IconButton
                            variant="contained"
                            color="primary"
                            onClick={() => handleSendPdfToMobile(checklist.pdfPath, checklist.clientInfo?.phone)}
                            size="small"
                          >
                            <Send />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center" }}>
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Paper>
            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Typography variant="body1">
                Page {currentPage} of {totalPages}
              </Typography>
              <Button
                variant="contained"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Box>
          </Card>
        </Container>
      </MainContent>
      <ToastContainer />
    </Box>
  );
};

export default ServiceRequestDocPage;
