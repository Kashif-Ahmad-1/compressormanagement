const express = require('express');
const {
  addMachine,
  updateMachine,
  deleteMachine,
  getMachines
} = require('../controllers/machineController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, addMachine);
router.put('/:id', authMiddleware, updateMachine);
router.delete('/:id', authMiddleware, deleteMachine);
router.get('/', authMiddleware, getMachines);
module.exports = router;
