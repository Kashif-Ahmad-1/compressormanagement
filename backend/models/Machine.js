const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String},
    modelNo: { type: String,required: true },
    partNo: { type: String,required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('Machine', machineSchema);
