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

    // Seed Appointments
    const Appointment = require('../models/Appointment');
    await Appointment.deleteMany({});

    const todayStr = new Date().toISOString().split('T')[0];
    const initialAppointments = [
      {
        customerName: 'Rohit Verma',
        customerPhone: '+91 98290 12345',
        customerEmail: 'rohit@example.com',
        services: [
          { serviceId: createdServices[0]._id, title: createdServices[0].title, price: createdServices[0].price, durationMinutes: createdServices[0].durationMinutes }
        ],
        barber: createdBarbers[0]._id,
        barberName: createdBarbers[0].name,
        date: todayStr,
        startTime: '09:30',
        endTime: '10:00',
        startMinutes: 570,
        endMinutes: 600,
        totalDurationMinutes: 30,
        totalAmount: 350,
        status: 'confirmed',
        notes: 'Wants skin fade on sides',
        bookingId: 'BK-100891'
      },
      {
        customerName: 'Vikramaditya Rathore',
        customerPhone: '+91 94140 67890',
        customerEmail: 'vikram@example.com',
        services: [
          { serviceId: createdServices[1]._id, title: createdServices[1].title, price: createdServices[1].price, durationMinutes: createdServices[1].durationMinutes }
        ],
        barber: createdBarbers[2]._id,
        barberName: createdBarbers[2].name,
        date: todayStr,
        startTime: '10:30',
        endTime: '11:20',
        startMinutes: 630,
        endMinutes: 680,
        totalDurationMinutes: 50,
        totalAmount: 650,
        status: 'confirmed',
        notes: 'Beard line-up with sharp razor',
        bookingId: 'BK-100892'
      },
      {
        customerName: 'Karan Malhotra',
        customerPhone: '+91 97850 54321',
        customerEmail: 'karan@example.com',
        services: [
          { serviceId: createdServices[3]._id, title: createdServices[3].title, price: createdServices[3].price, durationMinutes: createdServices[3].durationMinutes }
        ],
        barber: createdBarbers[1]._id,
        barberName: createdBarbers[1].name,
        date: todayStr,
        startTime: '11:30',
        endTime: '12:05',
        startMinutes: 690,
        endMinutes: 725,
        totalDurationMinutes: 35,
        totalAmount: 500,
        status: 'completed',
        notes: 'Scalp massager preference',
        bookingId: 'BK-100893'
      },
      {
        customerName: 'Sameer Kapoor',
        customerPhone: '+91 80035 99887',
        customerEmail: 'sameer@example.com',
        services: [
          { serviceId: createdServices[5]._id, title: createdServices[5].title, price: createdServices[5].price, durationMinutes: createdServices[5].durationMinutes }
        ],
        barber: createdBarbers[0]._id,
        barberName: createdBarbers[0].name,
        date: todayStr,
        startTime: '15:00',
        endTime: '16:15',
        startMinutes: 900,
        endMinutes: 975,
        totalDurationMinutes: 75,
        totalAmount: 1200,
        status: 'confirmed',
        notes: 'VIP guest - complimentary espresso requested',
        bookingId: 'BK-100894'
      }
    ];

    const createdAppointments = await Appointment.insertMany(initialAppointments);

    res.json({
      success: true,
      message: 'Salon seed data created successfully!',
      services: createdServices.length,
      barbers: createdBarbers.length,
      appointments: createdAppointments.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
