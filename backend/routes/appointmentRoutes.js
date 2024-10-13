const express = require('express');
const {
  createAppointment,
  getAppointments,
  editAppointment,
  deleteAppointment,
  getAppointmentStatistics,
  upload,
} = require('../controllers/appointmentController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for creating an appointment with an optional file upload
router.post('/', authMiddleware, upload.single('document'), createAppointment);
router.get('/', authMiddleware, getAppointments);

// Route for editing an appointment
router.put('/:appointmentId', authMiddleware, upload.single('document'), editAppointment);

// Route for deleting an appointment
router.delete('/:appointmentId', authMiddleware, deleteAppointment);

router.get("/statistics", authMiddleware, getAppointmentStatistics);

module.exports = router;
