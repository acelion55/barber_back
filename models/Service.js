const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Haircut', 'Beard & Shave', 'Hair Color & Styling', 'Facial & Skincare', 'Combo & Packages', 'VIP Treatment'],
      default: 'Haircut',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: 5,
      default: 30,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
