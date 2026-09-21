require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');

const app = express();

// Connect Database
connectDB();

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  'https://kodeschool.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.options('*', cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/courses', require('./routes/courses'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/services', require('./routes/services'));
app.use('/api/barbers', require('./routes/barbers'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/seed', require('./routes/seed'));

// Contact form (inline)
app.post('/api/contact', (req, res) => {
  const { name, email, message, phone } = req.body;
  console.log('Contact form:', { name, email, phone, message });
  res.json({ success: true, message: 'Message received! We will contact you shortly on WhatsApp.' });
});

// Newsletter
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  console.log('Newsletter signup:', email);
  res.json({ success: true, message: 'Subscribed successfully!' });
});

// Testimonials (static for now)
app.get('/api/testimonials', (req, res) => {
  res.json({
    success: true,
    data: [
      { name: 'Rahul Sharma', role: 'Full Stack Developer', text: 'This platform completely transformed my career. The React and Node.js course helped me land my dream job!', rating: 5, image: '' },
      { name: 'Priya Singh', role: 'Digital Marketer', text: 'The SEO and Digital Marketing course was exactly what I needed. Now I run my own agency!', rating: 5, image: '' },
      { name: 'Amit Kumar', role: 'Python Developer', text: 'Best online learning experience! The instructor explains everything so clearly. Highly recommended.', rating: 5, image: '' },
      { name: 'Sneha Patel', role: 'UI/UX Designer', text: 'Completed the web development bootcamp and got placed within 2 months. Amazing content and support!', rating: 5, image: '' },
      { name: 'Vikram Rao', role: 'Data Scientist', text: 'The Data Science course with Python is phenomenal. Real projects, real learning. Worth every rupee!', rating: 5, image: '' },
      { name: 'Anjali Gupta', role: 'Content Marketer', text: 'Learned content marketing from scratch. My blog now gets 50K+ monthly visitors thanks to this course!', rating: 5, image: '' },
    ],
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Kode School API is running!', time: new Date() });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
