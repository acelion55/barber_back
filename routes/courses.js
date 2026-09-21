const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getFeaturedCourses,
  searchCourses,
  getCoursesByCategory,
  getCourseBySlug,
  addReview,
} = require('../controllers/courseController');

router.get('/', getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/search', searchCourses);
router.get('/category/:category', getCoursesByCategory);
router.get('/:slug', getCourseBySlug);
router.post('/:id/reviews', addReview);

module.exports = router;
