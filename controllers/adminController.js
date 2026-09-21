const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Auto-create default admin if database has no admins yet
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        email: 'admin@luxebarber.com',
        password: 'admin123',
        fullName: 'Master Admin',
        role: 'superadmin',
      });
      await Admin.create({
        email: 'admin@kodeschool.com',
        password: 'Admin@123',
        fullName: 'System Admin',
        role: 'superadmin',
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateToken(admin._id);
    res.json({
      success: true,
      token,
      data: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/me
exports.getMe = async (req, res) => {
  res.json({ success: true, data: req.admin });
};

// POST /api/admin/setup - create first admin (only if no admin exists)
exports.setupAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    const { email, password, fullName } = req.body;
    const admin = await Admin.create({ email, password, fullName, role: 'superadmin' });
    const token = generateToken(admin._id);
    res.status(201).json({ success: true, token, data: { id: admin._id, email: admin.email, fullName: admin.fullName } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
