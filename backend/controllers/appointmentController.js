const multer = require("multer");
const path = require("path");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Company = require("../models/Company");
const cloudinary = require("cloudinary").v2;
// Create an instance of multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Ensure this folder exists
//   },
//   filename: (req, file, cb) => {
//     cb(null, ${Date.now()}-${file.originalname});
//   },
// });

// const upload = multer({ storage });


// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Use memory storage to handle uploads directly
const upload = multer({ storage });

// Accountant creates an appointment
exports.createAppointment = async (req, res) => {
  const {
    clientName,
    clientAddress,
    contactPerson,
    mobileNo,
    appointmentDate,
    appointmentAmount,
    machineName,
    model,
    partNo,
    serialNo,
    installationDate,
    serviceFrequency,
    expectedServiceDate,
    engineer,
    invoiceNumber,
  } = req.body;

  const { role } = req.user;

  // Only allow appointments to be created by accountants or engineers
  if (role !== "accountant" && role !== "engineer") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const engineerUser = await User.findById(engineer);
    if (!engineerUser || engineerUser.role !== "engineer") {
      return res.status(400).json({ error: "Invalid engineer selected" });
    }
  } catch (error) {
    return res.status(400).json({ error: "Error verifying engineer" });
  }

  try {
    let company = await Company.findOne({ clientName, mobileNo });

    if (!company) {
      company = new Company({
        clientName,
        contactPerson,
        mobileNo,
        clientAddress,
      });
      await company.save();
    }

    // Upload file to Cloudinary
    let document = null;
    if (req.file) {
      document = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result.secure_url); // Get the uploaded file's URL
            }
          }
        );

        stream.end(req.file.buffer); // Send the file buffer to Cloudinary
      });
    }

    const appointment = new Appointment({
      clientName,
      clientAddress,
      contactPerson,
      mobileNo,
      appointmentDate,
      appointmentAmount,
      machineName,
      model,
      partNo,
      serialNo,
      installationDate,
      serviceFrequency,
      expectedServiceDate,
      nextServiceDate: expectedServiceDate, // Set nextServiceDate to expectedServiceDate initially
      engineer,
      createdBy: req.user.userId,
      document,
      invoiceNumber,
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error creating appointment" });
  }
};

// Get all appointments (Accountant/Admin)
exports.getAppointments = async (req, res) => {
  const { role, userId } = req.user;

  try {
    let appointments;

    if (role === "admin") {
      appointments = await Appointment.find()
        .populate("engineer createdBy checklists quotations");
    } else if (role === "accountant") {
      appointments = await Appointment.find({ createdBy: userId }) // Only appointments created by this accountant
        .populate("engineer createdBy checklists quotations");
    } else if (role === "engineer") {
      appointments = await Appointment.find({ engineer: userId })
        .populate("createdBy engineer checklists quotations");
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    const transformedAppointments = appointments.map((appointment) => {
      return {
        ...appointment.toObject(),
        engineer: appointment.engineer
          ? {
              name: appointment.engineer.name,
              email: appointment.engineer.email,
            }
          : null,
        createdBy: appointment.createdBy
          ? {
              name: appointment.createdBy.name,
              email: appointment.createdBy.email,
            }
          : null,
        checklists: appointment.checklists.map((checklist) => ({
          id: checklist._id,
          clientInfo: checklist.clientInfo,
          invoiceNo: checklist.invoiceNo,
          pdfPath: checklist.pdfPath,
          generatedOn: checklist.generatedOn,
        })),
        quotations: appointment.quotations.map((quotation) => ({
          id: quotation._id,
          clientInfo: quotation.clientInfo,
          quotationNo: quotation.quotationNo,
          quotationAmount: quotation.quotationAmount,
          pdfPath: quotation.pdfPath,
        })),
      };
    });

    res.json(transformedAppointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching appointments" });
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



// Export the multer upload instance for use in routes
exports.upload = upload;