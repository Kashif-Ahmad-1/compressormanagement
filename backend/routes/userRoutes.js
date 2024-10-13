const express = require('express');
const {
  getUsers,
  getEngineers,
  getAccountants,
  getAdmins,
  updateUser,    // Import the updateUser function
  deleteUser     // Import the deleteUser function
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Existing routes
router.get('/', authMiddleware, getUsers);
router.get('/engineers', authMiddleware, getEngineers);
router.get('/accountants', authMiddleware, getAccountants);
router.get('/admins', authMiddleware, getAdmins);

// New routes for updating and deleting users
router.put('/:id', authMiddleware, updateUser);   // Update user
router.delete('/:id', authMiddleware, deleteUser); // Delete user

module.exports = router;
