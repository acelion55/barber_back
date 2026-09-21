const express = require('express');
const router = express.Router();
const { getBarbers, adminGetBarbers, createBarber, updateBarber, deleteBarber } = require('../controllers/barberController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getBarbers);
router.get('/admin', protect, adminGetBarbers);
router.post('/', protect, upload.single('avatar'), createBarber);
router.put('/:id', protect, upload.single('avatar'), updateBarber);
router.delete('/:id', protect, deleteBarber);

module.exports = router;
