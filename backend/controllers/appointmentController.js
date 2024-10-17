const multer = require("multer");
const path = require("path");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Company = require("../models/Company");
const { google } = require('googleapis');
const { PassThrough } = require('stream'); 
const Machine =require('../models/Machine')
const drive = google.drive('v3');

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Use memory storage to handle uploads directly
const upload = multer({ storage });

// Authenticate Google Drive API
async function authenticateGoogleDrive() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_DRIVE_KEY),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  return await auth.getClient();
}

// Accountant creates an appointment
exports.createAppointment = async (req, res) => {
  const {
    clientName,
    clientAddress,
    contactPerson,
    mobileNo,
    appointmentDate,
    appointmentAmount,
    machineId,
    installationDate,
    serviceFrequency,
    expectedServiceDate,
    engineer,
    invoiceNumber
  } = req.body;

  const { role } = req.user;

  // Check user role
  if (role !== "accountant" && role !== "engineer") {
    return res.status(403).json({ error: "Access denied" });
  }

  // Validate required fields
  const requiredFields = [clientName, mobileNo, appointmentDate, machineId, engineer];
  for (const field of requiredFields) {
    if (!field) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  }

  try {
    // Verify engineer
    const engineerUser = await User.findById(engineer);
    if (!engineerUser || engineerUser.role !== "engineer") {
      return res.status(400).json({ error: "Invalid engineer selected" });
    }

    // Find or create company
    let company = await Company.findOne({ clientName, mobileNo });
    if (!company) {
      company = new Company({ clientName, contactPerson, mobileNo, clientAddress });
      await company.save();
    }

    // Handle file upload to Google Drive
    let document = null;
    if (req.file) {
      const authClient = await authenticateGoogleDrive();
      const clientNames = clientName.replace(/\s+/g, '_');
      const fileName = `${invoiceNumber}.pdf`;
      const fileMetadata = {
        name: fileName,
        mimeType: 'application/pdf',
        parents: [process.env.GOOGLE_DRIVE_INVOICEDOC_ID],
      };

      const bufferStream = new PassThrough();
      bufferStream.end(req.file.buffer);

      const media = {
        mimeType: 'application/pdf',
        body: bufferStream,
      };

      try {
        const driveResponse = await drive.files.create({
          auth: authClient,
          requestBody: fileMetadata,
          media: media,
        });

        await drive.permissions.create({
          auth: authClient,
          fileId: driveResponse.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });

        document = `https://drive.google.com/uc?id=${driveResponse.data.id}`;
      } catch (uploadError) {
        console.error('Google Drive upload error:', uploadError.message || uploadError);
        return res.status(500).json({ message: uploadError.message || 'Failed to upload PDF to Google Drive.' });
      }
    }

    // Verify machine
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(400).json({ error: "Invalid machine selected" });
    }

    // Create the appointment
    const appointment = new Appointment({
      clientName,
      clientAddress,
      contactPerson,
      mobileNo,
      appointmentDate,
      appointmentAmount,
      machineId,
      machineName: machine.name,
      model: machine.modelNo,
      partNo: machine.partNo,
      serialNo: machine.serialNo,
      installationDate,
      serviceFrequency,
      expectedServiceDate,
      nextServiceDate: expectedServiceDate,
      engineer,
      createdBy: req.user.userId,
      invoiceNumber,
      document // Optionally include the document URL
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: "Error creating appointment" });
  }
};



// Get all appointments (Accountant/Admin)
exports.getAppointments = async (req, res) => {
  const { role, userId } = req.user;

  try {
    let appointments;

    if (role === "admin") {
      appointments = await Appointment.find()
        .populate("engineer createdBy checklists quotations machineId"); // Populate machine details
    } else if (role === "accountant") {
      appointments = await Appointment.find({ createdBy: userId })
        .populate("engineer createdBy checklists quotations machineId");
    } else if (role === "engineer") {
      appointments = await Appointment.find({ engineer: userId })
        .populate("createdBy engineer checklists quotations machineId");
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching appointments" });
  }
};


// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  const { id } = req.params; // Get the appointment ID from the URL parameters
  const { role } = req.user; // Get the user role from the request

  // Check user permissions (adjust according to your authorization logic)
  if (role !== "admin" && role !== "engineer" && role !== "accountant") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const appointment = await Appointment.findById(id)
      .populate("engineer createdBy checklists quotations machineId"); // Optionally populate related data

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json(appointment); // Send the appointment details
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: "Error fetching appointment" });
  }
};


// Edit an appointment
exports.editAppointment = async (req, res) => {
  const { role } = req.user;
  const { appointmentId } = req.params;

  // Check if user has permission to edit
  if (role !== "admin" && role !== "engineer" && role !== "accountant") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Update fields
    Object.assign(appointment, req.body);

    // Update document if new file uploaded
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );

        stream.end(req.file.buffer);
      });
      appointment.document = uploadResult;
    }

    // Update nextServiceDate and automatically calculate expectedServiceDate
    if (req.body.nextServiceDate) {
      appointment.nextServiceDate = req.body.nextServiceDate;

      // Example logic to set expectedServiceDate based on nextServiceDate
      // For example, adding 30 days to the next service date
      const nextServiceDate = new Date(req.body.nextServiceDate);
      const expectedServiceDate = new Date(nextServiceDate);
      expectedServiceDate.setDate(nextServiceDate.getDate()); // Adjust this based on your service frequency logic

      appointment.expectedServiceDate = expectedServiceDate.toISOString().split("T")[0];
    }

    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error updating appointment" });
  }
};



// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  const { role } = req.user;
  const { appointmentId } = req.params;

  // Check if user has permission to delete
  if (role !== "admin" && role !== "engineer" && role !== "accountant") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    // Find the appointment first
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Delete associated quotations
    await Quotation.deleteMany({ appointmentId }); // Remove all quotations related to this appointment

    // Now delete the appointment
    await Appointment.findByIdAndDelete(appointmentId);

    res.status(204).send(); // No content response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting appointment" });
  }
};


// New method to get appointment statistics
exports.getAppointmentStatistics = async (req, res) => {
  const { role } = req.user;

  // Only allow admins to access this route
  if (role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    // Get all appointments
    const appointments = await Appointment.find().populate('engineer createdBy');

    const statistics = {};

    // Aggregate appointment amounts by engineer
    appointments.forEach((appointment) => {
      const engineerId = appointment.engineer._id.toString();
      const appointmentAmount = appointment.appointmentAmount;

      if (!statistics[engineerId]) {
        statistics[engineerId] = {
          engineerName: appointment.engineer.name,
          totalAmount: 0,
          appointmentCount: 0,
        };
      }

      statistics[engineerId].totalAmount += appointmentAmount;
      statistics[engineerId].appointmentCount++;
    });

    // Aggregate total appointments created by accountants
    const accountantCount = appointments.filter(app => app.createdBy.role === 'accountant').length;

    res.json({ statistics, accountantCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching appointment statistics" });
  }
};



// Get appointments by invoice number
exports.getAppointmentsByInvoice = async (req, res) => {
  const { invoiceNumber } = req.params;

  try {
    // Find all appointments with the given invoice number
    const appointments = await Appointment.find({ invoiceNumber }).populate("engineer createdBy");

    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found for this invoice number." });
    }

    // Transform appointments to return only machine details
    const transformedAppointments = appointments.map((appointment) => {
      return {
        machineName: appointment.machineName,
        model: appointment.model,
        partNo: appointment.partNo,
        serialNo: appointment.serialNo,
      };
    });

    res.json(transformedAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching appointments by invoice number." });
  }
};

// Export the multer upload instance for use in routes
exports.upload = upload;