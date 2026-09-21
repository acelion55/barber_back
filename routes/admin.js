const express = require('express');
const router = express.Router();
const { login, getMe, setupAdmin } = require('../controllers/adminController');
const {
  adminGetAllCourses,
  adminCreateCourse,
  adminUpdateCourse,
  adminDeleteCourse,
  getDashboardStats,
} = require('../controllers/courseController');
const {
  adminGetAllBlogs,
  adminCreateBlog,
  adminUpdateBlog,
  adminDeleteBlog,
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Auth
router.post('/login', login);
router.post('/setup', setupAdmin);
router.get('/me', protect, getMe);

// Dashboard
router.get('/dashboard', protect, getDashboardStats);

// Courses
router.get('/courses', protect, adminGetAllCourses);
router.post('/courses', protect, upload.single('image'), adminCreateCourse);
router.put('/courses/:id', protect, upload.single('image'), adminUpdateCourse);
router.delete('/courses/:id', protect, adminDeleteCourse);

// Upload standalone
router.post('/upload', protect, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// Blogs
router.get('/blogs', protect, adminGetAllBlogs);
router.post('/blogs', protect, upload.single('image'), adminCreateBlog);
router.put('/blogs/:id', protect, upload.single('image'), adminUpdateBlog);
router.delete('/blogs/:id', protect, adminDeleteBlog);

module.exports = router;
