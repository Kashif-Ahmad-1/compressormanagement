const mongoose = require("mongoose");

// Counter Schema
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", counterSchema);
