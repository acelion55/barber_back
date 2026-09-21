const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 300 },
    author: { type: String, required: true },
    image: { type: String, default: '' },
    category: {
      type: String,
      default: 'General',
      enum: ['Coding', 'Marketing', 'Career', 'Tutorial', 'News', 'Tips', 'General'],
    },
    tags: [{ type: String }],
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '', maxlength: 160 },
    metaKeywords: [{ type: String }],
    readTime: { type: Number, default: 5 },
    published: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.content && !this.excerpt) {
    this.excerpt = this.content.replace(/<[^>]*>/g, '').substring(0, 280) + '...';
  }
  // Estimate read time
  if (this.content) {
    const wordCount = this.content.split(' ').length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  next();
});

blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
