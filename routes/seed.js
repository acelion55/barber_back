const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Barber = require('../models/Barber');

router.post('/seed', async (req, res) => {
  try {
    // Seed Services
    await Service.deleteMany({});
    const initialServices = [
      {
        title: 'Classic Gentleman Haircut',
        category: 'Haircut',
        price: 350,
        durationMinutes: 30,
        description: 'Precision scissor & clipper fade cut, complete with styling, neck shave, and hot towel finish.',
        featured: true,
      },
      {
        title: 'Executive Royal Fade & Beard Combo',
        category: 'Combo & Packages',
        price: 650,
        durationMinutes: 50,
        description: 'Complete signature haircut + custom beard sculpt, line-up, hot towel steam & face massage.',
        featured: true,
      },
      {
        title: 'Luxury Beard Sculpt & Lineup',
        category: 'Beard & Shave',
        price: 250,
        durationMinutes: 20,
        description: 'Beard trim, sharp blade edging, organic beard oil treatment, and hot towel hydration.',
        featured: true,
      },
      {
        title: 'Organic Charcoal Facial & Head Spa',
        category: 'Facial & Skincare',
        price: 500,
        durationMinutes: 35,
        description: 'Deep pore cleansing, exfoliation, relaxing scalp massage, and herbal mask finish.',
        featured: false,
      },
      {
        title: 'Premium Hair Color & Gloss Touchup',
        category: 'Hair Color & Styling',
        price: 800,
        durationMinutes: 45,
        description: 'Ammonia-free vibrant hair color, deep conditioning treatment, and blowout.',
        featured: false,
      },
      {
        title: 'VIP Grooming Experience',
        category: 'VIP Treatment',
        price: 1200,
        durationMinutes: 75,
        description: 'Haircut + Beard Styling + Facial Spa + Scalp Massage + Complimentary refreshment.',
        featured: true,
      },
    ];
    const createdServices = await Service.insertMany(initialServices);

    // Seed Barbers
    await Barber.deleteMany({});
    const initialBarbers = [
      {
        name: 'Alex Vance',
        title: 'Master Barber & Fade Specialist',
        specialties: ['Skin Fades', 'Razor Edging', 'Beard Design'],
        experienceYears: 8,
        rating: 4.9,
      },
      {
        name: 'David Miller',
        title: 'Senior Hairstylist & Color Expert',
        specialties: ['Classic Cuts', 'Hair Color', 'Styling'],
        experienceYears: 6,
        rating: 4.8,
      },
      {
        name: 'Marcus Thorne',
        title: 'VIP Grooming Specialist',
        specialties: ['Hot Towel Shave', 'Facials', 'Head Spa'],
        experienceYears: 10,
        rating: 5.0,
      },
    ];
    const createdBarbers = await Barber.insertMany(initialBarbers);

    // Seed Default Admin
    const Admin = require('../models/Admin');
    let admin = await Admin.findOne({ email: 'admin@luxebarber.com' });
    if (!admin) {
      admin = await Admin.create({
        email: 'admin@luxebarber.com',
        password: 'admin123',
        fullName: 'Master Admin',
        role: 'superadmin',
      });
    }

    res.json({
      success: true,
      message: 'Salon seed data created successfully!',
      services: createdServices.length,
      barbers: createdBarbers.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
