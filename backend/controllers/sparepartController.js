const Sparepart = require('./../models/Sparepart');
const Machine = require('./../models/Machine');

// Add a spare part
exports.addSparepart = async (req, res) => {
  const { machineId, name, quantity, modelNo, partNo, price } = req.body; // Get machineId from the request body

  try {
    const sparepart = new Sparepart({ name, quantity, modelNo, partNo, price, machine: machineId });
    await sparepart.save();

    // Update the machine to include the spare part
    await Machine.findByIdAndUpdate(machineId, { $push: { spareparts: sparepart._id } });

    res.status(201).json(sparepart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all spare parts for a specific machine
exports.getSparepartsByMachine = async (req, res) => {
  const { machineId } = req.body; // Get machineId from request body

  try {
    const spareparts = await Sparepart.find({ machine: machineId });
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
