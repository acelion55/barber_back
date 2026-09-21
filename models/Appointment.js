const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    services: [
      {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        title: String,
        price: Number,
        durationMinutes: Number,
      },
    ],
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: false, // can be null for 'Any Available'
    },
    barberName: {
      type: String,
      default: 'Any Available Stylist',
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Appointment date is required'],
    },
    startTime: {
      type: String, // HH:mm format, e.g. "10:00"
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String, // HH:mm format, e.g. "10:50"
      required: [true, 'End time is required'],
    },
    startMinutes: {
      type: Number, // minutes from midnight e.g. 10:00 = 600
      required: true,
    },
    endMinutes: {
      type: Number, // minutes from midnight e.g. 10:50 = 650
      required: true,
    },
    totalDurationMinutes: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    notes: {
      type: String,
      default: '',
    },
    bookingId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate booking ID
appointmentSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = 'BK-' + Math.floor(100000 + Math.random() * 900000);
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
