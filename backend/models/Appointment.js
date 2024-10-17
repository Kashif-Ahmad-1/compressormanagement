const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientAddress: { type: String, required: true },
  contactPerson: { type: String, required: true },
  mobileNo: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  appointmentAmount: { type: Number, required: true },
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true }, // Reference to Machine
  machineName: { type: String }, // Optional: You can choose to keep this if needed
  model: { type: String }, // Optional: You can also reference this directly from Machine
  partNo: { type: String }, // Optional: You can reference this directly from Machine
  serialNo: { type: String }, // Optional: You can reference this directly from Machine
  installationDate: { type: Date, required: true },
  serviceFrequency: { type: Number, required: true },
  expectedServiceDate: { type: Date, required: true },
  nextServiceDate: { type: Date },
  engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document: { type: String },
  checklists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Checklist' }],
  quotations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
