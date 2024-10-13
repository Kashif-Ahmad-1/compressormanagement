import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
} from "@mui/material";
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
import axios from "axios";
import { toast } from 'react-toastify';
import Sidebar from "./Sidebar";
import Footer from "../Footer";
import * as XLSX from 'xlsx';
const ChecklistPage = () => {
  const initialChecklist = [
    {
      srNo: 1,
      task: "Make safe as instructed in the service manual",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 2,
      task: "Carry out repair (after obtaining authorization, if needed)",
      done: false,
      remark: "",
      inputs: {},
    },
  ];

  const initialRefrigeratorList = [
    { srNo: 1, task: "Check refrigerant levels", done: false, remark: "", inputs: {} },
    {
      srNo: 2,
      task: "Inspect evaporator and condenser coils",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 3,
      task: "Check door seals for damage",
      done: false,
      remark: "",
      inputs: {},
    },
  ];

  const [checklist, setChecklist] = useState(initialChecklist);
  const [refrigeratorList, setRefrigeratorList] = useState(
    initialRefrigeratorList
  );
  const [clientInfo, setClientInfo] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    address: "",
    engineer: ""
  });
  const [authorizedSignature, setAuthorizedSignature] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [spareParts, setSpareParts] = useState([{ desc: "", partNo: "", qty: "" }]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { invoiceNo } = location.state || {};
  const [documentNumber, setDocumentNumber] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/checklist/last`);
        const data = response.data;
        let invoicedocument = data.invcdocument + 1;
        setDocumentNumber(invoicedocument);
      } catch (error) {
        console.error("Error fetching the data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSparePartChange = (index, event) => {
    const newSpareParts = [...spareParts];
    newSpareParts[index][event.target.name] = event.target.value;
    setSpareParts(newSpareParts);
  };

  const handleAddSparePart = () => {
    setSpareParts([...spareParts, { desc: "", partNo: "", qty: "" }]);
  };

  useEffect(() => {
    if (location.state) {
      setClientInfo({
        name: location.state.clientName || "",
        contactPerson: location.state.contactPerson || "",
        phone: location.state.phone || "",
        address: location.state.address || "",
        engineer: location.state.engineer.name || "",
      });
      setAppointmentId(location.state.appointmentId);
    }
  }, [location.state]);

  const handleCheckboxChange = (index, type) => {
    const newList =
      type === "checklist" ? [...checklist] : [...refrigeratorList];
    newList[index].done = !newList[index].done;
    type === "checklist" ? setChecklist(newList) : setRefrigeratorList(newList);
  };

  const handleRemarkChange = (index, type, event) => {
    const newList =
      type === "checklist" ? [...checklist] : [...refrigeratorList];
    newList[index].remark = event.target.value;
    type === "checklist" ? setChecklist(newList) : setRefrigeratorList(newList);
  };

  const handleInputChange = (index, type, inputName, event) => {
    const newList =
      type === "checklist" ? [...checklist] : [...refrigeratorList];
    newList[index].inputs[inputName] = event.target.value;
    type === "checklist" ? setChecklist(newList) : setRefrigeratorList(newList);
  };

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!clientInfo.name ) {
      toast.error('Please fill in all required fields.');
      return;
    }
  
    // Prepare checklist data
    const checklistData = checklist.map(item => ({
      Task: item.task,
      Done: item.done ? "Yes" : "No",
      Remark: item.remark,
    }));
  
    const refrigeratorData = refrigeratorList.map(item => ({
      Task: item.task,
      Done: item.done ? "Yes" : "No",
      Remark: item.remark,
    }));
  
    // Create a new workbook
    const wb = XLSX.utils.book_new();
  
    // Prepare a single sheet with all data
    const data = [
      ["Client Information"],
      ["Phone", clientInfo.phone], // This will be in B7
      [],
      [],
      [],
      [],
      [],
      [],
      ["Name", clientInfo.name], // This will be in A9
      [],
      ["Checklist"],
      ["Task", "Done", "Remark"],
      ...checklistData.map(item => [item.Task, item.Done, item.Remark]),
      [],
      ["Refrigerator Checklist"],
      ["Task", "Done", "Remark"],
      ...refrigeratorData.map(item => [item.Task, item.Done, item.Remark]),
    ];
  
    // Convert data array to a worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
  
    // Create the sheet in the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Service Checklist");
  
    // Generate Excel file
    XLSX.writeFile(wb, `${clientInfo.name}_service_checklist.xlsx`);
    toast.success('Excel file generated successfully');
  };
  
  

  return (
    <>
      {sidebarOpen && <Sidebar />}
      <TableContainer
        component={Paper}
        style={{ margin: "80px auto", maxWidth: "900px", padding: "20px" }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ marginBottom: "10px", fontSize: "20px" }}
        >
          Service Checklist
        </Typography>
        <Box sx={{ marginBottom: "10px", padding: "0 10px" }}>
          <Typography variant="h4" sx={{ marginBottom: "5px", fontSize: "16px" }}>
            Client Information : <strong>Doc Number {documentNumber}</strong>
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Client Name"
                variant="outlined"
                fullWidth
                margin="normal"
                size="small"
                name="name"
                value={clientInfo.name}
                onChange={handleClientInfoChange}
                InputProps={{
                
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Contact Person"
                variant="outlined"
                fullWidth
                margin="normal"
                size="small"
                name="contactPerson"
                value={clientInfo.contactPerson}
                onChange={handleClientInfoChange}
                InputProps={{
                  readOnly: true,
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Invoice number"
                variant="outlined"
                fullWidth
                margin="normal"
                size="small"
                name="invoiceNo"
                value={invoiceNo}
                onChange={handleClientInfoChange}
                InputProps={{
                  readOnly: true,
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Mobile"
                variant="outlined"
                fullWidth
                margin="normal"
                size="small"
                name="phone"
                value={clientInfo.phone}
                onChange={handleClientInfoChange}
                InputProps={{
                  readOnly: true,
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Address"
                variant="outlined"
                fullWidth
                margin="normal"
                size="small"
                name="address"
                value={clientInfo.address}
                onChange={handleClientInfoChange}
                InputProps={{
                  readOnly: true,
                  style: { backgroundColor: "#f5f5f5" },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Screw Compressor Checklist */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Sr No
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Task
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Done
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Remark
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checklist.map((item, index) => (
              <TableRow key={index} hover>
                <TableCell align="center">
                  {item.srNo}
                </TableCell>
                <TableCell sx={{ fontSize: "12px" }}>
                  {item.task.split("<TextField>").map((part, i) => (
                    <span key={i}>
                      {part}
                      {i < item.task.split("<TextField>").length - 1 && (
                        <TextField
                          variant="outlined"
                          size="small"
                          sx={{
                            width: "60px",
                            marginLeft: "4px",
                            marginRight: "4px",
                          }}
                          onChange={(e) =>
                            handleInputChange(index, "checklist", `input${i}`, e)
                          }
                        />
                      )}
                    </span>
                  ))}
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={item.done}
                    onChange={() => handleCheckboxChange(index, "checklist")}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    value={item.remark}
                    onChange={(e) => handleRemarkChange(index, "checklist", e)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ fontSize: "12px" }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Refrigerator Checklist */}
        <Typography
          variant="h4"
          align="center"
          sx={{ marginTop: "20px", marginBottom: "10px", fontSize: "20px" }}
        >
          Refrigerator Checklist
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Sr No
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Task
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Done
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Remark
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {refrigeratorList.map((item, index) => (
              <TableRow key={index} hover>
                <TableCell align="center">
                  {item.srNo}
                </TableCell>
                <TableCell sx={{ fontSize: "12px" }}>
                  {item.task.split("<TextField>").map((part, i) => (
                    <span key={i}>
                      {part}
                      {i < item.task.split("<TextField>").length - 1 && (
                        <TextField
                          variant="outlined"
                          size="small"
                          sx={{
                            width: "60px",
                            marginLeft: "4px",
                            marginRight: "4px",
                          }}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "refrigerator",
                              `input${i}`,
                              e
                            )
                          }
                        />
                      )}
                    </span>
                  ))}
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={item.done}
                    onChange={() => handleCheckboxChange(index, "refrigerator")}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    value={item.remark}
                    onChange={(e) => handleRemarkChange(index, "refrigerator", e)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ fontSize: "12px" }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Spare Part */}
        <Box sx={{ marginBottom: "10px", padding: "20px 10px" }}>
          <Typography variant="h6" sx={{ marginBottom: "5px", fontSize: "16px", fontWeight: "Bold" }}>
            List of spare parts required for next visit
          </Typography>
          {spareParts.map((part, index) => (
            <Grid container spacing={1} key={index} sx={{ marginBottom: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField label="Description" variant="outlined" fullWidth name="desc" value={part.desc} onChange={(e) => handleSparePartChange(index, e)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Part No." variant="outlined" fullWidth name="partNo" value={part.partNo} onChange={(e) => handleSparePartChange(index, e)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField label="Qty" variant="outlined" fullWidth name="qty" value={part.qty} onChange={(e) => handleSparePartChange(index, e)} />
              </Grid>
            </Grid>
          ))}
          <Button variant="outlined" onClick={handleAddSparePart}>Add Spare Part</Button>
        </Box>

        <Box
          sx={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}
        >
          <TextField
            label="Authorized Signature"
            variant="outlined"
            size="small"
            value={clientInfo.engineer}
            InputProps={{
              readOnly: true,
              style: { backgroundColor: "#f5f5f5" },
            }}
            onChange={(e) => setAuthorizedSignature(e.target.value)}
            sx={{ marginRight: "10px" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Submit and Generate PDF
          </Button>
        </Box>
      </TableContainer>
      <Footer />
    </>
  );
};

export default ChecklistPage;
