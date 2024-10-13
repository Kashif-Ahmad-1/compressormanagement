const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String },
    modelNo: { type: String },
    partNo: { type: String },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('Machine', machineSchema);
