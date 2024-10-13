import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AccountAddPage.css";
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
import logo from './comp-logo.jpeg';
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
import Footer from "../Footer";
function AppointmentPage() {
  const navigate = useNavigate();

  const [installationDate, setInstallationDate] = useState("");
  const [serviceFrequency, setServiceFrequency] = useState("");
  const [expectedServiceDate, setExpectedServiceDate] = useState("");
  const [engineers, setEngineers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [clientName, setClientName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentAmount, setAppointmentAmount] = useState(0);
  const [machineName, setMachineName] = useState("");
  const [modelNo, setModelNo] = useState("");
  const [partNo, setPartNo] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [engineerId, setEngineerId] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [document, setDocument] = useState(null);
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/users/engineers`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setEngineers(data);
        } else {
          console.error("Failed to fetch engineers:", data.message);
        }
      } catch (error) {
        console.error("Error fetching engineers:", error);
      }
    };

    fetchEngineers();
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/machines`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setMachines(data);
      } catch (error) {
        console.error("Error fetching machines:", error);
      }
    };

    fetchMachines();
  }, []);

  useEffect(() => {
    const draftData = JSON.parse(localStorage.getItem("appointmentDraft"));
    if (draftData) {
      setInvoiceNumber(draftData.invoiceNumber);
      setClientName(draftData.clientName);
      setClientAddress(draftData.clientAddress);
      setContactPerson(draftData.contactPerson);
      setMobileNo(draftData.mobileNo);
      setAppointmentDate(draftData.appointmentDate);
      setAppointmentAmount(draftData.appointmentAmount);
      setMachineName(draftData.machineName);
      setModelNo(draftData.modelNo);
      setPartNo(draftData.partNo);
      setSerialNo(draftData.serialNo);
      setInstallationDate(draftData.installationDate);
      setServiceFrequency(draftData.serviceFrequency);
      setExpectedServiceDate(draftData.expectedServiceDate);
      setEngineerId(draftData.engineer);
    }
  }, []);

  const handleClientNameChange = async (e) => {
    const value = e.target.value;
    setClientName(value);

    if (value.length >= 2) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/companies/search?name=${encodeURIComponent(
            value
          )}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching company suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleMachineChange = (e) => {
    const selectedMachineName = e.target.value;
    const selectedMachine = machines.find(
      (machine) => machine.name === selectedMachineName
    );

    console.log("Selected Machine Name:", selectedMachineName); // Debugging line
    console.log("Selected Machine Data:", selectedMachine); // Debugging line

    if (selectedMachine) {
      setMachineName(selectedMachine.name);
      setModelNo(selectedMachine.modelNo); // Update model number
      setPartNo(selectedMachine.partNo); // Update part number
      setSerialNo(""); // Optionally reset serial number
    } else {
      setMachineName("");
      setModelNo("");
      setPartNo("");
      setSerialNo(""); // Reset serial number if no machine is selected
    }
  };

  const validateDates = (installDate, invoiceDate) => {
    if (installDate <= invoiceDate) {
      setDateError("Installation date must be greater than the invoice date.");
      return false;
    } else {
      setDateError("");
      return true;
    }
  };

  const handleDateChange = (e) => {
    const newInstallDate = e.target.value;
    setInstallationDate(newInstallDate);
    calculateExpectedServiceDate(newInstallDate, serviceFrequency);

    const invoiceDate = new Date(appointmentDate);
    validateDates(new Date(newInstallDate), invoiceDate);
  };

  const handleInvoiceDateChange = (e) => {
    const newInvoiceDate = e.target.value;
    setAppointmentDate(newInvoiceDate);

    const installDate = new Date(installationDate);
    validateDates(installDate, new Date(newInvoiceDate));
  };

  const handleFrequencyChange = (e) => {
    setServiceFrequency(e.target.value);
    calculateExpectedServiceDate(installationDate, e.target.value);
  };

  const Header = () => (
    <AppBar position="fixed" sx={{ backgroundColor: 'gray',width: '100%' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit"  sx={{ mr: 2 }}>
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const appointmentData = new FormData();
    appointmentData.append("invoiceNumber", invoiceNumber);
    appointmentData.append("clientName", clientName);
    appointmentData.append("clientAddress", clientAddress);
    appointmentData.append("contactPerson", contactPerson);
    appointmentData.append("mobileNo", mobileNo);
    appointmentData.append("appointmentDate", appointmentDate);
    appointmentData.append("appointmentAmount", appointmentAmount);
    appointmentData.append("machineName", machineName);
    appointmentData.append("model", modelNo);
    appointmentData.append("partNo", partNo);
    appointmentData.append("serialNo", serialNo);
    appointmentData.append("installationDate", installationDate);
    appointmentData.append("serviceFrequency", serviceFrequency);
    appointmentData.append("expectedServiceDate", expectedServiceDate);
    appointmentData.append("engineer", engineerId);
    appointmentData.append("document", document);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/appointments/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: appointmentData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      localStorage.removeItem("appointmentDraft");

      toast.success("Appointment booked successfully!", {
        position: "top-right",
        autoClose: 5000,
      });

      setTimeout(() => {
        navigate("/accountspage");
      }, 3000);
    } catch (error) {
      toast.error("Failed to save appointment data.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
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
  const handleDraftSave = () => {
    const draftData = {
      invoiceNumber,
      clientName,
      clientAddress,
      contactPerson,
      mobileNo,
      appointmentDate,
      appointmentAmount,
      machineName,
      modelNo,
      partNo,
      serialNo,
      installationDate,
      serviceFrequency,
      expectedServiceDate,
      engineer: engineerId,
    };
    localStorage.setItem("appointmentDraft", JSON.stringify(draftData));
    toast.success("Draft saved successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleBackClick = () => {
    navigate("/accountspage");
  };

  const calculateExpectedServiceDate = (installationDate, serviceFrequency) => {
    if (installationDate && serviceFrequency) {
      const installDate = new Date(installationDate);
      installDate.setDate(
        installDate.getDate() + parseInt(serviceFrequency, 10)
      );
      const expectedDate = installDate.toISOString().split("T")[0];
      setExpectedServiceDate(expectedDate);
    }
  };

  return (
    <>
     <Header />
    <div className="appointment-page">
    
      <div className="left-panel side-panel">
     
        <h3>Engineers & Assigned Invoices</h3>
        {appointments.map((appointment, index) => (
           <React.Fragment key={appointment._id}>
         
            <h4>{appointment?.engineer?.name}</h4>
            <ul>
             <li>{appointment.invoiceNumber}</li>
              
                
              
            </ul>
         
          </React.Fragment>
        ))}
       
      </div>
      <div className="appointment-container">
        <h2>Register Invoice / Assign Engineer</h2>
        <form className="appointment-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="invoiceNumber">Invoice number:</label>
              <input
                type="text"
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientName">Enter Client Name:</label>
              <input
                type="text"
                id="clientName"
                value={clientName}
                onChange={handleClientNameChange}
                required
              />
              {suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion._id}
                      onClick={() => {
                        setClientName(suggestion.clientName);
                        setClientAddress(suggestion.clientAddress);
                        setContactPerson(suggestion.contactPerson);
                        setMobileNo(suggestion.mobileNo);
                        setSuggestions([]);
                      }}
                    >
                      {suggestion.clientName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="clientAddress">Client Address:</label>
              <input
                type="text"
                id="clientAddress"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactPerson">Contact Person:</label>
              <input
                type="text"
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mobileNo">Mobile No.:</label>
              <input
                type="tel"
                id="mobileNo"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointmentDate">Invoice Date:</label>
              <input
                type="date"
                id="appointmentDate"
                value={appointmentDate}
                onChange={handleInvoiceDateChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointmentAmount">Invoice Amount:</label>
              <input
                type="number"
                id="appointmentAmount"
                value={appointmentAmount}
                onChange={(e) => setAppointmentAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="machineName">Machine Name:</label>
              <select
                id="machineName"
                value={machineName}
                onChange={handleMachineChange}
                required
              >
                <option value="">Select a Machine</option>
                {machines.map((machine) => (
                  <option key={machine._id} value={machine.name}>
                    {machine.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="model">Model:</label>
              <input
                type="text"
                id="model"
                value={modelNo}
                readOnly // Optional: set to read-only to prevent manual input
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="partNo">Part No.:</label>
              <input
                type="text"
                id="partNo"
                value={partNo}
                readOnly // Optional: set to read-only to prevent manual input
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="serialNo">Serial No.:</label>
              <input
                type="text"
                id="serialNo"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="installationDate">Installation Date:</label>
              <input
                type="date"
                id="installationDate"
                value={installationDate}
                onChange={handleDateChange}
                required
              />
              {dateError && <span className="error-message">{dateError}</span>}
            </div>

            <div className="form-group-freq">
              <label htmlFor="serviceFrequency">
                Service Frequency (Days):
              </label>
              <input
                type="number"
                id="serviceFrequency"
                value={serviceFrequency}
                onChange={handleFrequencyChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="expectedServiceDate">
                Expected Service Date:
              </label>
              <input
                type="date"
                id="expectedServiceDate"
                value={expectedServiceDate}
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="engineer">Assign Engineer:</label>
              <select
                id="engineer"
                value={engineerId}
                onChange={(e) => setEngineerId(e.target.value)}
                required
              >
                <option value="">Select Engineer</option>
                {engineers.map((engineer) => (
                  <option key={engineer._id} value={engineer._id}>
                    {engineer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="document">Upload Document:</label>
              <input
                type="file"
                id="document"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setDocument(e.target.files[0])}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit">Submit</button>
            <button
              type="button"
              className="draft-button"
              onClick={handleDraftSave}
            >
              Save Draft
            </button>
            <button
              type="button"
              className="back-button"
              onClick={handleBackClick}
            >
              Back To Home
            </button>
          </div>
        </form>
      </div>

      {/* Right Panel */}
      <div className="right-panel side-panel">
        <h3>Available Machines</h3>
        <ul>
          {machines.map((machine) => (
            <li key={machine._id}>{machine.name}</li>
          ))}
        </ul>
      </div>
     
      <ToastContainer />
      
    </div>
    {/* <Footer /> */}
    </>
  );
}

export default AppointmentPage;
