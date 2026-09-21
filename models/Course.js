const mongoose = require('mongoose');
const slugify = require('slugify');

const lessonSchema = new mongoose.Schema({
  lessonName: { type: String, required: true },
  duration: { type: String, default: '0:00' },
  description: { type: String, default: '' },
  videoURL: { type: String, default: '' },
});

const sectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  sectionDescription: { type: String, default: '' },
  lessons: [lessonSchema],
});

const reviewSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentImage: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  date: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    category: {
      type: String,
      required: true,
      enum: ['Coding', 'Marketing', 'Design', 'Business', 'Finance', 'Personal Development', 'Photography', 'Music'],
    },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true, maxlength: 300 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    // SEO
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '', maxlength: 160 },
    metaKeywords: [{ type: String }],
    canonicalURL: { type: String, default: '' },
    // Instructor
    instructor: {
      name: { type: String, required: true },
      image: { type: String, default: '' },
      bio: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    // Learning
    learningOutcomes: [{ type: String }],
    curriculum: [sectionSchema],
    faqs: [faqSchema],
    // Media
    bannerImage: { type: String, default: '' },
    thumbnailImage: { type: String, default: '' },
    courseImages: [{ type: String }],
    // Reviews
    reviews: [reviewSchema],
    // Stats
    totalStudents: { type: Number, default: 0 },
    totalHours: { type: String, default: '0' },
    language: { type: String, default: 'Hindi & English' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'Beginner' },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    whatsappNumber: { type: String, default: '918696184752' },
  },
  { timestamps: true }
);

// Auto-generate slug
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  // Auto-calculate discount
  if (this.originalPrice > 0) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Text index for search
courseSchema.index({ title: 'text', description: 'text', metaKeywords: 'text', category: 'text' });

module.exports = mongoose.model('Course', courseSchema);
