const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Barber name is required'],
      trim: true,
    },
    title: {
      type: String,
      default: 'Master Barber & Stylist',
    },
    specialties: [{
      type: String,
    }],
    experienceYears: {
      type: Number,
      default: 5,
    },
    avatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    workingHours: {
      start: { type: String, default: '09:00' }, // 24hr format HH:mm
      end: { type: String, default: '21:00' },
      breakStart: { type: String, default: '14:00' },
      breakEnd: { type: String, default: '15:00' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Barber', barberSchema);
