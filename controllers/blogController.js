const Blog = require('../models/Blog');

exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 9, category } = req.query;
    const query = { published: true };
    if (category) query.category = category;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-content');

    res.json({
      success: true,
      data: blogs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminGetAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).select('-content');
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminCreateBlog = async (req, res) => {
  try {
    const blogData = { ...req.body };
    if (req.file) blogData.image = `/uploads/${req.file.filename}`;
    if (typeof blogData.tags === 'string') {
      try { blogData.tags = JSON.parse(blogData.tags); } catch (_) { blogData.tags = blogData.tags.split(',').map(t => t.trim()); }
    }
    const blog = await Blog.create(blogData);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.adminUpdateBlog = async (req, res) => {
  try {
    const blogData = { ...req.body };
    if (req.file) blogData.image = `/uploads/${req.file.filename}`;
    const blog = await Blog.findByIdAndUpdate(req.params.id, blogData, { new: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.adminDeleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
