
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  template1: { type: String, },
  template2: { type: String,  }
});

module.exports = mongoose.model('Template', templateSchema);
