const User = require('../models/User');
const bcrypt = require('bcrypt');
// Get all users
exports.getUsers = async (req, res) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Get all engineers (for admin and accountant)
exports.getEngineers = async (req, res) => {
  const { role } = req.user;
  if (role !== 'admin' && role !== 'accountant') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const engineers = await User.find({ role: 'engineer' });
    res.json(engineers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching engineers' });
  }
};

// Get all Admins (for admin)
exports.getAdmins = async (req, res) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const admins = await User.find({ role: 'admin' });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching admins' });
  }
};

// Get all Accountants (for admin)
exports.getAccountants = async (req, res) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const accountants = await User.find({ role: 'accountant' });
    res.json(accountants);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching accountants' });
  }
};

exports.updateUser = async (req, res) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params; // User ID from request parameters
  const { password, ...updateData } = req.body; // Separate password from other update data

  try {
    // If password is provided, hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
};

// Delete a user (for admin)
exports.deleteUser = async (req, res) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const { id } = req.params; // User ID from request parameters

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};
