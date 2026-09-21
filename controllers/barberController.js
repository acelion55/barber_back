const Barber = require('../models/Barber');

// GET /api/barbers - Public list barbers
exports.getBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find({ isAvailable: true });
    res.json({ success: true, count: barbers.length, data: barbers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/barbers/admin - Admin list all barbers
exports.adminGetBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find().sort({ createdAt: -1 });
    res.json({ success: true, count: barbers.length, data: barbers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/barbers - Create barber
exports.createBarber = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.avatar = `/uploads/${req.file.filename}`;
    if (typeof data.specialties === 'string') {
      data.specialties = data.specialties.split(',').map((s) => s.trim()).filter(Boolean);
    }
    const barber = await Barber.create(data);
    res.status(201).json({ success: true, data: barber });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/barbers/:id - Update barber
exports.updateBarber = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.avatar = `/uploads/${req.file.filename}`;
    if (typeof data.specialties === 'string') {
      data.specialties = data.specialties.split(',').map((s) => s.trim()).filter(Boolean);
    }
    const barber = await Barber.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: barber });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/barbers/:id
exports.deleteBarber = async (req, res) => {
  try {
    await Barber.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Barber deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
