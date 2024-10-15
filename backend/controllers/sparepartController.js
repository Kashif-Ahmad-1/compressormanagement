const Sparepart = require('./../models/Sparepart');

// Add a spare part
exports.addSparepart = async (req, res) => {
  try {
    const sparepart = new Sparepart(req.body);
    await sparepart.save();
    res.status(201).json(sparepart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all spare parts
exports.getSpareparts = async (req, res) => {
  try {
    const spareparts = await Sparepart.find();
    res.status(200).json(spareparts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single spare part by ID
exports.getSparepartById = async (req, res) => {
  try {
    const sparepart = await Sparepart.findById(req.params.id);
    if (!sparepart) return res.status(404).json({ message: 'Spare part not found' });
    res.status(200).json(sparepart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a spare part
exports.updateSparepart = async (req, res) => {
  try {
    const sparepart = await Sparepart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sparepart) return res.status(404).json({ message: 'Spare part not found' });
    res.status(200).json(sparepart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a spare part
exports.deleteSparepart = async (req, res) => {
  try {
    const sparepart = await Sparepart.findByIdAndDelete(req.params.id);
    if (!sparepart) return res.status(404).json({ message: 'Spare part not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
