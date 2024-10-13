const Quotation = require("../models/Quotation");
const multer = require("multer");
const path = require("path");
const Appointment = require("../models/Appointment");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Use memory storage to handle uploads directly
const upload = multer({ storage });

// Save quotation and link it to an existing appointment
const saveQuotation = async (req, res) => {
  try {
    if (!req.body.quotationData) {
      console.log('Quotation data is missing.');
      return res.status(400).json({ message: 'Quotation data is required.' });
    }

    let appointmentId, clientInfo, quotationNo, quotationAmount, items,invoiceNo;

    // Attempt to parse quotationData
    try {
      const { appointmentId: id, clientInfo: info, quotationNo: string, quotationAmount: amount, items: itemList ,invoiceNo: invoice} = JSON.parse(req.body.quotationData);
      appointmentId = id;
      clientInfo = info;
      quotationNo = string;
      quotationAmount = amount; 
      items = itemList; 
      invoiceNo = invoice;
    } catch (jsonError) {
      console.log('JSON parsing error:', jsonError);
      return res.status(400).json({ message: 'Invalid JSON format for quotation data.' });
    }

    // Upload file to Cloudinary
    let pdfPath = null;
    if (req.file) {
      // Use a promise to wait for the upload to complete
      pdfPath = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" ,folder: "quotations"},
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              const cleanUrl = result.secure_url.replace(/\/v[^\/]+\//, '/');
          resolve(cleanUrl);

            }
          }
        );

        stream.end(req.file.buffer); // Send the file buffer to Cloudinary
      });
    }

    // Create a new Quotation instance, with the `createdBy` set to the authenticated engineer's ID
    const newQuotation = new Quotation({
      clientInfo,
      appointmentId,
      quotationNo,
      quotationAmount, 
      items, 
      pdfPath,
      invoiceNo,
      status: false,
      createdBy: req.user.userId 
    });

    const savedQuotation = await newQuotation.save();
    console.log('Saved quotation:', savedQuotation);

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log('Appointment not found for ID:', appointmentId);
      return res.status(404).json({ message: "Appointment not found." });
    }

    appointment.quotations.push(savedQuotation._id);
    await appointment.save();

    res.status(201).json({ quotation: savedQuotation, appointment });
  } catch (error) {
    console.error('Error saving quotation:', error);
    res.status(500).json({ message: error.message });
  }
};


const getAllQuotations = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const quotations = await Quotation.find(isAdmin ? {} : { createdBy: req.user.userId }).populate('appointmentId');
    res.status(200).json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: error.message });
  }
};

const editQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientInfo, appointmentId, quotationNo, items } = req.body;

    const isAdmin = req.user.role === 'admin';
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    if (!isAdmin && quotation.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to edit this quotation.' });
    }

    const quotationAmount = items.reduce((total, item) => {
      return total + item.totalWithGST;
    }, 0);

    const updatedData = {
      clientInfo: clientInfo || quotation.clientInfo,
      appointmentId: appointmentId || quotation.appointmentId,
      quotationNo: quotationNo || quotation.quotationNo,
      quotationAmount,
      items: items || quotation.items
    };

    // Handle PDF upload if a new file is provided
    if (req.file) {
      // Upload new PDF to Cloudinary
      const pdfPath = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" ,folder: "quotations"},
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              const cleanUrl = result.secure_url.replace(/\/v[^\/]+\//, '/');
          resolve(cleanUrl);

            }
          }
        );

        stream.end(req.file.buffer);
      });
      
      // Update the pdfPath in updatedData
      updatedData.pdfPath = pdfPath; // Ensure you have a field for storing this
    }

    // Update the quotation with the new data
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    res.status(200).json({ quotation: updatedQuotation });
  } catch (error) {
    console.error('Error editing quotation:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateQuotationPdf = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    // Check if a new file is provided
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Upload new PDF to Cloudinary
    const pdfPath = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto",folder: "quotations" },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            const cleanUrl = result.secure_url.replace(/\/v[^\/]+\//, '/');
          resolve(cleanUrl);

          }
        }
      );

      stream.end(req.file.buffer);
    });

    // Update the quotation's pdfPath with the new one
    quotation.pdfPath = pdfPath;
    await quotation.save();

    res.status(200).json({ message: 'PDF updated successfully.', quotation });
  } catch (error) {
    console.error('Error updating PDF:', error);
    res.status(500).json({ message: error.message });
  }
};







const updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    // Check if the user is an admin or the creator of the quotation
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && quotation.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to update this quotation status.' });
    }

    // Toggle the status and set statusChangedOn
    quotation.status = !quotation.status; 
    quotation.statusChangedOn = Date.now(); // Update statusChangedOn field
    await quotation.save();

    res.status(200).json({ message: 'Quotation status updated.', quotation });
  } catch (error) {
    console.error('Error updating quotation status:', error);
    res.status(500).json({ message: error.message });
  }
};


const getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }
    res.status(200).json({ quotation });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ message: error.message });
  }
};


const deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    // Check if the user is an admin or the creator of the quotation
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && quotation.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this quotation.' });
    }

    // Delete the quotation
    await Quotation.findByIdAndDelete(id);

    // Optionally, update the related appointment
    const appointment = await Appointment.findById(quotation.appointmentId);
    if (appointment) {
      appointment.quotations.pull(quotation._id);
      await appointment.save();
    }

    res.status(200).json({ message: 'Quotation deleted successfully.' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ message: error.message });
  }
};

