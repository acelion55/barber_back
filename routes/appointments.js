const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.get('/available-slots', getAvailableSlots);
router.post('/', createAppointment);
router.get('/admin', protect, getAppointments);
router.put('/admin/:id/status', protect, updateAppointmentStatus);
router.delete('/admin/:id', protect, deleteAppointment);

module.exports = router;
