const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientAddress: { type: String, required: true },
  contactPerson: { type: String, required: true },
  mobileNo: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentAmount: { type: Number, required: true },
  machineName: { type: String, required: true },
  model: { type: String, required: true },
  partNo: { type: String, required: true },
  serialNo: { type: String, required: true },
  installationDate: { type: Date, required: true },
  serviceFrequency: { type: Number, required: true },
  expectedServiceDate: { type: Date, required: true },
  nextServiceDate: { type: Date }, // New field for next service date
  engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document: { type: String }, // New field for document upload
  checklists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Checklist' }],
  quotations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { type: String, required: true }, // New unique field for invoice number
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
