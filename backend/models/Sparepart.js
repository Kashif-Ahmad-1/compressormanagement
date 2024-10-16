const mongoose = require('mongoose');

const sparepartSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String },
    modelNo: { type: String },
    partNo: { type: String,required: true },
    price: {type: String},
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('Sparepart', sparepartSchema);