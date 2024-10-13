import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "./comp-logo.jpeg";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';

import MessageTemplate from "../MessageTemplate";
import {
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    Menu,
  } from "@mui/material";
import axios from "axios";
import { toast } from 'react-toastify';

import "../Pdf Generator/PdfGenerator.css";
import Sidebar from "./Sidebar";
import Footer from "../Footer";
import Navbar from "./Navbar";
const EditAdminQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientInfo: { name: "", contactPerson: "", phone: "", address: "" },
    appointmentId: "",
    quotationNo: "",
    quotationAmount: 0,
    items: [],
    gst: 0,
  });

  
  const [itemData, setItemData] = useState({
    itemName: "",
    quantity: 0,
    rate: 0,
  });


  // Function to toggle the sidebar visibility
  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Function to handle drawer toggle
  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

   // Header Component
   const Header = () => (
    <AppBar position="fixed" sx={{ backgroundColor: 'gray', zIndex: 1201 }}>
      <Toolbar>
        <IconButton color="white" onClick={handleToggleSidebar}>
          <Menu />
        </IconButton>
        <img
          src={logo}
          alt="Company Logo"
          style={{ width: 40, height: 40, marginRight: 10 }}
        />
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 'bold' }}
        >
          AEROLUBE ENGINEERS
        </Typography>
      </Toolbar>
    </AppBar>
  );

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/quotations/edit/${id}`);
        setFormData(response.data.quotation);
      } catch (error) {
        console.error("Error fetching quotation:", error);
        toast.error("Failed to load quotation.");
      }
    };
    fetchQuotation();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("clientInfo.")) {
      const field = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        clientInfo: {
          ...prevData.clientInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
  
    // Update the specific field
    updatedItems[index][name] = value;
  
    // Parse the values correctly
    const quantity = parseFloat(updatedItems[index].quantity) || 0;
    const rate = parseFloat(updatedItems[index].rate) || 0;
    const gstPercentage = parseFloat(updatedItems[index].gstPercentage) || 0;
  
    // Calculate values
    const total = quantity * rate;
    const gstAmount = (total * gstPercentage) / 100;
    const totalWithGST = total + gstAmount;
  
    // Update calculated values
    updatedItems[index].gstAmount = gstAmount;
    updatedItems[index].totalWithGST = totalWithGST;
  
    // Update the state
    setFormData(prevData => ({
      ...prevData,
      items: updatedItems,
      quotationAmount: calculateTotalAmount(updatedItems),
    }));
  };
  

  
  

  const calculateTotalAmount = (items) => {
    return items.reduce((total, item) => {
      const totalWithGST = Number(item.totalWithGST) || 0;
      return total + totalWithGST;
    }, 0).toFixed(2);
  };

  // PDF generation function
// PDF generation function
const generatePDF = async (data) => {
  const doc = new jsPDF();
  const logoWidth = 40;
  const logoHeight = 40;
  const imgData = logo; // Make sure `logo` is defined in your context

  // Add logo
  doc.addImage(imgData, 'PNG', 10, 10, logoWidth, logoHeight);

  // Company Information
  doc.setDrawColor(200);
  doc.setFillColor(240, 240, 240);
  doc.rect(60, 10, 100, 25, 'F');
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text('AEROLUBE ENGINEERS', 65, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text('Works: LANE NO. 09, 264 A, KASIDIH, SAKCHI', 65, 22);
  doc.text('           East Singhbhum,Jharkhand, 831001', 65, 26);
  doc.text('GST NO: 20CJOPS0713D1ZM', 65, 30);

  // Quotation Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 100);
  doc.text('QUOTATION', 105, 55, null, null, 'center');

  // Bill To Section
  doc.setDrawColor(200);
  doc.setFillColor(240, 240, 240);
  doc.rect(10, 60, 190, 40, 'F');
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`BILL TO:`, 15, 67);

  const buyerDetails = [
    [`Quotation No: ${formData.quotationNo}`, `Invoice: ${data.invoiceNumber}`],
    [`Customer: ${formData.clientInfo.name}`, `Invoice Date: ${data.docDate}`],
    [`Contact: ${formData.clientInfo.contactPerson}`, `Mobile: ${formData.clientInfo.phone}`],
    [`Address: ${formData.clientInfo.address}`, '']
  ];

  const buyerStartY = 73;
  buyerDetails.forEach((line, index) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(line[0], 15, buyerStartY + index * 6);
    if (line[1]) {
      doc.text(line[1], 110, buyerStartY + index * 6);
    }
  });

  // Item Table
  const itemColumns = ['Sr. No', 'Item Name', 'Qty', 'Rate', 'GST Amount', 'Amount'];
  const itemRows = data.items.map((item, index) => [
    index + 1,
    item.itemName,
    item.quantity,
    !isNaN(item.rate) ? Number(item.rate).toFixed(2) : '0.00',
    !isNaN(item.gstAmount) ? Number(item.gstAmount).toFixed(2) : '0.00',
    !isNaN(item.totalWithGST) ? Number(item.totalWithGST).toFixed(2) : '0.00'
  ]);

  // Fill empty rows if less than 10
  for (let i = itemRows.length; i < 10; i++) {
    itemRows.push([i + 1, '', '', '', '', '']);
  }

  doc.autoTable(itemColumns, itemRows, {
    startY: 110,
    theme: 'striped',
    headStyles: { fillColor: [150, 150, 255], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
    styles: { cellPadding: 2, fontSize: 9, halign: 'center', fillColor: [240, 240, 240] }
  });

  // Amount Summary
  const amountSummaryY = doc.lastAutoTable.finalY + 10;
  doc.setDrawColor(200);
  doc.setFillColor(240, 240, 240);
  doc.rect(10, amountSummaryY, 190, 50, 'F');
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(`AMOUNT PAYABLE`, 15, amountSummaryY + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total Amount(Incl. GST): ${(formData.quotationAmount * 1).toFixed(2)}`, 15, amountSummaryY + 32);

  // Authorised Signatory
  const signatoryY = amountSummaryY + 55;
  doc.setDrawColor(200);
  doc.setFillColor(240, 240, 240);
  doc.rect(10, signatoryY, 190, 30, 'F');
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text('Authorised Signatory:', 15, signatoryY + 10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(data.authorisedSignatory || ' ', 15, signatoryY + 18); // Ensure a valid string

  // Payment Instructions
  const paymentY = signatoryY + 40;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text('Payment Instructions:', 15, paymentY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text('Please make the payment within 30 days of receipt of this invoice.', 15, paymentY + 6);
  doc.text('Bank Details: XYZ Bank, Account No: 123456789, IFSC: XYZ1234', 15, paymentY + 12);

  // Footer
  const footerY = paymentY + 30;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  doc.text('Thank you for your business!', 15, footerY);
  doc.text('For any queries, please contact us at info@company.com', 15, footerY + 5);

    // Save the PDF
    const pdfBlob = doc.output('blob');
   return pdfBlob;


};

const uploadPDF = async (id, data) => {
  // Create FormData to hold the PDF file
  const formData = new FormData();
  formData.append('pdf', data.pdfBlob, `quotation_${id}.pdf`); // Set filename as desired

  // Send the request to your backend
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/quotations/${id}/upload-pdf`, {
      method: 'PATCH',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to upload PDF');
    }
    const result = await response.json();
    // console.log('PDF uploaded successfully:', result);
    // console.log("Quotation and PDF uploaded successfully", result.quotation);
    const phone = result.quotation.clientInfo.phone;
    const pdfUrl = result.quotation.pdfPath; // Get pdfPath from the first checklist object
    // console.log("Extracted PDF URL:", pdfUrl,phone); 
    await handleSendPdfToMobile(pdfUrl, phone);
    
  } catch (error) {
    console.error('Error uploading PDF:', error);
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Update the quotation
    await axios.put(`${API_BASE_URL}/api/quotations/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    toast.success("Quotation updated successfully!");

    // Generate the updated PDF
    const pdfBlob = await generatePDF(formData);

    // Call the uploadPDF function with the quotation ID and generated PDF data
    await uploadPDF(id, { ...formData, pdfBlob });

    // Navigate to the quotation list
    navigate("/quotation-list");

  } catch (error) {
    console.error("Error updating quotation:", error);
    toast.error("Failed to update quotation.");
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


  const addItem = () => {
    const quantity = parseFloat(itemData.quantity) || 0;
    const rate = parseFloat(itemData.rate) || 0;
    const gstPercentage = parseFloat(formData.gst) || 0; // This gets the default GST percentage
  
    const total = quantity * rate;
    const gstAmount = (total * gstPercentage) / 100;
    const totalWithGST = total + gstAmount;
  
    const newItem = {
      ...itemData,
      gstPercentage, // Add GST percentage here
      gstAmount,
      totalWithGST,
    };
  
    setFormData(prevData => {
      const updatedItems = [...prevData.items, newItem];
      return {
        ...prevData,
        items: updatedItems,
        quotationAmount: calculateTotalAmount(updatedItems),
      };
    });
  
    // Reset item data
    setItemData({ itemName: "", quantity: 0, rate: 0 });
  };
  

  return (
    <>
    {sidebarOpen && <Sidebar />}
    <Navbar onMenuClick={handleToggleSidebar} />
    <div className="container-pdf">
      <h2>Quotations</h2>
      <form className="form-box" onSubmit={handleSubmit}>
        <h4>Buyer Details</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Buyer Name:</label>
            <input type="text" name="buyerName" value={formData.clientInfo.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Quotation No:</label>
            <input type="text" name="quotationNo" value={formData.quotationNo} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Address:</label>
          <input type="text" name="address" value={formData.clientInfo.address} onChange={handleChange} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Contact Person:</label>
            <input type="text" name="contactPerson" value={formData.clientInfo.contactPerson} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Mobile No:</label>
            <input type="text" name="mobileNo" value={formData.clientInfo.phone} onChange={handleChange} />
          </div>
        </div>
        <h4>Item Details</h4>
{formData.items.map((item, index) => (
  <div key={index} className="item-entry">
    <div className="form-row">
      <div className="form-group">
        <label>Item Name:</label>
        <input type="text" name="itemName" value={item.itemName} onChange={(e) => handleItemChange(index, e)} />
      </div>
      <div className="form-group">
        <label>Quantity:</label>
        <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} />
      </div>
      <div className="form-group">
        <label>Rate:</label>
        <input type="number" name="rate" value={item.rate} onChange={(e) => handleItemChange(index, e)} />
      </div>
      <div className="form-group">
        <label>GST (%):</label>
        <input 
          type="number" 
          name="gstPercentage" 
          value={item.gstPercentage || 0} 
          onChange={(e) => handleItemChange(index, e)} // Allow changes to GST percentage
        />
      </div>
      {/* <div className="form-group">
        <label>GST Amount:</label>
        <input 
          type="number" 
          name="gstAmount" 
          value={item.gstAmount} 
           // Keep GST amount read-only
        />
      </div> */}
      <div className="form-group">
        <label>Total:</label>
        <input type="number" name="totalWithGST" value={item.totalWithGST} readOnly />
      </div>
    </div>
  </div>
))}


        <h4>Add New Item</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Item Name:</label>
            <input type="text" name="itemName" value={itemData.itemName} onChange={(e) => setItemData({ ...itemData, itemName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input type="number" name="quantity" value={itemData.quantity} onChange={(e) => setItemData({ ...itemData, quantity: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Rate:</label>
            <input type="number" name="rate" value={itemData.rate} onChange={(e) => setItemData({ ...itemData, rate: e.target.value })} />
          </div>
          <div className="form-group">
            <label>GST (%):</label>
            <input type="number" name="gst" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Total:</label>
            <input type="number" value={(itemData.quantity * itemData.rate * (1 + formData.gst / 100)).toFixed(2) || 0} readOnly />
          </div>
          <button type="button" onClick={addItem}>
            Add Item
          </button>
        </div>

        <h4>Additional Details</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Total Quotation Amount:</label>
            <input type="number" name="totalAmount" value={formData.quotationAmount} readOnly />
          </div>
        </div>
        <div className="button-container">
          <button type="submit">Update Quotation</button>
        </div>
      </form>
    </div>
    <Footer />
    </>
  );
};

export default EditAdminQuotation;
