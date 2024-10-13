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
  
 
  const [clientInfo, setClientInfo] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    address: "",
    engineer: ""
  });

  const [authorizedSignature, setAuthorizedSignature] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { invoiceNo,machineName,serialNo,partNo ,model} = location.state || {};
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

  const addSparePart = () => {
    setSpareParts([
      ...spareParts,
      { description: '', partNo: '', qty: '', otherDetails: '' }
    ]);
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


  const handlePrint = async () => {
    const input = document.getElementById("checklist-content");

    const printButton = document.getElementById("print-button");
    const printButton2 = document.getElementById("print-button2");
    if (printButton) {
        printButton.style.display = "none";
    }
    if (printButton2) {
        printButton2.style.display = "none";
    }
    // Configure the pdf options with optimizations
    const options = {
        margin:       0.1,  // Reduce margins
        filename:     'checklist.pdf',
        image:        { type: 'jpeg', quality: 1 }, // Lower quality for smaller size
        html2canvas:  { scale: 1.3 }, // Adjust scale for balance between quality and size
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
        // Generate the PDF
        const pdf = await html2pdf().from(input).set(options).output('blob');

        // Prepare PDF for upload
        const pdfFile = new File([pdf], "checklist.pdf", { type: "application/pdf" });
        const formData = new FormData();
        formData.append("pdf", pdfFile);
        formData.append("checklistData", JSON.stringify({
            clientInfo,
            appointmentId,
            invoiceNo,
            documentNumber,
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
        const pdfUrl = response.data.checklist.pdfPath; // Get pdfPath from the response
        console.log("Extracted PDF URL:", pdfUrl); // Log the extracted URL
        await handleSendPdfToMobile(pdfUrl,clientInfo.phone)

    } catch (error) {
        console.error('Error generating or uploading PDF:', error);
        alert('Failed to upload PDF');
    }finally {
        // Show the print button again after PDF generation
        if (printButton) {
            printButton.style.display = "block";
        }
        if (printButton2) {
            printButton2.style.display = "block";
        }
    }
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


      <div style={{ borderTop: "1px solid black", paddingTop: "10px" }}>
        <h2 style={{ fontSize: "12px" }}>Field Service Report</h2>
        <p>Service Report No: <strong>{documentNumber}</strong></p>
        <br />
        <p>Date: <strong>{new Date().toLocaleDateString()}</strong></p>
      </div>

      <div style={{ borderTop: "1px solid black", paddingTop: "10px" }}>
        <h3 style={{ fontSize: "10px" }}>Equipment Details</h3>
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
              Equipment Details
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
            <div
              style={{ border: "1px solid black", padding: "3px", width: "50%" }}
            >
               Invoice Number: <strong>{invoiceNo}</strong>
              <br />
              <br />
                Name: <strong>{clientInfo.name}</strong>
             
              <br />
              Contact Person.: <strong>{clientInfo.contactPerson}</strong>
             
              <br />
              Phone No.: <strong>{clientInfo.phone}</strong>
             
              <br />
              Address: <strong>{clientInfo.address}</strong>
            </div>
            <div
              style={{ border: "1px solid black", padding: "3px", width: "30%" }}
            >
                          
              Model: <strong>{model}</strong>
              <br />
              Part No.: <strong>{partNo}</strong>
              <br />
              Serial No.: <strong>{serialNo}</strong>
              <br />
              Running Hrs.: <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 3px',height: '10px' }} />
              <br />
              Load Hrs.: <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 3px',height: '10px' }} />
              <br />
              Motor start: <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 3px',height: '10px' }} />
              <br />
              Load Valve on: <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 3px',height: '10px' }} />
              <br />
            </div>
            <div
  style={{
    border: "1px solid black",
    padding: "3px",
    width: "10%",
    height: "100px", // Adjust height as needed
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
    height: "100px", // Adjust height as needed
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
    height: "100px", // Adjust height as needed
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
  <h3 style={{ fontSize: "10px", margin: "0" }}>Remarks</h3>

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
    <h3 style={{ fontSize: "10px", margin: "0" }}>Refrigerator List</h3>

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


      {/* <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
        <h3 style={{ fontSize: "10px" }}>Consumed Parts Description</h3>
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
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "5px",
                  backgroundColor: "#f5f5f5",
                  fontSize: "10px",
                }}
              >
                Description
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "5px",
                  backgroundColor: "#f5f5f5",
                  fontSize: "10px",
                }}
              >
                Part No.
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "5px",
                  backgroundColor: "#f5f5f5",
                  fontSize: "10px",
                }}
              >
                Qty.
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "5px",
                  backgroundColor: "#f5f5f5",
                  fontSize: "10px",
                }}
              >
                Other Used Parts Details
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                ________________________________________________________
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                ____________
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>____</td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                ________________________________________________________
              </td>
            </tr>
          </tbody>
        </table>
      </div> */}

      <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
    <h3 style={{ fontSize: "10px" }}>Work Timings</h3>
    <div style={{ display: 'flex', justifyContent: 'normal', marginBottom: '5px' }}>
        <span>Start of work: <input type="text" style={{ width: '40px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />:</span>
        <span><input type="text" style={{ width: '40px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
       
        <span>End of work: <input type="text" style={{ width: '40px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />:</span>
        <span><input type="text" style={{ width: '40px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
        <span>Date: <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'normal', marginBottom: '5px' }}>
        <span>Technician Name: <input type="text" style={{ width: '150px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
        <span>Contact Person Name: <input type="text" style={{ width: '150px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'normal' }}>
        <span>Mobile No.: <input type="text" style={{ width: '150px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
        <span>E-mail: <input type="text" style={{ width: '200px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
    </div>
</div>


<div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
      <h3 style={{ fontSize: "10px", display: 'inline' }}>
        List of Spare Parts Required for Next Visit
      </h3>
      <span id="print-button2">
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
              Other Required Parts Details
            </th>
          </tr>
        </thead>
        <tbody>
          {spareParts.map((part, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <input
                  type="text"
                  value={part.description}
                  onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                  style={{ width: "100%" }}
                />
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




// import React, { useState,useEffect } from "react";
// import logo2 from "./logo2.png";
// import logo from "./comp-logo.jpeg";
// import { itemNames, RefrigeratoritemNames } from './itemNames.jsx';
// import { useLocation } from "react-router-dom";
// import jsPDF from "jspdf";
// import axios from "axios";
// import html2canvas from "html2canvas";
// import html2pdf from "html2pdf.js";
// import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
// const ChecklistPage3 = () => {
//     const [remarksData, setRemarksData] = useState(itemNames || []);
//     const [refrigeratorData, setRefrigeratorData] = useState(RefrigeratoritemNames || []);



//   const [spareParts, setSpareParts] = useState([
//     {
//       description: '',
//       partNo: '',
//       qty: '',
//       otherDetails: ''
//     }
//   ]);
  
 
//   const [clientInfo, setClientInfo] = useState({
//     name: "",
//     contactPerson: "",
//     phone: "",
//     address: "",
//     engineer: ""
//   });

//   const [authorizedSignature, setAuthorizedSignature] = useState("");
//   const [appointmentId, setAppointmentId] = useState("");

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const location = useLocation();
//   const { invoiceNo } = location.state || {};
//   const [template, setTemplate] = useState('');
//   const [documentNumber, setDocumentNumber] = useState(0);


//   useEffect(() => {
    
//     if (location.state) {
//       setClientInfo({
//         name: location.state.clientName || "",
//         contactPerson: location.state.contactPerson || "",
//         phone: location.state.phone || "",
//         address: location.state.address || "",
//         engineer: location.state.engineer.name || "",
        
//       });
//       setAppointmentId(location.state.appointmentId); // Store appointment ID
//       console.log(appointmentId)
//     }
//   }, [location.state]);

//   const addSparePart = () => {
//     setSpareParts([
//       ...spareParts,
//       { description: '', partNo: '', qty: '', otherDetails: '' }
//     ]);
//   };
//   const handleCheckboxChange = (index) => {
//     const updatedRemarks = remarksData.map((item, i) =>
//       i === index ? { ...item, done: !item.done } : item
//     );
//     setRemarksData(updatedRemarks);
//   };

//   const handleRemarkChange = (index, value) => {
//     const updatedRemarks = remarksData.map((item, i) =>
//       i === index ? { ...item, remark: value } : item
//     );
//     setRemarksData(updatedRemarks);
//   };
//   const handleInputChange = (index, field, value) => {
//     const newSpareParts = [...spareParts];
//     newSpareParts[index][field] = value;
//     setSpareParts(newSpareParts);
//   };

//   const handlePrint = async () => {
//     const input = document.getElementById("checklist-content");

//     const printButton = document.getElementById("print-button");
//     if (printButton) {
//         printButton.style.display = "none";
//     }
//     // Configure the pdf options with optimizations
//     const options = {
//         margin:       0.3,  // Reduce margins
//         filename:     'checklist.pdf',
//         image:        { type: 'jpeg', quality: 1 }, // Lower quality for smaller size
//         html2canvas:  { scale: 1.3 }, // Adjust scale for balance between quality and size
//         jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
//     };

//     try {
//         // Generate the PDF
//         const pdf = await html2pdf().from(input).set(options).output('blob');

//         // Prepare PDF for upload
//         const pdfFile = new File([pdf], "checklist.pdf", { type: "application/pdf" });
//         const formData = new FormData();
//         formData.append("pdf", pdfFile);
//         formData.append("checklistData", JSON.stringify({
//             clientInfo,
//             appointmentId,
//             invoiceNo,
//             documentNumber,
//         }));

//         // Send the checklist data and PDF to the backend
//         const token = localStorage.getItem("token");
//         const response = await axios.post(`${API_BASE_URL}/api/checklist`, formData, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "multipart/form-data",
//             },
//         });

//         console.log("Checklist and PDF uploaded successfully", response.data);
//         const pdfUrl = response.data.checklist.pdfPath; // Get pdfPath from the response
//         console.log("Extracted PDF URL:", pdfUrl); // Log the extracted URL

//     } catch (error) {
//         console.error('Error generating or uploading PDF:', error);
//         alert('Failed to upload PDF');
//     }finally {
//         // Show the print button again after PDF generation
//         if (printButton) {
//             printButton.style.display = "block";
//         }
//     }
// };




//   return (
//     <div id="checklist-content">
    
  
//     <div
//       style={{
//         fontFamily: "Arial, sans-serif",
//         margin: "0 auto",
//         padding: "20px",
//         border: "2px solid black",
//         borderRadius: "3px",
//         fontSize: "10px",
//         maxWidth: "210mm", // A4 width
//         minHeight: "297mm", // A4 height
//         boxSizing: "border-box",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: "10px",
//         }}
//       >
//         <img
//           src={logo}
//           alt="Left Logo"
//           style={{ width: "100px", height: "auto", marginRight: "5px" }}
//         />
//         <div style={{ textAlign: "center", flexGrow: 1 }}>
//           <h1 style={{ margin: 0, fontSize: "14px" }}>AEROLUBE ENGINEERS</h1>
//           <p style={{ margin: "1px 0", fontSize: "10px" }}>
//             LANE NO 9, KASIDIH, SAKCHI, JAMSHEDPUR - 831001
//           </p>
//           <p style={{ margin: "1px 0", fontSize: "10px" }}>
//             E-MAIL: aerolube13@gmail.com
//           </p>
//           <p style={{ margin: "1px 0", fontSize: "10px" }}>
//             HELPLINE: 09916823833
//           </p>
//         </div>
//         <img
//           src={logo2}
//           alt="Right Logo"
//           style={{ width: "100px", height: "auto", marginLeft: "5px" }}
//         />
//       </div>



//       <div id="print-button" style={{ marginBottom: "10px" }}>
//         <button
//           onClick={handlePrint}
//           style={{
//             padding: "5px 10px",
//             fontSize: "10px",
//             cursor: "pointer",
//             border: "1px solid #000",
//             backgroundColor: "#f0f0f0",
//             borderRadius: "3px",
//             color: "black"
//           }}
//         >
//           Print
//         </button>
//       </div>




//       <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
//         <h2 style={{ fontSize: "12px" }}>Field Service Report</h2>
//         <p>Service Report No: ________</p>
//         <p>Date: ________</p>
//       </div>

//       <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
//         <h3 style={{ fontSize: "10px" }}>Equipment Details</h3>
//         <div
//           style={{
//             width: "100%",
//             borderCollapse: "collapse",
//             fontSize: "10px",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               border: "1px solid #ccc",
//               backgroundColor: "#f5f5f5",
//             }}
//           >
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "50%" }}
//             >
//               Customer Name
//             </div>
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "30%" }}
//             >
//               Equipment Details
//             </div>
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "10%" }}
//             >
//               Compressor
//             </div>
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "10%" }}
//             >
//               Air Dryer
//             </div>
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "10%" }}
//             >
//               Filter / Eco Drain
//             </div>
//           </div>
//           <div style={{ display: "flex" }}>
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "50%" }}
//             >
//                 Name: _________
//               <br />
//               <br />
//               Contact Person.: _________
//               <br />
//               <br />
//               Phone No.: _________
//               <br />
//               <br />
//               Address: _________
//             </div>
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "30%" }}
//             >
//               Model: _________
//               <br />
//               Part No.: _________
//               <br />
//               Serial No.: _________
//               <br />
//               Running Hrs.: _________
//               <br />
//               Load Hrs.: _________
//               <br />
//               Motor start: _________
//               <br />
//               Load Valve on: _________
//               <br />
//             </div>
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "10%" }}
//             >
//               <span></span>
//             </div>
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "10%" }}
//             >
//               <span></span>
//             </div>
//             <div
//               style={{ border: "1px solid #ccc", padding: "3px", width: "10%" }}
//             >
//               <span></span>
//             </div>
//           </div>
//         </div>
//       </div>


//       <div style={{ borderTop: "1px solid #000", paddingTop: "5px" }}>
//   <h3 style={{ fontSize: "10px", margin: "0" }}>Remarks</h3>

//   <div style={{ display: "flex", borderBottom: "1px solid #ccc", backgroundColor: "#f5f5f5", fontSize: "9px" }}>
//     <div style={{ flex: "4", padding: "2px" }}>Item</div>
//     <div style={{ flex: "1", padding: "2px" }}>Done</div>
//     <div style={{ flex: "5", padding: "2px" }}>Remark</div>
//   </div>

//   {remarksData.map((item, index) => (
//     <div key={index} style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
//       <div style={{ flex: "4", padding: "2px" }}>{item.description}</div>
//       <div style={{ flex: "1", padding: "2px" }}>
//         <input
//           type="checkbox"
//           checked={item.done}
//           onChange={() => handleCheckboxChange(index)}
//           style={{ transform: "scale(0.9)", margin: "0" }} // Smaller checkbox
//         />
//       </div>
//       <div style={{ flex: "5", padding: "2px" }}>
//         <input
//           type="text"
//           value={item.remark}
//           onChange={(e) => handleRemarkChange(index, e.target.value)}
//           style={{ width: "100%", fontSize: "9px", padding: "1px", margin: "0" }} // Reduced font size and padding
//         />
//       </div>
//     </div>
//   ))}

//   {/* Refrigerator List Section */}
//   <div style={{ marginTop: "10px", borderTop: "1px solid #000", paddingTop: "5px" }}>
//     <h3 style={{ fontSize: "10px", margin: "0" }}>Refrigerator List</h3>

//     <div style={{ display: "flex", borderBottom: "1px solid #ccc", backgroundColor: "#f5f5f5", fontSize: "9px" }}>
//       <div style={{ flex: "4", padding: "2px" }}>Item</div>
//       <div style={{ flex: "1", padding: "2px" }}>Done</div>
//       <div style={{ flex: "5", padding: "2px" }}>Remark</div>
//     </div>

//     {RefrigeratoritemNames.map((item, index) => (
//       <div key={index} style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
//         <div style={{ flex: "4", padding: "2px" }}>{item.description}</div>
//         <div style={{ flex: "1", padding: "2px" }}>
//           <input
//             type="checkbox"
//             checked={item.done}
//             onChange={() => handleCheckboxChange(index, 'refrigerator')}
//             style={{ transform: "scale(0.9)", margin: "0" }} // Smaller checkbox
//           />
//         </div>
//         <div style={{ flex: "5", padding: "2px" }}>
//           <input
//             type="text"
//             value={item.remark}
//             onChange={(e) => handleRemarkChange(index, e.target.value, 'refrigerator')}
//             style={{ width: "100%", fontSize: "9px", padding: "1px", margin: "0" }} // Reduced font size and padding
//           />
//         </div>
//       </div>
//     ))}
//   </div>
// </div>






//       <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
//   <h3 style={{ fontSize: "10px" }}>
//     Guidelines For Performance Improvement:
//   </h3>
//   <input type="text" style={{ width: "100%", border: "none", borderBottom: "1px solid #000", outline: "none" }}  />
// </div>

// <div style={{ borderTop: "2px solid #000", paddingTop: "10px" }}>
//   <h3 style={{ fontSize: "10px" }}>Customer Remark:</h3>
//   <input type="text" style={{ width: "100%", border: "none", borderBottom: "1px solid #000", outline: "none" }}  />
// </div>


//       <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
//         <h3 style={{ fontSize: "10px" }}>Consumed Parts Description</h3>
//         <table
//           style={{
//             width: "100%",
//             borderCollapse: "collapse",
//             marginTop: "5px",
//             fontSize: "10px",
//           }}
//         >
//           <thead>
//             <tr>
//               <th
//                 style={{
//                   border: "1px solid #ccc",
//                   padding: "5px",
//                   backgroundColor: "#f5f5f5",
//                   fontSize: "10px",
//                 }}
//               >
//                 Description
//               </th>
//               <th
//                 style={{
//                   border: "1px solid #ccc",
//                   padding: "5px",
//                   backgroundColor: "#f5f5f5",
//                   fontSize: "10px",
//                 }}
//               >
//                 Part No.
//               </th>
//               <th
//                 style={{
//                   border: "1px solid #ccc",
//                   padding: "5px",
//                   backgroundColor: "#f5f5f5",
//                   fontSize: "10px",
//                 }}
//               >
//                 Qty.
//               </th>
//               <th
//                 style={{
//                   border: "1px solid #ccc",
//                   padding: "5px",
//                   backgroundColor: "#f5f5f5",
//                   fontSize: "10px",
//                 }}
//               >
//                 Other Used Parts Details
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td style={{ border: "1px solid #ccc", padding: "5px" }}>
//                 ________________________________________________________
//               </td>
//               <td style={{ border: "1px solid #ccc", padding: "5px" }}>
//                 ____________
//               </td>
//               <td style={{ border: "1px solid #ccc", padding: "5px" }}>____</td>
//               <td style={{ border: "1px solid #ccc", padding: "5px" }}>
//                 ________________________________________________________
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
//     <h3 style={{ fontSize: "10px" }}>Work Timings</h3>
//     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//         <span>Start of work: <input type="text" style={{ width: '80px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />:</span>
//         <span><input type="text" style={{ width: '80px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
//         <span>End of work: <input type="text" style={{ width: '80px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} />:</span>
//         <span><input type="text" style={{ width: '80px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
//         <span>Date: <input type="text" style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
//     </div>
//     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//         <span>Technician Name: <input type="text" style={{ width: '200px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
//         <span>Contact Person Name: <input type="text" style={{ width: '200px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
//     </div>
//     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <span>Mobile No.: <input type="text" style={{ width: '150px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
//         <span>E-mail: <input type="text" style={{ width: '200px', border: 'none', borderBottom: '1px solid #000', margin: '0 5px' }} /></span>
//     </div>
// </div>


// <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
//       <h3 style={{ fontSize: "10px", display: 'inline' }}>
//         List of Spare Parts Required for Next Visit
//       </h3>
//       <button
//         onClick={addSparePart}
//         style={{
//           fontSize: "10px",
//           marginLeft: "10px",
//           cursor: "pointer",
//           backgroundColor: "#f5f5f5",
//           border: "1px solid #ccc",
//           borderRadius: "4px",
//           padding: "2px 5px",
//           color: 'black'
//         }}
//       >
//         +
//       </button>
//       <table
//         style={{
//           width: "100%",
//           borderCollapse: "collapse",
//           marginTop: "5px",
//           fontSize: "10px",
//         }}
//       >
//         <thead>
//           <tr>
//             <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>
//               Description
//             </th>
//             <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>
//               Part No.
//             </th>
//             <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>
//               Qty.
//             </th>
//             <th style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f5f5f5" }}>
//               Other Required Parts Details
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {spareParts.map((part, index) => (
//             <tr key={index}>
//               <td style={{ border: "1px solid #ccc", padding: "5px" }}>
//                 <input
//                   type="text"
//                   value={part.description}
//                   onChange={(e) => handleInputChange(index, 'description', e.target.value)}
//                   style={{ width: "100%" }}
//                 />
//               </td>
//               <td style={{ border: "1px solid #ccc", padding: "5px" }}>
//                 <input
//                   type="text"
//                   value={part.partNo}
//                   onChange={(e) => handleInputChange(index, 'partNo', e.target.value)}
//                   style={{ width: "100%" }}
//                 />
//               </td>
//               <td style={{ border: "1px solid #ccc", padding: "5px" }}>
//                 <input
//                   type="number"
//                   value={part.qty}
//                   onChange={(e) => handleInputChange(index, 'qty', e.target.value)}
//                   style={{ width: "100%" }}
//                 />
//               </td>
//               <td style={{ border: "1px solid #ccc", padding: "5px" }}>
//                 <input
//                   type="text"
//                   value={part.otherDetails}
//                   onChange={(e) => handleInputChange(index, 'otherDetails', e.target.value)}
//                   style={{ width: "100%" }}
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>

//       <div style={{ borderTop: "1px solid #000", paddingTop: "10px" }}>
//         <h3 style={{ fontSize: "10px" }}>Final Remarks</h3>
//         <p>Work done: Yes / No &nbsp; Work accepted: Yes / No</p>
//       </div>

//       <div
//         style={{
//           borderTop: "1px solid #000",
//           paddingTop: "10px",
//           display: "flex",
//           justifyContent: "space-between",
//         }}
//       >
//         <div style={{ flex: 1 }}>
//           <p style={{ margin: 0 }}>
//             Technician's Signature: ____________________________
//           </p>
//         </div>
//         <div style={{ flex: 1, textAlign: "center" }}>
//           <p style={{ margin: 0 }}>
//             Customer's Signature: ____________________________
//           </p>
//         </div>
//         <div style={{ flex: 1, textAlign: "right" }}>
//           <p style={{ margin: 0 }}>
//             Signee's Name (in block letters): ____________________________
//           </p>
//         </div>
//       </div>
//     </div>
//     </div>
//   );
// };

// export default ChecklistPage3;
