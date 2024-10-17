const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String },
    modelNo: { type: String },
    partNo: { type: String },
    serialNo: { type: String },
    type: { type: String, enum: ['compressor', 'dryer', 'filter'], required: true }, // New field
    spareparts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sparepart' }],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('Machine', machineSchema);
