const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
  clientName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  mobileNo: { type: String, required: true },
  clientAddress: { type: String, required: true },
},
{timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
