import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "./comp-logo.jpeg";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Divider,
  Modal,
  List,
  Button,
  ListItem,
  ListItemText,
  IconButton,
  Pagination,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Download,
  Menu,
  CheckCircle,
  Search,
  History as HistoryIcon,
} from "@mui/icons-material";
import Sidebar from "./Sidebar"; // Adjust path if necessary
import {API_BASE_URL,WHATSAPP_CONFIG} from "./../../config";
import Footer from "../Footer";
// Header Component
const Header = ({ onToggleSidebar }) => (
  <AppBar position="fixed" sx={{ backgroundColor: "gray", zIndex: 1201 }}> {/* Ensure zIndex is higher than sidebar */}
    <Toolbar>
      <Button color="inherit" onClick={onToggleSidebar}>
        <Menu />
      </Button>
      <img
        src={logo}
        alt="Company Logo"
        style={{ width: 40, height: 40, marginRight: 10 }}
      />
      <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
        AEROLUBE ENGINEERS
      </Typography>
    </Toolbar>
  </AppBar>
);





function EngineerDetailsPage() {
  const { engineerId } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 10; 
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [nextServiceDates, setNextServiceDates] = useState({});

  const [expandedRows, setExpandedRows] = useState([]);

  const handleNextServiceDateChange = (appointmentId, newDate) => {
    setNextServiceDates((prev) => ({
      ...prev,
      [appointmentId]: newDate,
    }));

    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nextServiceDate: newDate }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update the appointment");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Updated appointment:", data);
        window.location.reload();
        setAppointments((prevAppointments) => {
          return prevAppointments.map((appointment) =>
            appointment._id === appointmentId
              ? { ...appointment, nextServiceDate: newDate }
              : appointment
          );
        });
      })
      .catch((error) => {
        console.error("Error updating appointment:", error);
      });
  };

  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/appointments/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        data.sort(
          (a, b) =>
            new Date(a.expectedServiceDate) - new Date(b.expectedServiceDate)
        );
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointment data", error);
        setError(error);
      }
    };

    fetchAppointmentData();
  }, [engineerId]);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (error) {
    return (
      <Typography variant="h6" color="error">
        Error: {error.message}
      </Typography>
    );
  }

  // if (appointments.length === 0) {
  //   return <Typography variant="h6">Loading...</Typography>;
  // }

  const toggleRow = (index) => {
    setExpandedRows((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };



  const handleEditClick = (appointment) => {


    navigate(`/checklist`, {
      state: {
        appointmentId: appointment._id,
        clientName: appointment.clientName,
        contactPerson: appointment.contactPerson,
        phone: appointment.mobileNo,
        address: appointment.clientAddress,
        engineer: appointment.engineer,
        invoiceNo: appointment.invoiceNumber,
        machineName: appointment.machineName,
        serialNo: appointment.serialNo,
        partNo: appointment.partNo,
        model: appointment.model
        
      },
    });
  };

  const handleDownloadPDF = (cloudinaryUrl) => {
    const link = document.createElement("a");
    link.href = cloudinaryUrl;
    link.setAttribute("download", cloudinaryUrl.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleServiceHistoryClick = (clientName) => {
    const history = appointments.filter((app) => app.clientName === clientName);
    setServiceHistory(history);
    setSelectedClient(clientName);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setServiceHistory([]);
    setSelectedClient(null);
  };

  const handleQuotation = (appointment) => {
    navigate(`/quotation-generate`, {
      state: {
        appointmentId: appointment._id,
        clientName: appointment.clientName,
        contactPerson: appointment.contactPerson,
        mobileNo: appointment.mobileNo,
        address: appointment.clientAddress,
        engineer: appointment.engineer.name,
        invoiceNumber: appointment.invoiceNumber,
      },
    });
  };

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };
  const filteredAppointments = appointments.filter((appointment) => {
    const clientName = appointment.clientName.toLowerCase();
    const matchesSearch =
      clientName.includes(searchTerm.toLowerCase()) ||
      (appointment.invoiceNumber &&
        appointment.invoiceNumber.toString().includes(searchTerm)) ||
      (appointment.mobileNo && appointment.mobileNo.includes(searchTerm)) ||
      (appointment.clientAddress &&
        appointment.clientAddress
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (appointment.contactPerson &&
        appointment.contactPerson
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && appointment.status === "completed");

    return matchesSearch && matchesFilter;
  });

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

  // .................................................
  return (
    <>
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        backgroundColor: "white",
        // overflowX: "auto",
       
      }}
    >
      {sidebarOpen && <Sidebar />}
      
      <Box sx={{ flexGrow: 1,  }}>
      <Header onToggleSidebar={handleToggleSidebar} />
      
      <Container sx={{ padding: 0, width: '100%', overflowX: 'auto', display: 'flex', flexDirection: 'column', minHeight: '100vh',marginTop: "70px" }} maxWidth="xl">
     
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Client Details
          </Typography>
         
         

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 2,
             
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Search by Client Name"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to the first page on new search
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: "300px" }}
            />
         
          </Box>
         
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{ overflowY: "hidden", overflowX: "auto" }}
          >
            <Table sx={{ minWidth: 350 }}>
              <TableHead>
                <TableRow>
                  {[
                    "Invoice No.",
                    "Client Name",
                    
                    "Client Address",
                    "Expected Service Date",
                    
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
                    "Mobile No.",
                    "Contact Person",
                    "Invoice Date",
                    "Invoice Amount",
                    "Machine Name",
                    "Model",
                    "Part No.",
                    "Serial No.",
                    "Installation Date",
                    "Service Frequency (Days)",
                    
                    "Next Service Date",
                    "Document",
                    "Checklist",
                    "Invoice",
                    "Service History",
                    "Quotation",
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
                {currentAppointments.map((appointment,index) => (
                  <React.Fragment key={appointment._id}>
                    {/* Desktop View */}

                    <TableRow
                      onClick={() => toggleRow(index)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#e1f5fe" },
                      }}
                    >
                      <TableCell sx={{ fontSize: "1.2rem", fontWeight: 700 }}>
                        {appointment.invoiceNumber}
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.2rem" }}>
                        {appointment.clientName}
                      </TableCell>
                      <TableCell sx={{ fontSize: "1.2rem" }}>
                        {appointment.clientAddress}
                      </TableCell>


                     
                      <TableCell
                       sx={{ fontSize: "1.2rem" }}
                      >
                        {new Date(
                          appointment.expectedServiceDate
                        ).toLocaleDateString()}
                      </TableCell>

                      
                      

                      {/* Additional columns visible only on larger screens */}
                      <TableCell sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                         
                        }}>
                        {appointment.mobileNo}
                      </TableCell>

                      <TableCell
                        sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                         
                        }}
                      >
                        {appointment.contactPerson}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}
                      >
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                          
                        }}
                      >
                        {typeof appointment.appointmentAmount === "number"
                          ? `${appointment.appointmentAmount.toFixed(2)}`
                          : "N/A"}
                      </TableCell>

                      <TableCell
                        sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                         
                        }}
                      >
                        {appointment.machineName}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                         
                        }}
                      >
                        {appointment.model}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                         
                        }}
                      >
                        {appointment.partNo}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                        
                        }}
                      >
                        {appointment.serialNo}
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", md: "table-cell" },
                          fontSize: "1rem",
                         
                        }}
                      >
                        {new Date(
                          appointment.installationDate
                        ).toLocaleDateString()}
                      </TableCell>
                      
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        {appointment.serviceFrequency}
                      </TableCell>

                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        <TextField
                          type="date"
                          variant="outlined"
                          size="small"
                          value={
                            nextServiceDates[appointment._id] ||
                            new Date(appointment.expectedServiceDate)
                              .toISOString()
                              .split("T")[0]
                          }
                          onChange={(e) =>
                            handleNextServiceDateChange(
                              appointment._id,
                              e.target.value
                            )
                          }
                        />
                      </TableCell>

                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        {appointment.document ? (
                          <span
                            onClick={() =>
                              handleDownloadPDF(appointment.document)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <Download
                              sx={{ color: "blue", fontSize: "1.5rem" }}
                            />
                          </span>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No Document
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        <span
                          onClick={() => handleEditClick(appointment)}
                          style={{ cursor: "pointer" }}
                        >
                          <CheckCircle
                            sx={{ color: "blue", fontSize: "1.5rem" }}
                          />
                        </span>
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        {appointment.checklists.length > 0 ? (
                          (() => {
                            const sortedChecklists = [
                              ...appointment.checklists,
                            ].sort(
                              (a, b) =>
                                new Date(b.generatedOn) -
                                new Date(a.generatedOn)
                            );
                            const latestChecklist = sortedChecklists[0];
                            return latestChecklist.pdfPath ? (
                              <span
                                onClick={() =>
                                  handleDownloadPDF(latestChecklist.pdfPath)
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <Download
                                  sx={{ color: "blue", fontSize: "1.5rem" }}
                                />
                              </span>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No Invoice
                              </Typography>
                            );
                          })()
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No Checklist
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <span
                          onClick={() =>
                            handleServiceHistoryClick(appointment.clientName)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <HistoryIcon sx={{ color: "blue" }} />
                        </span>
                      </TableCell>

                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        <span
                          onClick={() => handleQuotation(appointment)}
                          style={{ cursor: "pointer" }}
                        >
                          <Typography
                            variant="body2"
                            color="blue"
                            sx={{ fontSize: "1rem" }}
                          >
                            View
                          </Typography>
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Desktop view End */}
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
                              sx={{ marginTop: 2, fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Next Service Date:</strong>
                              <TextField
                                type="date"
                                variant="outlined"
                                size="small"
                                sx={{ marginLeft: 1, width: "auto" }}
                                value={
                                  nextServiceDates[appointment._id] ||
                                  new Date(appointment.expectedServiceDate)
                                    .toISOString()
                                    .split("T")[0]
                                }
                                onChange={(e) =>
                                  handleNextServiceDateChange(
                                    appointment._id,
                                    e.target.value
                                  )
                                }
                              />
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

                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Checklist:</strong>
                              <span
                                onClick={() => handleEditClick(appointment)}
                                style={{
                                  cursor: "pointer",
                                  color: "#007acc",
                                  textDecoration: "underline",
                                  marginLeft: 1,
                                }}
                              >
                                <CheckCircle />
                              </span>
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Checklist PDF download:</strong>
                              {appointment.checklists.length > 0
                                ? (() => {
                                    const sortedChecklists = [
                                      ...appointment.checklists,
                                    ].sort(
                                      (a, b) =>
                                        new Date(b.generatedOn) -
                                        new Date(a.generatedOn)
                                    );
                                    const latestChecklist = sortedChecklists[0];
                                    return latestChecklist.pdfPath ? (
                                      <span
                                        onClick={() =>
                                          handleDownloadPDF(
                                            latestChecklist.pdfPath
                                          )
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
                                      " No Invoice"
                                    );
                                  })()
                                : " No Checklist"}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Service History:</strong>
                              <span
                                onClick={() =>
                                  handleServiceHistoryClick(
                                    appointment.clientName
                                  )
                                }
                                style={{
                                  cursor: "pointer",
                                  color: "#007acc",
                                  textDecoration: "underline",
                                  marginLeft: 1,
                                }}
                              >
                                <HistoryIcon sx={{ color: "blue" }} />
                              </span>
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{ fontSize: "1.1rem", mb: 1 }}
                            >
                              <strong>Quotation:</strong>
                              <span
                                onClick={() => handleQuotation(appointment)}
                                style={{
                                  cursor: "pointer",
                                  color: "#007acc",
                                  textDecoration: "underline",
                                  marginLeft: 1,
                                }}
                              >
                                View
                              </span>
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <IconButton
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </IconButton>
            <Typography>
              Page {currentPage} of {totalPages}
            </Typography>
            <IconButton
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </IconButton>
          </Box>
        </Container>
        <Footer />
      </Box>

      {/* Modal for Service History */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            width: { xs: "90%", sm: 500 },
            maxHeight: "70vh",
            overflowY: "auto",
            padding: 4,
            backgroundColor: "white",
            margin: "auto",
            marginTop: "10%",
            borderRadius: 2,
            boxShadow: 24,
            position: "relative",
          }}
        >
          <IconButton
            onClick={() => setOpenModal(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            X
          </IconButton>
          <Typography variant="h6">
            {selectedClient}'s Service History
          </Typography>
          <List>
            {serviceHistory.map((historyItem, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`Date: ${new Date(
                    historyItem.appointmentDate
                  ).toLocaleDateString()}`}
                  secondary={<>{`Machine: ${historyItem.machineName}`}</>}
                />
              </ListItem>
            ))}
          </List>
          <Button
            onClick={() => setOpenModal(false)}
            variant="contained"
            sx={{ marginTop: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    
    </Box>
    
    </>
  );
}

export default EngineerDetailsPage;
