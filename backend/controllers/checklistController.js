const Checklist = require("../models/Checklist");
const multer = require("multer");
const Counter = require("../models/Counter");
const path = require("path");
const Appointment = require("../models/Appointment");
require('dotenv').config();


const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Use memory storage to handle uploads directly
const upload = multer({ storage });

// Save checklist and link it to an existing appointment
const saveChecklist = async (req, res) => {
  try {
    if (!req.body.checklistData) {
      return res.status(400).json({ message: 'Checklist data is required.' });
    }

    let appointmentId, clientInfo, invoiceNo, documentNumber;

    // Attempt to parse checklistData
    try {
      const { appointmentId: id, clientInfo: info, invoiceNo: string, documentNumber: number } = JSON.parse(req.body.checklistData);
      appointmentId = id;
      clientInfo = info;
      invoiceNo = string;
      documentNumber = number;
    } catch (jsonError) {
      console.log('JSON parsing error:', jsonError);
      return res.status(400).json({ message: 'Invalid JSON format for checklist data.' });
    }

    // Upload file to Cloudinary
    let pdfPath = null;
    if (req.file) {
      // Use a promise to wait for the upload to complete
      pdfPath = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto",folder: "service record" },
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

     // Increment invcdocument
     const counter = await Counter.findOneAndUpdate(
      { name: "checklistInvcdocument" },
      { $inc: { count: 1 } },
      { new: true, upsert: true } // Create if it doesn't exist
    );

    // Create a new Checklist instance
    const newChecklist = new Checklist({
      clientInfo,
      appointmentId,
      invoiceNo,
      documentNumber,
      pdfPath, // Ensure this is set to the Cloudinary URL
      createdBy: req.user.userId,
      invcdocument: counter.count, 
    });

    // Save the checklist to the database
    const savedChecklist = await newChecklist.save();

    // Update the appointment to link the checklist
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    appointment.checklists.push(savedChecklist._id); // Add checklist ID to appointment
    await appointment.save();

    res.status(201).json({ checklist: savedChecklist, appointment });
  } catch (error) {
    console.error('Error saving checklist:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllChecklists = async (req, res) => {
  try {
    // Check if the user is an admin
    const isAdmin = req.user.role === 'admin';

    // If admin, fetch all checklists, otherwise fetch only those created by the user
    const checklists = await Checklist.find(isAdmin ? {} : { createdBy: req.user.userId })
      .populate('appointmentId') // Optionally populate appointment data
      .sort({ generatedOn: -1 }); // Sort by generatedOn in descending order

    res.status(200).json(checklists);
  } catch (error) {
    console.error('Error fetching checklists:', error);
    res.status(500).json({ message: error.message });
  }
};

const editChecklist = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters
    const { clientInfo, appointmentId, invoiceNo, documentNumber } = req.body; // Extract data from the request body


    // Check if the user is an admin or the creator of the checklist
    const isAdmin = req.user.role === 'admin';
    const checklist = await Checklist.findById(id);
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found.' });
    }
    if (!isAdmin && checklist.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to edit this checklist.' });
    }

    // Find the checklist by ID and update it
    const updatedChecklist = await Checklist.findByIdAndUpdate(
      id,
      { clientInfo, appointmentId, invoiceNo, documentNumber },
      { new: true } // Return the updated document
    );

    if (!updatedChecklist) {
      return res.status(404).json({ message: 'Checklist not found.' });
    }

    res.status(200).json({ checklist: updatedChecklist });
  } catch (error) {
    console.error('Error editing checklist:', error);
    res.status(500).json({ message: error.message });
  }
};

// New delete function
const deleteChecklist = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameters

    // Find the checklist by ID
    const checklist = await Checklist.findById(id);
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found.' });
    }

    // Check if the user is an admin or the creator of the checklist
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && checklist.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this checklist.' });
    }

    // Find and delete the checklist by ID
    const deletedChecklist = await Checklist.findByIdAndDelete(id);

    // Optionally, update the related appointment
    const appointment = await Appointment.findById(deletedChecklist.appointmentId);
    if (appointment) {
      appointment.checklists.pull(deletedChecklist._id);
      await appointment.save();
    }

    res.status(200).json({ message: 'Checklist deleted successfully.' });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    res.status(500).json({ message: error.message });
  }
};

const downloadChecklist = async (req, res) => {
  try {
    const { id } = req.params; // Get the checklist ID from the URL parameters

    // Find the checklist by ID
    const checklist = await Checklist.findById(id);
    if (!checklist || !checklist.pdfPath) {
      return res.status(404).json({ message: 'Checklist not found or no file available.' });
    }

    // Set the path to the file
    const filePath = path.join(__dirname, '..', checklist.pdfPath);

    // Send the file to the client
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error downloading the file.' });
      }
    });
  } catch (error) {
    console.error('Error fetching checklist for download:', error);
    res.status(500).json({ message: error.message });
  }
};

const getLastChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.findOne({})
      .sort({ generatedOn: -1 }) // Sort by generatedOn in descending order
      .populate('appointmentId'); // Optionally populate appointment data

    if (!checklist) {
      return res.status(404).json({ message: 'No checklists found.' });
    }

    res.status(200).json(checklist);
  } catch (error) {
    console.error('Error fetching last checklist:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  saveChecklist,
  upload,
  getAllChecklists,
  editChecklist,
  deleteChecklist, 
  downloadChecklist, 
  getLastChecklist,  // Export the new function
};
