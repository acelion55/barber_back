const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Barber = require('../models/Barber');

// Helper to convert "HH:mm" to total minutes from 00:00
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Helper to convert total minutes to "HH:mm"
const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// GET /api/appointments/available-slots
// Query: date (YYYY-MM-DD), duration (in minutes), barberId (optional)
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, duration, barberId } = req.query;
    const requiredDuration = parseInt(duration) || 30;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    // Default shop working hours: 09:00 AM to 09:00 PM (540 to 1260 minutes)
    let shopStartMins = 9 * 60; // 09:00
    let shopEndMins = 21 * 60;  // 21:00
    let breakStartMins = 14 * 60; // 14:00 (2 PM)
    let breakEndMins = 15 * 60;   // 15:00 (3 PM)

    if (barberId && barberId !== 'any') {
      const barber = await Barber.findById(barberId);
      if (barber && barber.workingHours) {
        shopStartMins = timeToMinutes(barber.workingHours.start || '09:00');
        shopEndMins = timeToMinutes(barber.workingHours.end || '21:00');
        if (barber.workingHours.breakStart && barber.workingHours.breakEnd) {
          breakStartMins = timeToMinutes(barber.workingHours.breakStart);
          breakEndMins = timeToMinutes(barber.workingHours.breakEnd);
        }
      }
    }

    // Query existing booked appointments for the given date (excluding cancelled)
    const query = { date, status: { $ne: 'cancelled' } };
    if (barberId && barberId !== 'any') {
      query.barber = barberId;
    }

    const bookedAppointments = await Appointment.find(query);

    // Generate slots in 15-minute step increments
    const slotStepMinutes = 15;
    const availableSlots = [];
    const allSlots = [];

    let freeCount = 0;
    let bookedCount = 0;
    let breakCount = 0;

    for (let currentMins = shopStartMins; currentMins + requiredDuration <= shopEndMins; currentMins += slotStepMinutes) {
      const slotEndMins = currentMins + requiredDuration;
      const startTime = minutesToTime(currentMins);
      const endTime = minutesToTime(slotEndMins);

      // Check if slot falls inside lunch/break time
      const hitsBreak = (currentMins < breakEndMins && slotEndMins > breakStartMins);
      if (hitsBreak) {
        breakCount++;
        allSlots.push({
          startTime,
          endTime,
          startMinutes: currentMins,
          endMinutes: slotEndMins,
          available: false,
          status: 'break',
          label: 'Shop Break'
        });
        continue;
      }

      // Check overlap with existing appointments
      // Overlap occurs if (startA < endB) and (endA > startB)
      const conflictAppt = bookedAppointments.find((appt) => {
        return currentMins < appt.endMinutes && slotEndMins > appt.startMinutes;
      });

      if (conflictAppt) {
        bookedCount++;
        allSlots.push({
          startTime,
          endTime,
          startMinutes: currentMins,
          endMinutes: slotEndMins,
          available: false,
          status: 'booked',
          label: 'Booked',
          barberName: conflictAppt.barberName || 'Occupied'
        });
      } else {
        freeCount++;
        const freeSlot = {
          startTime,
          endTime,
          startMinutes: currentMins,
          endMinutes: slotEndMins,
          available: true,
          status: 'free',
          label: 'Available'
        };
        availableSlots.push(freeSlot);
        allSlots.push(freeSlot);
      }
    }

    res.json({
      success: true,
      date,
      totalDurationMinutes: requiredDuration,
      count: availableSlots.length,
      summary: {
        totalSlots: allSlots.length,
        freeSlotsCount: freeCount,
        bookedSlotsCount: bookedCount,
        breakSlotsCount: breakCount
      },
      data: availableSlots,
      allSlots,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/appointments - Book new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { customerName, customerPhone, customerEmail, serviceIds, barberId, date, startTime, notes } = req.body;

    if (!customerName || !customerPhone || !serviceIds || !serviceIds.length || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Fetch services to calculate total price & total duration
    const services = await Service.find({ _id: { $in: serviceIds } });
    if (!services.length) {
      return res.status(400).json({ success: false, message: 'Invalid services selected' });
    }

    const formattedServices = services.map((s) => ({
      serviceId: s._id,
      title: s.title,
      price: s.price,
      durationMinutes: s.durationMinutes,
    }));

    const totalDurationMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalAmount = services.reduce((sum, s) => sum + s.price, 0);

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + totalDurationMinutes;
    const endTime = minutesToTime(endMinutes);

    let barberName = 'Any Available Stylist';
    let barberObjId = null;

    if (barberId && barberId !== 'any') {
      const barber = await Barber.findById(barberId);
      if (barber) {
        barberName = barber.name;
        barberObjId = barber._id;
      }
    }

    // Final conflict check to prevent double booking race condition
    const query = { date, status: { $ne: 'cancelled' } };
    if (barberObjId) query.barber = barberObjId;

    const existingConflict = await Appointment.findOne({
      ...query,
      $or: [
        { startMinutes: { $lt: endMinutes }, endMinutes: { $gt: startMinutes } }
      ]
    });

    if (existingConflict) {
      return res.status(409).json({ success: false, message: 'This time slot was just booked by someone else! Please select another time slot.' });
    }

    const appointment = await Appointment.create({
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      services: formattedServices,
      barber: barberObjId,
      barberName,
      date,
      startTime,
      endTime,
      startMinutes,
      endMinutes,
      totalDurationMinutes,
      totalAmount,
      notes: notes || '',
      status: 'confirmed',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/appointments - Admin list appointments
exports.getAppointments = async (req, res) => {
  try {
    const { date, status, barberId } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (status) filter.status = status;
    if (barberId) filter.barber = barberId;

    const appointments = await Appointment.find(filter).sort({ date: -1, startMinutes: 1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/appointments/:id/status - Admin update status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
