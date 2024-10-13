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
  AppBar,
  Toolbar,

} from "@mui/material";

import Menu from '@mui/icons-material/Menu';
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios"; // Import axios for API calls
import logo from './comp-logo.jpeg';
import { toast } from 'react-toastify';
import MessageTemplate from "./../MessageTemplate";
import Sidebar from "./Sidebar";
import Footer from "../Footer";
import logo2 from './logo2.png'
const Header = ({ onToggleSidebar }) => (
  <AppBar position="fixed" sx={{ backgroundColor: "gray", zIndex: 1201 }}> {/* Ensure zIndex is higher than sidebar */}
    <Toolbar>
    <Button onClick={onToggleSidebar} sx={{ color: 'white' }}>
  <Menu sx={{ fontSize: 30 }} />
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



const ChecklistPage4 = () => {
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
    {
      srNo: 3,
      task: "Check abnormality in Ambient air like Bad odor / Heavy dust",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 4,
      task: "Check control cabinet / cooler filter mats, clean / replace if necessary",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 5,
      task: "Check / clean cooler, check fan blades and guarding",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 6,
      task: "Check coupling / belt tension, tight if necessary",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 7,
      task: "Check / change oil separator cartridge",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 8,
      task: "Check oil separator cartridge, diff. pressure",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 9,
      task: "Check / change the Air filter",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 10,
      task: "Check Air filter cap, Suction hose for any leak or crack / damage",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 11,
      task: "Check / change the Oil filter",
      done: false,
      remark: "",
      inputs: {},
    },
    { 
      srNo: 12, 
      task: "Check / change the Oil", 
      done: false, 
      remark: "", 
      inputs: {} 
    },
    {
      srNo: 13,
      task: "Check / change the Valve kits",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 14,
      task: "Check motor bearing lubrication, regrease if necessary",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 15,
      task: "Check electrical connection and tight if necessary",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 16,
      task: "Check motor overcurrent relays and protection switches",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 17,
      task: "Check door and guard interlocks and emergency stop function",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 18,
      task: "Check all sensor connections and tight if necessary",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 19,
      task: "Check and register if any safety device bypassed",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 20,
      task: "Check Control voltage; L1 <TextField> V, Logo Power Output <TextField> V DC.",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 21,
      task: "Check line voltage: L1 <TextField> V, L2 <TextField> V, L3 <TextField> V <TextField>",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 22,
      task: "Check current consumption: Line U1 <TextField> A, V1 <TextField> A, W1 <TextField> A ……..",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 23,
      task: "Check Fan motor current Fan 1 U1 <TextField> A, V1 <TextField> A, W1 <TextField> A",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 24,
      task: "Check Fan motor current Fan 2 U1 <TextField> A, V1 <TextField> A, W1 <TextField> A",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 25,
      task: "Room temp: <TextField> C, Airend discharge temp.: <TextField> C <TextField>",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 26,
      task: "Pressure Setting: SP <TextField> bar, SD <TextField> bar",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 27,
      task: "Check for any Air / Oil leakages in the compressor<TextField>",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 28,
      task: "Check and maintain ZK filter Eco drain Valve <TextField>",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 29,
      task: "Test run, check conditions: start, idle, load and shut-down <TextField>",
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
    {
      srNo: 4,
      task: "Clean drain pan and ensure proper drainage",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 5,
      task: "Verify thermostat operation",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 6,
      task: "Check / clean Air dryer condenser",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 7,
      task: "Check condenser fan motor direction",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 8,
      task: "Check condensate drain function",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 9,
      task: "Check refrigerant circuit and Air circuit for leaks",
      done: false,
      remark: "",
      input: {},
      inputs: {},
    },
    {
      srNo: 10,
      task: "Check compressed air temperature: Inlet <TextField> °C | Outlet <TextField> °C",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 11,
      task: "Check current consumption: Line U1 <TextField> A, V1 <TextField> A, W1 <TextField> A",
      done: false,
      remark: "",
      input: {},
      inputs: {},
    },
    {
      srNo: 12,
      task: "Check Auto On/Off operation; Switching On <TextField> C, Switching Off <TextField> C",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 13,
      task: "Pressure dew point [ ] blue [ ] green [ ] red <TextField> °F/C",
      done: false,
      remark: "",
      inputs: {},
    },
    {
      srNo: 14,
      task: "Check / Replace Air treatment filter cartridge",
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
  const [template, setTemplate] = useState('');
  const [documentNumber, setDocumentNumber] = useState(0);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const response = await axios.get(`${API_BASE_URL}/api/checklist/last`);
              const data = response.data;
              // Store invcdocument value in the state
            let  invoicedocument = data.invcdocument + 1;
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
      setAppointmentId(location.state.appointmentId); // Store appointment ID
      console.log(appointmentId)
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

  const handleGeneratePDFAndSubmit = async () => {
    const doc = new jsPDF();

    // Add logos in the top-left and top-right corners
    const logoWidth = 30; // Width for logo
    const logoHeight = 30; // Height for logo
    const imgData = logo; // Assume 'logo' is defined
    const imgData2 = logo2; // Assume 'logo2' is defined
    doc.addImage(imgData, "PNG", 10, 10, logoWidth, logoHeight); // Left corner
    doc.addImage(imgData2, "PNG", doc.internal.pageSize.getWidth() - logoWidth - 10, 10, logoWidth, logoHeight); // Right corner

    // Company Name (centered)
    const companyName = "AEROLUBE ENGINEERS";
    const pageWidth = doc.internal.pageSize.getWidth();
    const textX = pageWidth / 2; // Center position
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, textX, 25, { align: "center" });

    // Company Address
    const companyAddress = "LANE NO. 09, 264 A, KASIDIH, SAKCHI, East Singhbhum, Jharkhand, 831001";
    const wrappedAddress = doc.splitTextToSize(companyAddress, pageWidth - 20);
    doc.setFontSize(9);
    doc.text(wrappedAddress, textX, 35, { align: "center" });

    // GST No.
    const gstNo = "GST No: 20CJOPS0713D1ZM";
    const wrappedGstNo = doc.splitTextToSize(gstNo, pageWidth - 20);
    doc.text(wrappedGstNo, textX, 40, { align: "center" });

    // Service Title
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Service Record", textX, 45, { align: "center" });

    // Client Information Section
    const clientInfoBorderTopY = 50;
    const clientInfoBoxHeight = 50;
    doc.setDrawColor(0);
    doc.rect(10, clientInfoBorderTopY - 5, doc.internal.pageSize.getWidth() - 20, clientInfoBoxHeight); // Draw rectangle

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Client Information", 14, clientInfoBorderTopY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const clientInfoLines = [
        `Name: ${clientInfo.name}`,
        `Contact: ${clientInfo.contactPerson} | Phone: ${clientInfo.phone}`,
        `Address: ${clientInfo.address}`,
        `Authorized Signature: ${clientInfo.engineer}`
    ];

    const clientInfoYStart = clientInfoBorderTopY + 10;
    clientInfoLines.forEach((line, index) => {
        doc.text(line, 14, clientInfoYStart + (index * 5)); // Adjusted Y position
    });

    const centerX = 10 + (doc.internal.pageSize.getWidth() - 20) / 2; // Center X position
    doc.setDrawColor(0);
    doc.line(centerX, clientInfoBorderTopY - 5, centerX, clientInfoBorderTopY - 5 + clientInfoBoxHeight); // Vertical line

    // Equipment Details Section
    const engineerDetailsXStart = doc.internal.pageSize.getWidth() - 80;
    const engineerDetailsYStart = clientInfoBorderTopY;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Equipment Details", engineerDetailsXStart, engineerDetailsYStart);

    const engineerDetails = {
        model: "Model XYZ",
        partNo: "Part #1234",
        serialNo: "SN-5678",
        runningHrs: "100 hrs",
        loadHrs: "80 hrs",
        motorStarts: "50",
        loadValveOn: "Yes"
    };

    const engineerInfoLines = [
        { label: "Model:", value: engineerDetails.model },
        { label: "Part No:", value: engineerDetails.partNo },
        { label: "Serial No:", value: engineerDetails.serialNo },
        { label: "Running Hrs:", value: engineerDetails.runningHrs },
        { label: "Load Hrs:", value: engineerDetails.loadHrs },
        { label: "Motor Starts:", value: engineerDetails.motorStarts },
        { label: "Load Valve On:", value: engineerDetails.loadValveOn }
    ];

    doc.setFontSize(9);
    engineerInfoLines.forEach((item, index) => {
        doc.setFont("helvetica", "bold");
        doc.text(item.label, engineerDetailsXStart, engineerDetailsYStart + 10 + (index * 5));
        doc.setFont("helvetica", "normal");
        doc.text(item.value, engineerDetailsXStart + 40, engineerDetailsYStart + 10 + (index * 5)); // Adjusted spacing
    });

    // Checklists Header
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Screw Compressor Checklist", 14, clientInfoBorderTopY + 55);

    // Checklist Table
    autoTable(doc, {
        head: [["Sr No", "Task", "Done", "Remark"]],
        body: checklist.map((item) => {
            const inputs = Object.values(item.inputs || {});
            let inputIndex = 0;

            const taskWithInputs = item.task.replace(/<TextField>/g, () => {
                if (inputIndex < inputs.length) {
                    const inputValue = inputs[inputIndex++];
                    doc.setFont("helvetica", "bold");
                    return inputValue;
                }
                return "";
            });
            doc.setFont("helvetica", "normal");
            return [
                item.srNo,
                taskWithInputs || "No task provided",
                item.done ? "Yes" : "No",
                item.remark,
            ];
        }),
        startY: clientInfoBorderTopY + 60,
        styles: {
            fontSize: 7,
            cellPadding: 2,
            halign: "left",
            valign: "middle",
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],
        },
        headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240],
        },
        margin: { top: 10 },
    });

    // Refrigerator Checklist Header
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Refrigerator Checklist", 14, doc.autoTable.previous.finalY + 10);

    // Refrigerator Checklist Table
    autoTable(doc, {
        head: [["Sr No", "Task", "Done", "Remark"]],
        body: refrigeratorList.map((item) => {
            const inputs = Object.values(item.inputs || {});
            let inputIndex = 0;

            const taskWithInputs = item.task.replace(/<TextField>/g, () => {
                return inputIndex < inputs.length ? inputs[inputIndex++] : "";
            });
            return [
                item.srNo,
                taskWithInputs || "No task provided",
                item.done ? "Yes" : "No",
                item.remark,
            ];
        }),
        startY: doc.autoTable.previous.finalY + 10,
        styles: {
            fontSize: 7,
            cellPadding: 2,
            halign: "left",
            valign: "middle",
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],
        },
        headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240],
        },
        margin: { top: 10 },
    });

    // Spare Parts Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("List of Spare Parts Required for Next Visit", 14, doc.autoTable.previous.finalY + 20);

    // Spare Parts Table
    autoTable(doc, {
        head: [["Required Parts Description", "Part No.", "Qty."]],
        body: spareParts.map(part => [part.desc, part.partNo, part.qty]),
        startY: doc.autoTable.previous.finalY + 25,
        styles: {
            fontSize: 7,
            cellPadding: 2,
            halign: "left",
            valign: "middle",
            lineColor: [0, 0, 0],
            fillColor: [255, 255, 255],
        },
        headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255],
            fontStyle: "bold",
        },
    });

    // Add footer
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text("Generated on: " + new Date().toLocaleString(), 14, doc.autoTable.previous.finalY + 10);
    doc.text("© AEROLUBE ENGINEERS", 14, doc.autoTable.previous.finalY + 15);

    // Backend upload
    const pdfBlob = doc.output("blob");
    const pdfFile = new File([pdfBlob], "checklist.pdf", { type: "application/pdf" });

    // Prepare FormData to send to backend
    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("checklistData", JSON.stringify({
        clientInfo,
        appointmentId,
        checklist,
        invoiceNo,
        refrigeratorList,
        documentNumber
    }));

    try {
        // Send the checklist data and PDF to the backend
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_BASE_URL}/api/checklist`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("Checklist and PDF uploaded successfully", response.data);

        const pdfUrl = response.data.checklist.pdfPath; // Get pdfPath from the first checklist object
        console.log("Extracted PDF URL:", pdfUrl); // Log the extracted URL

        // Send the PDF URL to WhatsApp
        console.log("Sending PDF to mobile:", pdfUrl, "to", clientInfo.phone); // Debugging line
        await handleSendPdfToMobile(pdfUrl, clientInfo.phone);
        toast.success("PDF sent to mobile successfully!");

    } catch (error) {
        console.error("Error uploading checklist and PDF:", error);
        toast.error("Error uploading checklist and PDF!");
    }

    // Save the PDF locally (optional)
    doc.save("checklist.pdf");
};


  // Function to send the PDF to mobile via WhatsApp
  const handleSendPdfToMobile = async (pdfUrl, mobileNumber) => {
    try {
      // Fetch templates from the backend
      const response = await axios.get('http://localhost:5000/templates');
      const { template1 } = response.data; // Get Template 1
  
      // Use the message template function with the PDF URL
      const message = MessageTemplate(pdfUrl, template1); // Replace {pdfUrl} with the actual URL
  
      const whatsappAuth = 'Basic ' + btoa(`${WHATSAPP_CONFIG.username}:${WHATSAPP_CONFIG.password}`);
  
      const responseWhatsapp = await axios.post(`${WHATSAPP_CONFIG.url}`, {
        receiverMobileNo: mobileNumber,
        message: [message], // Send the final message as an array
      }, {
        headers: {
          'Authorization': whatsappAuth,
          'Content-Type': 'application/json',
        },
      });
  
      toast.success("PDF sent to mobile successfully!");
    } catch (error) {
      toast.error("Error sending PDF to mobile!");
      console.error("WhatsApp Error:", error);
    }
  };
  
  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };
  return (
    <>
    {sidebarOpen && <Sidebar />}
      <Header onToggleSidebar={handleToggleSidebar} />
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
                readOnly: true,
                style: { backgroundColor: "#f5f5f5" }, // Light grey background
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
              name="contactPerson" // Fixed the name to "contactPerson"
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
        <Typography variant="h6" sx={{ marginBottom: "5px", fontSize: "16px",fontWeight:"Bold" }}>
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
            style: { backgroundColor: "#f5f5f5" }, // Light grey background
          }}
          onChange={(e) => setAuthorizedSignature(e.target.value)}
          sx={{ marginRight: "10px" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleGeneratePDFAndSubmit}
        >
          Submit and Generate PDF
        </Button>
      </Box>
      
    </TableContainer>
   <Footer />
    </>
  );
};

export default ChecklistPage4;
