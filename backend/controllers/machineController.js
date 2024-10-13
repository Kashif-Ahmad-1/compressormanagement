const Machine = require('../models/Machine');

// Add a new machine
exports.addMachine = async (req, res) => {
  const { name, quantity, modelNo, partNo } = req.body;
  const { role } = req.user;

  if (role !== 'admin' && role !== 'accountant') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const machine = new Machine({ name, quantity ,modelNo, partNo});
    await machine.save();
    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ error: 'Error adding machine' });
  }
};


// Get a machine
exports.getMachines = async (req, res) => {
    const { role } = req.user;
  
    if (role !== 'admin' && role !== 'accountant' && role !== 'engineer') {
      return res.status(403).json({ error: 'Access denied' });
    }
  
    try {
      const machines = await Machine.find();
      res.json(machines);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching machines' });
    }
  };

// Update a machine
exports.updateMachine = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  if (role !== 'admin' && role !== 'accountant') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const machine = await Machine.findByIdAndUpdate(id, req.body, { new: true });
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: 'Error updating machine' });
  }
};

// Delete a machine
exports.deleteMachine = async (req, res) => {
  const { id } = req.params;
  const { role } = req.user;

  if (role !== 'admin' && role !== 'accountant') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const machine = await Machine.findByIdAndDelete(id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting machine' });
  }
};
