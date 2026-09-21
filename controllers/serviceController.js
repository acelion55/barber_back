const Service = require('../models/Service');

// GET /api/services - Public list active services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ category: 1, createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/services/admin - Admin list all services
exports.adminGetServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/services - Admin create service
exports.createService = async (req, res) => {
  try {
    const serviceData = { ...req.body };
    if (req.file) {
      serviceData.image = `/uploads/${req.file.filename}`;
    }
    const service = await Service.create(serviceData);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/services/:id - Admin update service
exports.updateService = async (req, res) => {
  try {
    const serviceData = { ...req.body };
    if (req.file) {
      serviceData.image = `/uploads/${req.file.filename}`;
    }
    const service = await Service.findByIdAndUpdate(req.params.id, serviceData, { new: true, runValidators: true });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/services/:id - Admin delete service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
