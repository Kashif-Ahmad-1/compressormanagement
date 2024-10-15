import React, { useState,useEffect } from "react";
import logo2 from "./logo2.png";
import logo from "./comp-logo.jpeg";
import { itemNames, RefrigeratoritemNames } from './itemNames.jsx';
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import axios from "axios";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
import MessageTemplate from "./../MessageTemplate";
import { toast, ToastContainer } from "react-toastify";
const ChecklistPage = () => {
    const [remarksData, setRemarksData] = useState(itemNames || []);
    const [refrigeratorData, setRefrigeratorData] = useState(RefrigeratoritemNames || []);



  const [spareParts, setSpareParts] = useState([
    {
      description: '',
      partNo: '',
      qty: '',
      otherDetails: ''
    }
  ]);

  const [consumeParts, setConsumeParts] = useState([
    {
      description: '',
      partNo: '',
      qty: '',
      otherDetails: ''
    }
  ]);
  
 
  const [clientInfo, setClientInfo] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    address: "",
    engineer: ""
  });

  const [authorizedSignature, setAuthorizedSignature] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [machines, setMachines] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { invoiceNo,machineName,serialNo,partNo ,model,engineerMobile} = location.state || {};
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

  const fetchMachines = async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      const response = await axios.get(`${API_BASE_URL}/api/spareparts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const addSparePart = () => {
    setSpareParts([
      ...spareParts,
      { description: '', partNo: '', qty: '', otherDetails: '' }
    ]);
  };


  const handleMachineChange = (index, machineId) => {
    const selectedMachine = machines.find(machine => machine._id === machineId);
    const newParts = [...spareParts];
    
    if (selectedMachine) {
      newParts[index].machineId = selectedMachine._id; // Store the selected machine ID
      newParts[index].partNo = selectedMachine.partNo || ''; // Use partNo from the selected machine
    } else {
      newParts[index].machineId = '';
      newParts[index].partNo = ''; // Reset partNo if no machine is selected
    }

    setSpareParts(newParts);
  };

  const addConsumePart = () => {
    setConsumeParts([
      ...consumeParts,
      { description: '', partNo: '', qty: '', otherDetails: '' }
    ]);
  };
  const deleteConsumePart = (index) => {
    const updatedParts = consumeParts.filter((_, i) => i !== index);
    setConsumeParts(updatedParts);
  };
  const deleteSparePart = (index) => {
    const updatedParts = spareParts.filter((_, i) => i !== index);
    setSpareParts(updatedParts);
  };
  const handleCheckboxChange = (index) => {
    const updatedRemarks = remarksData.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    );
    setRemarksData(updatedRemarks);
  };

  const handleRemarkChange = (index, value) => {
    const updatedRemarks = remarksData.map((item, i) =>
      i === index ? { ...item, remark: value } : item
    );
    setRemarksData(updatedRemarks);
  };

  const handleCheckboxChangeRef = (index) => {
    const updatedRemarks = refrigeratorData.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    );
    setRefrigeratorData(updatedRemarks);
  };

  const handleRemarkChangeRef = (index, value) => {
    const updatedRemarks = refrigeratorData.map((item, i) =>
      i === index ? { ...item, remark: value } : item
    );
    setRefrigeratorData(updatedRemarks);
  };

  const handleInputChange = (index, field, value) => {
    const newSpareParts = [...spareParts];
    newSpareParts[index][field] = value;
    setSpareParts(newSpareParts);
  };

  const handleConsumeInputChange = (index, field, value) => {
    const newConsumeParts = [...consumeParts];
    newConsumeParts[index][field] = value;
    setConsumeParts(newConsumeParts);
  };


  const handlePrint = async () => {
    const input = document.getElementById("checklist-content");

    // Hide the action column
    const actionColumnHeaders = input.querySelectorAll('th:nth-child(5), td:nth-child(5)');
    actionColumnHeaders.forEach(cell => {
        cell.style.display = 'none'; // Hide the action cell
    });

    // Replace input fields with their values
    const inputs = input.querySelectorAll('input[type="text"], input[type="number"]');
    inputs.forEach(inputField => {
        const value = inputField.value;
        const span = document.createElement('span');
        span.innerText = value; // Replace input with span
        span.style.fontWeight = 'bold'; // Make the text bold
        inputField.parentNode.replaceChild(span, inputField);
    });

    // Replace the select box with its selected value
    const selectElements = input.querySelectorAll('select');
    selectElements.forEach(selectField => {
        const selectedValue = selectField.options[selectField.selectedIndex].text; // Get selected value
        const span = document.createElement('span');
        span.innerText = selectedValue; // Display selected value
        span.style.fontWeight = 'bold'; // Make the text bold
        selectField.parentNode.replaceChild(span, selectField); // Replace select with span
    });

    const printButton = document.getElementById("print-button");
    const printButton2 = document.getElementById("print-button2");
    const printButton3 = document.getElementById("print-button3");
    if (printButton) {
        printButton.style.display = "none";
    }
    if (printButton2) {
        printButton2.style.display = "none";
    }
    if (printButton3) {
        printButton3.style.display = "none";
    }

    // Configure the pdf options with optimizations
    const options = {
        margin: 0.1, // Reduce margins
        filename: 'checklist.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 1.3 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
        // Generate the PDF
        const pdf = await html2pdf().from(input).set(options).output('blob');


        const clientName = clientInfo.name || "Client"; // Fallback if name is not available
        const documentNumbers = documentNumber || "Document"; // Fallback if invoice number is not available
        const filename = `service_Record_no_${documentNumbers}_${clientName}.pdf`.replace(/\s+/g, '_');
        // Prepare PDF for upload
        const pdfFile = new File([pdf], filename, { type: "application/pdf" });
        const formData = new FormData();
        formData.append("pdf", pdfFile);
        formData.append("checklistData", JSON.stringify({
            clientInfo,
            appointmentId,
            invoiceNo,
            documentNumber,
            machineName,
            engineerMobile,
        }));

        // Send the checklist data and PDF to the backend
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_BASE_URL}/api/checklist`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("Checklist and PDF uploaded successfully", response.data);
        toast.success("Checklist uploaded successfully")
        
        const pdfUrl = response.data.checklist.pdfPath; 
        const Technician = response.data.checklist.clientInfo.engineer
        const MachineName = machineName
        const companyName = response.data.checklist.clientInfo.name
        
        console.log("Extracted PDF URL:", pdfUrl,Technician,MachineName,companyName); 
        await handleSendPdfToMobile(pdfUrl,clientInfo.phone,companyName,MachineName,Technician,engineerMobile)
        
        
    } catch (error) {
        console.error('Error generating or uploading PDF:', error);
        alert('Failed to upload PDF');
    } finally {
        // Restore the action column visibility
        actionColumnHeaders.forEach(cell => {
            cell.style.display = ''; // Reset the display property
        });

        // Show the print button again after PDF generation
        if (printButton) {
            printButton.style.display = "block";
        }
        if (printButton2) {
            printButton2.style.display = "block";
        }
        if (printButton3) {
            printButton3.style.display = "block";
        }

        window.location.reload();
    }
};



