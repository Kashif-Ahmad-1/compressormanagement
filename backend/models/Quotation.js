// const mongoose = require("mongoose");

// // Checklist Document Model
// const quotationSchema = new mongoose.Schema({
//   clientInfo: {
//     name: String,
//     contactPerson: String,
//     phone: String,
//     address: String,
//     engineer: String,
//   },
//   appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
//   quotationNo: String,
//   quotationAmount: Number, // New field for quotation amount
//   pdfPath: String, // Path to the uploaded PDF
//   status: { type: Boolean, default: false },
//   generatedOn: { type: Date, default: Date.now },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   generatedOn: { type: Date, default: Date.now },
//   statusChangedOn: { type: Date }, 
// });

// module.exports = mongoose.model("Quotation", quotationSchema);


const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: { type: String, },
  quantity: { type: Number,  },
  rate: { type: Number,  },
  gstAmount: { type: Number,  },
  totalWithGST: { type: Number, },
  
}, { _id: false }); // Prevent creating an id for subdocuments

const quotationSchema = new mongoose.Schema({
  clientInfo: {
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    engineer: String,
  },
  appointmentId: { type: String, required: true },
  quotationNo: { type: String, },
  invoiceNo: { type: String, },
  quotationAmount: { type: Number,  required: true},
  items: [itemSchema], // Array of item documents
  pdfPath: { type: String,  },
  createdAt: { type: Date, default: Date.now },
  status: { type: Boolean, default: false },
  generatedOn: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedOn: { type: Date, default: Date.now },
  statusChangedOn: { type: Date }, 
});

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;
