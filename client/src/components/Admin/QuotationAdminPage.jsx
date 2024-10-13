import React, { useEffect, useState } from "react";
import logo from "./comp-logo.jpeg";
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
  Modal,
} from "@mui/material";
import MessageTemplate from "../MessageTemplate";
import {API_BASE_URL,WHATSAPP_CONFIG} from "./../../config";
import { styled } from "@mui/material/styles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download, Menu, Delete, Edit, Send } from "@mui/icons-material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
    fontSize: "1rem", // Smaller font for mobile
    fontWeight: "600",
  },
  "& th": {
    backgroundColor: theme.palette.grey[200],
  },
}));

const QuotationAdminPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Items per page
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentQuotation, setCurrentQuotation] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    quotationNo: "",
    clientName: "",
    contactPerson: "",
    phone: "",
    amount: "",
    status: false,
  });
  // Function to toggle the sidebar visibility
  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Function to handle drawer toggle
  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    setFilteredQuotations(
      quotations.filter(
        (quotation) =>
          quotation.clientInfo.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          quotation.quotationNo
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          quotation.clientInfo.contactPerson
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    );
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, quotations]);

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in.");
      }

      const response = await fetch(`${API_BASE_URL}/api/quotations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch quotations: ${response.status} - ${errorData.message}`
        );
      }

      const data = await response.json();
      const validData = data.filter((quotation) => quotation.clientInfo);
      validData.sort(
        (a, b) => new Date(b.generatedOn) - new Date(a.generatedOn)
      );
      setQuotations(validData);
    } catch (error) {
      toast.error(error.message || "Error fetching quotations!");
    }
  };

  const handleStatusUpdate = async (quotation) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/quotations/${quotation._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Quotation status updated!");
      fetchQuotations();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const method = currentQuotation ? "PUT" : "POST";
      const url = currentQuotation
        ? `${API_BASE_URL}/api/quotations/${currentQuotation._id}`
        : `${API_BASE_URL}/api/quotations`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quotationNo: formData.quotationNo,
          clientInfo: {
            name: formData.clientName,
            contactPerson: formData.contactPerson,
            phone: formData.phone,
          },
          quotationAmount: formData.amount,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save quotation");
      }

      toast.success(
        `Quotation ${currentQuotation ? "updated" : "added"} successfully!`
      );
      fetchQuotations();
      closeModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openModal = (quotation = null) => {
    setCurrentQuotation(quotation);
    setFormData({
      quotationNo: quotation ? quotation.quotationNo : "",
      clientName: quotation ? quotation.clientInfo.name : "",
      contactPerson: quotation ? quotation.clientInfo.contactPerson : "",
      phone: quotation ? quotation.clientInfo.phone : "",
      amount: quotation ? quotation.quotationAmount : "",
      status: quotation ? quotation.status : false,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentQuotation(null);
  };

  const handleDownloadPDF = (cloudinaryUrl) => {
    const link = document.createElement("a");
    link.href = cloudinaryUrl;
    link.setAttribute("download", cloudinaryUrl.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Pagination logic
  const indexOfLastQuotation = currentPage * itemsPerPage;
  const indexOfFirstQuotation = indexOfLastQuotation - itemsPerPage;
  const currentQuotations = filteredQuotations.slice(
    indexOfFirstQuotation,
    indexOfLastQuotation
  );
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);

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

  const handleDeleteQuotation = async (quotationId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quotation?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/quotations/${quotationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete quotation");
      }

      toast.success("Quotation deleted successfully!");
      fetchQuotations();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSendPdfToMobile = async (pdfUrl, mobileNumber) => {
    try {
      // Fetch templates from the backend
      const response = await axios.get(`${API_BASE_URL}/api/templates`); 
      const { template2 } = response.data; 
  
      // Use the message template function with the PDF URL
      const message = MessageTemplate(pdfUrl, template2); // Replace {pdfUrl} with the actual URL
  
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

  const handleExpandRow = (index) => {
    const newExpandedRows = expandedRows.includes(index)
      ? expandedRows.filter((i) => i !== index)
      : [...expandedRows, index];
    setExpandedRows(newExpandedRows);
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
              placeholder="Search by Client Name, Quotation No, or Contact Person"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{ marginBottom: 2 }} // Margin for better spacing
            />
            <Typography sx={{ fontWeight: "bold" }} variant="h4">
              List Of Exisitings Quotations
            </Typography>
            <Paper sx={{ overflowX: "auto", mt: 2 }}>
              <Table>
                <thead>
                  <tr>
                    <th>SR No</th>
                    <th>Quotation No</th>
                    <th>Client</th>
                    <th>Contact Person</th>
                    {window.innerWidth > 600 && <th>Mobile Number</th>}
                    <th>Quotation Amount (Rs)</th>
                    {window.innerWidth > 600 && <th>Engineer</th>}
                    <th>Status</th>
                    {window.innerWidth > 600 && <th>Quotation Document</th>}
                    {window.innerWidth > 600 && <th>Send</th>}

                    {/* Hide this column on mobile */}
                    {window.innerWidth > 600 && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentQuotations.length > 0 ? (
                    currentQuotations.map((quotation, index) => (
                      <React.Fragment key={quotation._id}>
                        <tr
                          onClick={() => handleExpandRow(index)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            {index + 1 + (currentPage - 1) * itemsPerPage}
                          </td>
                          <td>{quotation.quotationNo}</td>
                          <td>{quotation.clientInfo.name}</td>
                          <td>{quotation.clientInfo.contactPerson}</td>
                          {window.innerWidth > 600 && (
                            <td>{quotation.clientInfo.phone}</td>
                          )}
                          <td>{quotation.quotationAmount}</td>
                          {window.innerWidth > 600 && (
                            <td>{quotation.clientInfo.engineer}</td>
                          )}

                          <td>
                            <Button
                              variant="contained"
                              color={quotation.status ? "success" : "warning"}
                              onClick={() => handleStatusUpdate(quotation)}
                              size="small"
                            >
                              {quotation.status ? "Complete" : "Pending"}
                            </Button>
                          </td>
                          {window.innerWidth > 600 && (
                            <td>
                              {" "}
                              <IconButton
                                variant="contained"
                                color="secondary"
                                onClick={() =>
                                  handleDownloadPDF(quotation.pdfPath)
                                }
                                size="small"
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </td>
                          )}
                          {window.innerWidth > 600 && (
                            <td>
                              <IconButton
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  handleSendPdfToMobile(
                                    quotation.pdfPath,
                                    quotation.clientInfo?.phone
                                  )
                                }
                                size="small"
                              >
                                <Send fontSize="small" />
                              </IconButton>
                            </td>
                          )}

                          {/* Hide this column on mobile */}
                          {window.innerWidth > 600 && (
                            <td>
                              <IconButton
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/admin/quotations/edit/${quotation._id}`)}
                                size="small"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                variant="contained"
                                color="error"
                                onClick={() =>
                                  handleDeleteQuotation(quotation._id)
                                }
                                size="small"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </td>
                          )}
                        </tr>
                        {expandedRows.includes(index) && (
                          <tr>
                            <td style={{ textAlign: "start" }} colSpan="5">
                              <div style={{ padding: "16px" }}>
                                <strong>Mobile Number:</strong>{" "}
                                {quotation.clientInfo.phone}
                                <br />
                                <strong>Engineer:</strong>{" "}
                                {quotation.clientInfo.engineer}
                                <br />
                                <br />
                                <strong>Quotation Document:</strong>{" "}
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={() =>
                                    handleDownloadPDF(quotation.pdfPath)
                                  }
                                  size="small"
                                  sx={{ mb: 2 }} // Adds margin-bottom for spacing
                                >
                                  <Download fontSize="small" /> Download
                                </Button>
                                <br />
                                <br />
                                <strong>Send Pdf to Client:</strong>{" "}
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() =>
                                    handleSendPdfToMobile(
                                      quotation.pdfPath,
                                      quotation.clientInfo?.phone
                                    )
                                  }
                                  size="small"
                                  sx={{ mb: 2 }} // Adds margin-bottom for spacing
                                >
                                  Send
                                </Button>
                                <br />
                                <br />
                                <strong>Edit/Delete Quotation:</strong>{" "}
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() => navigate(`/admin/quotations/edit/${quotation._id}`)}
                                  size="small"
                                  sx={{ mb: 1 }} // Adds margin-bottom for spacing
                                >
                                  <Edit fontSize="small" /> Edit
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={() =>
                                    handleDeleteQuotation(quotation._id)
                                  }
                                  size="small"
                                  sx={{ mb: 1 }} // Adds margin-bottom for spacing
                                >
                                  <Delete fontSize="small" /> Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No quotations found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Paper>
            {/* Pagination Controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              <Button
                variant="contained"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                sx={{ flexGrow: 1, margin: "0.5rem" }} // Flex properties for responsiveness
              >
                Previous
              </Button>
              <Typography variant="body1" sx={{ margin: "0.5rem" }}>
                Page {currentPage} of {totalPages}
              </Typography>
              <Button
                variant="contained"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                sx={{ flexGrow: 1, margin: "0.5rem" }} // Flex properties for responsiveness
              >
                Next
              </Button>
            </Box>
          </Card>

          {/* Modal */}
          <Modal open={modalOpen} onClose={closeModal}>
            <Box
              sx={{
                width: 400,
                padding: 3,
                margin: "auto",
                mt: "20vh",
                backgroundColor: "white",
                borderRadius: "8px",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {currentQuotation ? "Edit Quotation" : "Add Quotation"}
              </Typography>
              <form onSubmit={handleFormSubmit}>
                <TextField
                  label="Quotation No"
                  value={formData.quotationNo}
                  onChange={(e) =>
                    setFormData({ ...formData, quotationNo: e.target.value })
                  }
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Client Name"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Contact Person"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Mobile Number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Quotation Amount (Rs)"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" color="primary">
                  {currentQuotation ? "Update" : "Add"}
                </Button>
                <Button
                  onClick={closeModal}
                  variant="outlined"
                  color="secondary"
                  sx={{ ml: 2 }}
                >
                  Cancel
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

export default QuotationAdminPage;