const handleSendPdfToMobile = async (pdfUrl, mobileNumber,companyName,MachineName,Technician,engineerMobile) => {
  try {
    // Fetch templates from the backend
    const response = await axios.get(`${API_BASE_URL}/api/templates`); 
    const { template1 } = response.data; 

    // Use the message template function with the PDF URL
    const message = MessageTemplate(pdfUrl, template1,companyName,MachineName,Technician,engineerMobile);

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
    <div id="checklist-content">
    
  
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        margin: "0 auto",
        padding: "20px",
        border: "2px solid black",
        borderRadius: "3px",
        fontSize: "10px",
        maxWidth: "210mm", // A4 width
        minHeight: "297mm", // A4 height
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <img
          src={logo}
          alt="Left Logo"
          style={{ width: "100px", height: "auto", marginRight: "5px" }}
        />
        <div style={{ textAlign: "center", flexGrow: 1 }}>
          <h1 style={{ margin: 0, fontSize: "14px" }}>AEROLUBE ENGINEERS</h1>
          <p style={{ margin: "1px 0", fontSize: "10px" }}>
            LANE NO 9, KASIDIH, SAKCHI, JAMSHEDPUR - 831001
          </p>
          <p style={{ margin: "1px 0", fontSize: "10px" }}>
            E-MAIL: aerolube13@gmail.com
          </p>
          <p style={{ margin: "1px 0", fontSize: "10px" }}>
            HELPLINE: 09916823833
          </p>
        </div>
        <img
          src={logo2}
          alt="Right Logo"
          style={{ width: "100px", height: "auto", marginLeft: "5px" }}
        />
      </div>


      <div style={{ borderTop: "1px solid black", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div>
    <h2 style={{ fontSize: "12px" }}>Field Service Report</h2>
    <p>Service Report No: <strong>{documentNumber}</strong></p>
    <p>Date: <strong>{new Date().toLocaleDateString()}</strong></p>
  </div>
  <div>
    <p>Invoice No: <strong>{invoiceNo}</strong></p>
  </div>
</div>


      <div style={{ borderTop: "1px solid black", paddingTop: "10px" }}>
        <h3 style={{ fontSize: "10px" ,textAlign: "center",marginLeft: "200px"}}>Equipment Details</h3>
        <div
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              border: "1px solid black",
              backgroundColor: "#f5f5f5",
            }}
          >
            <div
              style={{ border: "1px solid black", padding: "3px", width: "50%" }}
            >
              Customer Name
            </div>
            <div
              style={{ border: "1px solid black", padding: "3px", width: "30%" }}
            >
              Machine Details
              <br />
              
                     {machineName}
            </div>
            <div
              style={{ border: "1px solid black", padding: "3px", width: "10%" }}
            >
              Compressor
            </div>
            <div
              style={{ border: "1px solid black", padding: "3px", width: "10%" }}
            >
              Air Dryer
            </div>
            <div
              style={{ border: "1px solid black", padding: "3px", width: "10%" }}
            >
              Filter / Eco Drain
            </div>
          </div>


          <div style={{ display: "flex" }}>

          <div style={{ border: "1px solid black", width: "50%" }}>
          <h3 style={{ margin: "0" }}>Customer Name and Address -</h3>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div style={{ flex: 1,textAlign: "right" }}>
    <strong>{clientInfo.name}</strong>
    <br />
    
    <strong>{clientInfo.address}</strong>
  </div>
 
</div>

  
    

  
  <div style={{ borderTop: "2px solid black", margin: "8px 0" }} />

  <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
    <strong>Nature of Visit:</strong>
    <span style={{ marginLeft: "10px" }}>
      <select id="natureOfVisit" name="natureOfVisit" style={{ height: "20px", width: '100%' }}>
        <option value="AMC">AMC</option>
        <option value="Warranty">Warranty</option>
        <option value="Goodwill">Goodwill</option>
        <option value="Chargeable">Chargeable</option>
      </select>
    </span>
  </div>

  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <strong>Nature of Problem:</strong>
    <input
      type="text"
      style={{
        width: '70%',
        border: 'none',
        borderBottom: '1px solid #000',
        marginLeft: "10px"
      }}
    />
  </div>
</div>






<div style={{ border: "1px solid black", padding: "3px", width: "30%" }}>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Model:</span>
    <strong>{model}</strong>
  </div>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Part No.:</span>
    <strong>{partNo}</strong>
  </div>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Serial No.:</span>
    <strong>{serialNo}</strong>
  </div>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Running Hrs.:</span>
    <input
      type="text"
      style={{
        width: '50px',
        border: 'none',
        borderBottom: '1px solid #000',
        margin: '0 3px',
        height: '10px',
      }}
    />
  </div>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Load Hrs.:</span>
    <input
      type="text"
      style={{
        width: '50px',
        border: 'none',
        borderBottom: '1px solid #000',
        margin: '0 3px',
        height: '10px',
      }}
    />
  </div>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Motor start:</span>
    <input
      type="text"
      style={{
        width: '50px',
        border: 'none',
        borderBottom: '1px solid #000',
        margin: '0 3px',
        height: '10px',
      }}
    />
  </div>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <span>Load Valve on:</span>
    <input
      type="text"
      style={{
        width: '50px',
        border: 'none',
        borderBottom: '1px solid #000',
        margin: '0 3px',
        height: '10px',
      }}
    />
  </div>
</div>

            <div
  style={{
    border: "1px solid black",
    padding: "3px",
    width: "10%",
   
    overflow: "hidden", // Prevent overflow from displaying
    whiteSpace: "pre-wrap", // Preserve whitespace and allow wrapping
    cursor: "text", // Indicate that it's editable
  }}
  contentEditable
  suppressContentEditableWarning
>
  
</div>

<div
  style={{
    border: "1px solid black",
    padding: "3px",
    width: "10%",
    
    overflow: "hidden", // Prevent overflow from displaying
    whiteSpace: "pre-wrap", // Preserve whitespace and allow wrapping
    cursor: "text", // Indicate that it's editable
  }}
  contentEditable
  suppressContentEditableWarning
>
  
</div>
<div
  style={{
    border: "1px solid black",
    padding: "3px",
    width: "10%",
   
    overflow: "hidden", // Prevent overflow from displaying
    whiteSpace: "pre-wrap", // Preserve whitespace and allow wrapping
    cursor: "text", // Indicate that it's editable
  }}
  contentEditable
  suppressContentEditableWarning
>
  
</div>
          </div>
        </div>


      </div>


      <div style={{ borderTop: "1px solid #000", paddingTop: "5px" }}>
  <h3 style={{ fontSize: "10px", margin: "0" }}>screw compressor</h3>

  <div style={{ display: "flex", borderBottom: "1px solid #ccc", backgroundColor: "#f5f5f5", fontSize: "9px" }}>
    <div style={{ flex: "5", padding: "2px" }}>Item</div>
    <div style={{ flex: "1", padding: "2px" }}>Done</div>
    <div style={{ flex: "4", padding: "2px" }}>Remark</div>
  </div>

  {remarksData.map((item, index) => (
    <div key={index} style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
      <div style={{ flex: "5", padding: "2px" }} dangerouslySetInnerHTML={{ __html: item.description }} />
      <div style={{ flex: "1", padding: "2px" }}>
        <input
          type="checkbox"
          checked={item.done}
          onChange={() => handleCheckboxChange(index)}
          style={{ transform: "scale(0.9)", margin: "0" }} // Smaller checkbox
        />
      </div>
      <div style={{ flex: "4", padding: "2px" }}>
        <input
          type="text"
          value={item.remark}
          onChange={(e) => handleRemarkChange(index, e.target.value)}
          style={{ width: "100%", fontSize: "9px", padding: "1px", margin: "0" }} // Reduced font size and padding
        />
      </div>
    </div>
  ))}

  {/* Refrigerator List Section */}
  <div style={{ marginTop: "10px", borderTop: "1px solid #000", paddingTop: "5px" }}>
      <h3 style={{ fontSize: "10px", margin: "0" }}>Refrigeration dryer</h3>

      <div style={{ display: "flex", borderBottom: "1px solid #ccc", backgroundColor: "#f5f5f5", fontSize: "9px" }}>
        <div style={{ flex: "5", padding: "2px" }}>Item</div>
        <div style={{ flex: "1", padding: "2px" }}>Done</div>
        <div style={{ flex: "4", padding: "2px" }}>Remark</div>
    </div>

    {refrigeratorData.map((item, index) => (
        <div key={index} style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
            <div style={{ flex: "5", padding: "2px" }} dangerouslySetInnerHTML={{ __html: item.description }} />
            <div style={{ flex: "1", padding: "2px" }}>
                <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => handleCheckboxChangeRef(index)}
                    style={{ transform: "scale(0.9)", margin: "0" }} // Smaller checkbox
                />
            </div>
            <div style={{ flex: "4", padding: "2px" }}>
                <input
                    type="text"
                    value={item.remark}
                    onChange={(e) => handleRemarkChangeRef(index, e.target.value)}
                    style={{ width: "100%", fontSize: "9px", padding: "1px", margin: "0" }} // Reduced font size and padding
                />
            </div>
        </div>
    ))}

    </div>




</div>






      <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
  <h3 style={{ fontSize: "10px" }}>
    Guidelines For Performance Improvement:
  </h3>
  <input type="text" style={{ width: "100%", border: "none", borderBottom: "1px solid #000", outline: "none" }}  />
</div>

<div style={{ borderTop: "2px solid #000", paddingTop: "10px" }}>
  <h3 style={{ fontSize: "10px" }}>Customer Remark:</h3>
  <input type="text" style={{ width: "100%", border: "none", borderBottom: "1px solid #000", outline: "none" }}  />
</div>


{/* Consume part code */}

<div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
      <h3 style={{ fontSize: "10px", display: 'inline' }}>
        Consumed Parts Description
      </h3>
      <span id="print-button2">
        <button
          onClick={addConsumePart}
          style={{
            fontSize: "10px",
            marginLeft: "10px",
            cursor: "pointer",
            backgroundColor: "green",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "2px 5px",
            color: 'yellow',
            height: "20px",
            width: '20px'
          }}
        >
          +
        </button>
      </span>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "5px",
          fontSize: "10px",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>
              Description
            </th>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>
              Part No.
            </th>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>
              Qty.
            </th>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>
            Other Used Parts Details
            </th>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {consumeParts.map((part, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <input
                  type="text"
                  value={part.description}
                  onChange={(e) => handleConsumeInputChange(index, 'description', e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <input
                  type="text"
                  value={part.partNo}
                  onChange={(e) => handleConsumeInputChange(index, 'partNo', e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <input
                  type="number"
                  value={part.qty}
                  onChange={(e) => handleConsumeInputChange(index, 'qty', e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <input
                  type="text"
                  value={part.otherDetails}
                  onChange={(e) => handleConsumeInputChange(index, 'otherDetails', e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center" }}>
                <span
                  onClick={() => deleteConsumePart(index)}
                  style={{
                    cursor: "pointer",
                    color: "red",
                    fontSize: "12px", // Smaller font size
                    padding: "0",
                    margin: "0",
                  }}
                  title="Delete"
                >
                  ❌ {/* You can replace this with an SVG or FontAwesome icon */}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>


{/* end code */}


<div style={{ border: "2px solid black", padding: "10px" }}>
  <h3 style={{ fontSize: "10px" }}>Work Timings</h3>
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: '5px' }}>
  <span style={{ margin: '0 5px' }}>
    Start of work: 
    <input type="text" style={{ width: '30px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />:
  </span>
  <span style={{ margin: '0 5px' }}>
    <input type="text" style={{ width: '30px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />
  </span>

  <span style={{ margin: '0 5px' }}>
    End of work: 
    <input type="text" style={{ width: '30px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />:
  </span>
  <span style={{ margin: '0 5px' }}>
    <input type="text" style={{ width: '30px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />
  </span>

  <span style={{ margin: '0 5px', flex: '1 1 100%', maxWidth: '100%' }}>
    Date: 
    <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />
  </span>
</div>

  
  <div style={{ display: 'flex', justifyContent: 'normal', marginBottom: '5px' }}>
  <span style={{ marginRight: '5px' }}>
    Contact Person Name: 
    <input type="text" 
           style={{ 
             width: '100px', 
             border: 'none', 
             borderBottom: '1px solid #000', 
             margin: '0 5px', 
             fontSize: '10px' // Adjust this value as needed
           }} 
    />
  </span>
  <span style={{ marginRight: '5px' }}>
    Mobile No.: 
    <input type="text" 
           style={{ 
             width: '100px', 
             border: 'none', 
             borderBottom: '1px solid #000', 
             margin: '0 5px', 
             fontSize: '10px' // Adjust this value as needed
           }} 
    />
  </span>
  <span>
    E-mail: 
    <input type="text" 
           style={{ 
             width: '100px', 
             border: 'none', 
             borderBottom: '1px solid #000', 
             margin: '0 5px', 
             fontSize: '10px' 
           }} 
    />
  </span>
</div>


  <div style={{ display: 'flex', justifyContent: 'normal', marginBottom: '5px' }}>
    <span>Technician Name: <input type="text" style={{ width: '150px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
  </div>
</div>




<div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
      <h3 style={{ fontSize: "10px", display: 'inline' }}>
        List of Spare Parts Required for Next Visit
      </h3>
      <span id="print-button3">
        <button
          onClick={addSparePart}
          style={{
            fontSize: "10px",
            marginLeft: "10px",
            cursor: "pointer",
            backgroundColor: "green",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "2px 5px",
            color: 'yellow',
            height: "20px",
            width: '20px'
          }}
        >
          +
        </button>
      </span>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "5px",
          fontSize: "10px",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>Machine</th>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>Part No.</th>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>Qty.</th>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>Other Required Parts Details</th>
            <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>Action</th>
          </tr>
        </thead>
        <tbody>
        {spareParts.map((part, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <select
                  onChange={(e) => handleMachineChange(index, e.target.value)} // Get value directly
                  style={{ width: "100%" }}
                >
                  <option value="">Select a Spare Part</option>
                  {machines.map((machine, i) => (
                    <option key={i} value={machine._id}>{machine.name}</option>
                  ))}
                </select>
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <input
                  type="text"
                  value={part.partNo}
                  onChange={(e) => handleInputChange(index, 'partNo', e.target.value)}
                  style={{ width: "100%" }}
                  
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <input
                  type="number"
                  value={part.qty}
                  onChange={(e) => handleInputChange(index, 'qty', e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <input
                  type="text"
                  value={part.otherDetails}
                  onChange={(e) => handleInputChange(index, 'otherDetails', e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center" }}>
                <span
                  onClick={() => deleteSparePart(index)}
                  style={{
                    cursor: "pointer",
                    color: "red",
                    fontSize: "12px",
                    padding: "0",
                    margin: "0",
                  }}
                  title="Delete"
                >
                  ❌
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>





      <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
        <h3 style={{ fontSize: "10px" }}>Final Remarks</h3>
        <p>Work done: Yes / No &nbsp; Work accepted: Yes / No</p>
      </div>

      <div
        style={{
          borderTop: "1px solid #000",
          paddingTop: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0 }}>
            Technician's Signature: 
            <br />
            <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />
          </p>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ margin: 0 }}>
            Customer's Signature: 
            <br />
            <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />
          </p>
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <p style={{ margin: 0 }}>
            Signee's Name
            <br />
            <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />
          </p>
        </div>
      </div>

      <div id="print-button" style={{ marginBottom: "10px" }}>
        <button
          onClick={handlePrint}
          style={{
            padding: "5px 10px",
            fontSize: "10px",
            cursor: "pointer",
            border: "1px solid #000",
            backgroundColor: "#f0f0f0",
            borderRadius: "3px",
            color: "black"
          }}
        >
          Print
        </button>
      </div>

    </div>
    <ToastContainer />
    </div>
  );
};

export default ChecklistPage;