const getQuotationSummary = async (req, res) => {
  try {
    const userId = req.user.userId; // Get the user ID from the request
    const quotations = await Quotation.find({ createdBy: userId });

    // Calculate total, pending, and completed amounts
    let totalAmount = 0;
    let pendingAmount = 0;
    let completedAmount = 0;

    quotations.forEach(quotation => {
      totalAmount += quotation.quotationAmount || 0;
      if (quotation.status) {
        completedAmount += quotation.quotationAmount || 0;
      } else {
        pendingAmount += quotation.quotationAmount || 0;
      }
    });

    res.status(200).json({
      totalAmount,
      pendingAmount,
      completedAmount,
      totalQuotations: quotations.length,
    });
  } catch (error) {
    console.error('Error fetching quotation summary:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminQuotationSummary = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Fetch all quotations and populate the createdBy field to get engineer details
    const quotations = await Quotation.find().populate('createdBy', 'name');

    // Initialize overall amounts
    let overallTotalAmount = 0;
    let overallPendingAmount = 0;
    let overallCompletedAmount = 0;

    // Initialize summary object for each engineer
    const summary = {};
    const dailySummary = {}; // New object for daily summaries

    quotations.forEach(quotation => {
      const engineerId = quotation.createdBy._id.toString();
      const engineerName = quotation.createdBy.name || 'Unknown';

      // Initialize summary for this engineer if not present
      if (!summary[engineerId]) {
        summary[engineerId] = {
          engineerName: engineerName,
          totalAmount: 0,
          pendingAmount: 0,
          completedAmount: 0,
          totalQuotations: 0,
        };
      }

      // Update overall totals
      summary[engineerId].totalAmount += quotation.quotationAmount || 0;
      overallTotalAmount += quotation.quotationAmount || 0; // Add to overall total
      summary[engineerId].totalQuotations += 1;

      // Update amounts based on quotation status
      if (quotation.status) {
        summary[engineerId].completedAmount += quotation.quotationAmount || 0;
        overallCompletedAmount += quotation.quotationAmount || 0; // Add to overall completed
      } else {
        summary[engineerId].pendingAmount += quotation.quotationAmount || 0;
        overallPendingAmount += quotation.quotationAmount || 0; // Add to overall pending
      }

      // Grouping by date for daily summary
      const generatedDate = quotation.generatedOn.toISOString().split('T')[0]; // Extracting date (YYYY-MM-DD)
      if (!dailySummary[generatedDate]) {
        dailySummary[generatedDate] = {};
      }

      // Initialize engineer entry for this date if not present
      if (!dailySummary[generatedDate][engineerId]) {
        dailySummary[generatedDate][engineerId] = {
          engineerName: engineerName,
          totalCreated: 0,
          totalCreatedAmount: 0, // Total amount of quotations created that day
          totalCompleted: 0,
          totalCompletedAmount: 0, // Total amount of completed quotations that day
          totalPending: 0,
          totalPendingAmount: 0, // Total amount of pending quotations that day
        };
      }

      // Update daily summary for this engineer
      dailySummary[generatedDate][engineerId].totalCreated += 1;
      dailySummary[generatedDate][engineerId].totalCreatedAmount += quotation.quotationAmount || 0;

      if (quotation.status) {
        dailySummary[generatedDate][engineerId].totalCompleted += 1;
        dailySummary[generatedDate][engineerId].totalCompletedAmount += quotation.quotationAmount || 0;
      } else {
        dailySummary[generatedDate][engineerId].totalPending += 1;
        dailySummary[generatedDate][engineerId].totalPendingAmount += quotation.quotationAmount || 0;
      }
    });

    // Convert summary object to an array for response
    const summaryArray = Object.values(summary);
    const dailySummaryArray = Object.entries(dailySummary).map(([date, engineers]) => ({
      date,
      engineers: Object.values(engineers),
    }));

    res.status(200).json({
      overallTotalAmount,
      overallPendingAmount,
      overallCompletedAmount,
      engineerSummary: summaryArray,
      dailySummary: dailySummaryArray, // Include the daily summary in the response
    });
  } catch (error) {
    console.error('Error fetching admin quotation summary:', error);
    res.status(500).json({ message: error.message });
  }
};


const getQuotationsByEngineer = async (req, res) => {
  try {
    const { engineerId } = req.params; // Get the engineer ID from the URL parameters
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30); // Last 30 days

    // Fetch quotations created by the specified engineer within the last 30 days
    const quotations = await Quotation.find({
      createdBy: engineerId,
      generatedOn: { $gte: startDate },
    }).populate('createdBy', 'name'); // Populate with engineer name

    res.status(200).json(quotations);
  } catch (error) {
    console.error('Error fetching quotations by engineer:', error);
    res.status(500).json({ message: "Error fetching quotations." });
  }
};


module.exports = {
  saveQuotation,
  upload,
  getAllQuotations,
  editQuotation,
  getQuotationById,
  updateQuotationStatus,
  deleteQuotation,
  getQuotationSummary,
  getAdminQuotationSummary,
  getQuotationsByEngineer,
  updateQuotationPdf, // Export the delete function
};

