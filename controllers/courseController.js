const Course = require('../models/Course');

// GET /api/courses - all published courses with filters & pagination
exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, sort, search, level } = req.query;
    const query = { published: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'popular') sortOption = { totalStudents: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews -curriculum -faqs -description');

    res.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/courses/featured
exports.getFeaturedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ published: true, featured: true })
      .limit(8)
      .select('-reviews -curriculum -faqs -description');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/courses/search
exports.searchCourses = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const courses = await Course.find({
      published: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
      ],
    })
      .limit(8)
      .select('title slug thumbnailImage price category rating');

    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/courses/category/:category
exports.getCoursesByCategory = async (req, res) => {
  try {
    const courses = await Course.find({ published: true, category: req.params.category })
      .select('-reviews -curriculum -faqs -description');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/courses/:slug
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, published: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/courses/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const { studentName, rating, reviewText } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    course.reviews.push({ studentName, rating, reviewText, verified: false });
    // Recalculate avg rating
    const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.rating = (totalRating / course.reviews.length).toFixed(1);
    course.totalReviews = course.reviews.length;
    await course.save();
    res.json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN CONTROLLERS ────────────────────────────────────────────────────────

exports.adminGetAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).select('-reviews -curriculum -faqs');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminCreateCourse = async (req, res) => {
  try {
    const courseData = { ...req.body };
    // Parse JSON strings sent from FormData
    ['learningOutcomes', 'metaKeywords', 'courseImages', 'curriculum', 'faqs', 'instructor'].forEach((field) => {
      if (typeof courseData[field] === 'string') {
        try { courseData[field] = JSON.parse(courseData[field]); } catch (_) {}
      }
    });
    // Handle uploaded image
    if (req.file) {
      courseData.thumbnailImage = `/uploads/${req.file.filename}`;
      courseData.bannerImage = `/uploads/${req.file.filename}`;
    }
    const course = await Course.create(courseData);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.adminUpdateCourse = async (req, res) => {
  try {
    const courseData = { ...req.body };
    ['learningOutcomes', 'metaKeywords', 'courseImages', 'curriculum', 'faqs', 'instructor'].forEach((field) => {
      if (typeof courseData[field] === 'string') {
        try { courseData[field] = JSON.parse(courseData[field]); } catch (_) {}
      }
    });
    if (req.file) {
      courseData.thumbnailImage = `/uploads/${req.file.filename}`;
      courseData.bannerImage = `/uploads/${req.file.filename}`;
    }
    const course = await Course.findByIdAndUpdate(req.params.id, courseData, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.adminDeleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ published: true });
    const totalStudents = await Course.aggregate([{ $group: { _id: null, total: { $sum: '$totalStudents' } } }]);
    const totalRevenue = await Course.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$totalStudents'] } } } },
    ]);
    const categoryCounts = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const recentCourses = await Course.find().sort({ createdAt: -1 }).limit(5).select('title price totalStudents published createdAt');

    res.json({
      success: true,
      data: {
        totalCourses,
        publishedCourses,
        totalStudents: totalStudents[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        categoryCounts,
        recentCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
