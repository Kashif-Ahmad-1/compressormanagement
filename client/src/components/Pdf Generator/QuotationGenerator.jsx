import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import "./PdfGenerator.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import logo from './comp-logo.jpeg';
import {API_BASE_URL,WHATSAPP_CONFIG} from './../../config';
import { toast } from 'react-toastify';
import MessageTemplate from "../MessageTemplate";
import Footer from "../Footer";
import {
   Typography,
  Button,
    AppBar,
  Toolbar,

} from "@mui/material";
import Sidebar from "../EngineerPage/Sidebar";
import Menu from '@mui/icons-material/Menu';
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

const QuotationGenerator = () => {
  const formRef = useRef();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clientName, contactPerson, address, mobileNo, appointmentId,invoiceNumber,engineer } = location.state || {};

  const generateQuotationNo = () => "QT" + Math.floor(Math.random() * 100000);
  const formatDate = (date) => date.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });

  const [clientInfo, setClientInfo] = useState({
    name: clientName || "",
    contactPerson: contactPerson || "",
    phone: mobileNo || "",
    address: address || "",
    appointmentId: appointmentId || "",
    engineer: engineer || "",
  });

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const [itemData, setItemData] = useState({
    itemName: "",
    quantity: "",
    rate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "gst") {
      updateTotalWithGST(value);
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addItem = () => {
    if (itemData.itemName && itemData.quantity && itemData.rate) {
      const quantity = parseFloat(itemData.quantity);
      const rate = parseFloat(itemData.rate);
      const total = quantity * rate;
      const gstAmount = (total * formData.gst) / 100;
      const totalWithGST = total + gstAmount;

      const newItem = { ...itemData, total, gstAmount, totalWithGST };
      setFormData((prevData) => {
        const updatedItems = [...prevData.items, newItem];
        const totalAmount = calculateTotalAmount(updatedItems);
        const totalWithGST = calculateTotalWithGST(totalAmount, prevData.gst);
        
        // Update quotationAmount in formData
        return {
          ...prevData,
          items: updatedItems,
          totalAmount,
          totalWithGST,
          quotationAmount: totalWithGST // Store total with GST in quotationAmount
        };
      });
      setItemData({ itemName: "", quantity: "", rate: "" });
    }
  };

  const calculateTotalAmount = (items) => {
    return items.reduce((acc, item) => acc + (item.total || 0), 0);
  };

  const calculateTotalWithGST = (totalAmount, gstPercentage) => {
    const gstAmount = (totalAmount * gstPercentage) / 100;
    return totalAmount + gstAmount;
  };

  const updateTotalWithGST = (gstPercentage) => {
    const totalAmount = calculateTotalAmount(formData.items);
    const totalWithGST = calculateTotalWithGST(totalAmount, gstPercentage);
    setFormData((prevData) => ({
      ...prevData,
      totalAmount,
      totalWithGST,
      quotationAmount: totalWithGST // Update quotationAmount when GST changes
    }));
  };


  const [formData, setFormData] = useState({
    buyerName: clientName || "",
    quotationNo: generateQuotationNo(),
    quotationAmount: "",  // Store total amount here
    docDate: formatDate(new Date()),
    address: address || "",
    contactPerson: contactPerson || "",
    mobileNo: mobileNo || "",
    invoiceNumber: invoiceNumber || "",
    email: "",
    items: [],
    gst: 18,
    totalAmount: 0,
    totalWithGST: 0,
    advance: "",
    validity: "",
    authorisedSignatory: engineer || "",
    engineer: engineer || "",
  });


 const generatePDF = async () => {
  const doc = new jsPDF();
  const logoWidth = 40;
  const logoHeight = 40;
  const imgData = logo;

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
    [`Quotation No: ${formData.quotationNo}`, `Invoice: ${formData.invoiceNumber}`],
    [`Customer: ${formData.buyerName}`, `Invoice Date: ${formData.docDate}`],
    [`Contact: ${formData.contactPerson}`, `Mobile: ${formData.mobileNo}`],
    [`Address: ${formData.address}`, '']
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
  const itemRows = formData.items.map((item, index) => [
    index + 1,
    item.itemName,
    item.quantity,
    !isNaN(item.rate) ? Number(item.rate).toFixed(2) : '0.00',
    !isNaN(item.gstAmount) ? Number(item.gstAmount).toFixed(2) : '0.00',
    !isNaN(item.totalWithGST) ? Number(item.totalWithGST).toFixed(2) : '0.00'
  ]);

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
  doc.text(`Total Amount(Incl. GST): ${(formData.totalAmount * 1.18).toFixed(2)}`, 15, amountSummaryY + 32);

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
  doc.text(formData.authorisedSignatory, 15, signatoryY + 18);

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

  // Finalize PDF
  const pdfBlob = doc.output("blob");
  const pdfFile = new File([pdfBlob], "quotation.pdf", { type: "application/pdf" });

  const formDatas = new FormData();
  formDatas.append("pdf", pdfFile);
  formDatas.append("quotationData", JSON.stringify({ 
    clientInfo, 
    appointmentId, 
    quotationNo: formData.quotationNo,
    items: formData.items,
    invoiceNo: formData.invoiceNumber,
    quotationAmount: formData.quotationAmount 
  }));

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_BASE_URL}/api/quotations`, formDatas, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Quotation and PDF uploaded successfully", response.data);

    const pdfUrl = response.data.quotation.pdfPath; 
    console.log("Extracted PDF URL:", pdfUrl); 
   
   
         // Send the PDF URL to WhatsApp
         console.log("Sending PDF to mobile:", pdfUrl, "to", clientInfo.phone); // Debugging line
         await handleSendPdfToMobile(pdfUrl, clientInfo.phone);
         toast.success("PDF sent to mobile successfully!");
  } catch (error) {
    console.error("Error uploading quotation and PDF:", error);
  }
  // doc.save("quotation.pdf");
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

  return (
    <>
    {sidebarOpen && <Sidebar />}
    <Header onToggleSidebar={handleToggleSidebar} />
    <div className="container-pdf" ref={formRef}>
      <h2>Quotations</h2>
      <form className="form-box">
        <h4>Buyer Details</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Buyer Name:</label>
            <input type="text" name="buyerName" value={clientInfo.name} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Quotation No:</label>
            <input type="text" name="quotationNo" value={formData.quotationNo} readOnly />
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input type="text" name="docDate" value={formData.docDate} readOnly />
          </div>
        </div>
        <div className="form-group">
          <label>Address:</label>
          <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Contact Person:</label>
            <input type="text" name="contactPerson" value={clientInfo.contactPerson} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Mobile No:</label>
            <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} />
          </div>
        </div>

        <h4>Item Details</h4>
        {formData.items.map((item, index) => (
          <div key={index} className="item-entry">
            <div className="form-row">
              <div className="form-group">
                <label>Item Name:</label>
                <input type="text" value={item.itemName} readOnly />
              </div>
              <div className="form-group">
                <label>Quantity:</label>
                <input type="number" value={item.quantity} readOnly />
              </div>
              <div className="form-group">
                <label>Rate:</label>
                <input type="number" value={item.rate} readOnly />
              </div>
              <div className="form-group">
                <label>GST Amount:</label>
                <input type="number" value={item.gstAmount.toFixed(2)} readOnly />
              </div>
              <div className="form-group">
                <label>Total:</label>
                <input type="number" value={item.totalWithGST.toFixed(2)} readOnly />
              </div>
            </div>
          </div>
        ))}

        <h4>Add New Item</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Item Name:</label>
            <input type="text" name="itemName" value={itemData.itemName} onChange={handleItemChange} />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input type="number" name="quantity" value={itemData.quantity} onChange={handleItemChange} />
          </div>
          <div className="form-group">
            <label>Rate:</label>
            <input type="number" name="rate" value={itemData.rate} onChange={handleItemChange} />
          </div>
          <div className="form-group">
            <label>GST (%):</label>
            <input type="number" name="gst" value={formData.gst} onChange={handleInputChange} />
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
            <label>Total Amount:</label>
            <input type="number" value={formData.totalWithGST.toFixed(2)} readOnly />
          </div>
          <div className="form-group">
            <label>Advance Payment Details:</label>
            <input type="text" name="advance" value={formData.advance} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Validity:</label>
            <input type="text" name="validity" value={formData.validity} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Authorised Signatory:</label>
            <input type="text" name="authorisedSignatory" value={formData.authorisedSignatory} onChange={handleInputChange} />
          </div>
        </div>
        <div className="button-container">
          <button type="button" onClick={generatePDF}>
            Generate PDF
          </button>
        </div>
       
      </form>
    </div>
    <Footer />
    </>
  );
};

export default QuotationGenerator;
