const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

// Multer config for vehicle images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    cb(null, `owner-${req.user.id}-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ==================== DASHBOARD ====================

// @route   GET /api/owner/stats
// @desc    Get owner dashboard stats
// @access  Private/Owner
router.get('/stats', protect, authorize('owner'), async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments({ owner: req.user.id });
    const activeVehicles = await Vehicle.countDocuments({ owner: req.user.id, availability: 'available' });
    const rentedVehicles = await Vehicle.countDocuments({ owner: req.user.id, availability: 'rented' });

    const bookings = await Booking.find({
      vehicle: { $in: await Vehicle.find({ owner: req.user.id }).distinct('_id') }
    });

    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const activeBookings = bookings.filter(b => b.status === 'active').length;

    res.json({
      success: true,
      data: {
        totalVehicles,
        activeVehicles,
        rentedVehicles,
        totalEarnings,
        activeBookings,
        totalBookings: bookings.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== MY RENTALS (Vehicles) ====================

// @route   GET /api/owner/vehicles
// @desc    Get all vehicles owned by this owner
// @access  Private/Owner
router.get('/vehicles', protect, authorize('owner'), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id }).sort('-createdAt');
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/owner/vehicles
// @desc    Add a new vehicle for rent
// @access  Private/Owner
router.post('/vehicles', protect, authorize('owner'), async (req, res) => {
  try {
    req.body.owner = req.user.id;
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, message: 'Vehicle added successfully', data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/owner/vehicles/:id
// @desc    Update own vehicle
// @access  Private/Owner
router.put('/vehicles/:id', protect, authorize('owner'), async (req, res) => {
  try {
    let vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found or not authorized' });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Vehicle updated', data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/owner/vehicles/:id
// @desc    Remove own vehicle
// @access  Private/Owner
router.delete('/vehicles/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found or not authorized' });
    }
    res.json({ success: true, message: 'Vehicle removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== BOOKINGS FOR OWNER'S VEHICLES ====================

// @route   GET /api/owner/bookings
// @desc    Get bookings for owner's vehicles
// @access  Private/Owner
router.get('/bookings', protect, authorize('owner'), async (req, res) => {
  try {
    const vehicleIds = await Vehicle.find({ owner: req.user.id }).distinct('_id');
    const bookings = await Booking.find({ vehicle: { $in: vehicleIds } })
      .populate('vehicle', 'name type registrationNumber')
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PROFILE ====================

// @route   GET /api/owner/profile
// @desc    Get owner profile
// @access  Private/Owner
router.get('/profile', protect, authorize('owner'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/owner/profile
// @desc    Update owner profile
// @access  Private/Owner
router.put('/profile', protect, authorize('owner'), async (req, res) => {
  try {
    const { name, phone, address, businessName, businessAddress } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, businessName, businessAddress },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== DOCUMENT VERIFICATION ====================

// @route   POST /api/owner/documents/aadhar
// @desc    Upload Aadhar card
// @access  Private/Owner
router.post('/documents/aadhar', protect, authorize('owner'), upload.single('aadhar'), async (req, res) => {
  try {
    const { aadharNumber } = req.body;
    const user = await User.findById(req.user.id);
    user.documents.aadharCard = { number: aadharNumber, imageUrl: req.file.path, verified: false };
    await user.save();
    res.json({ success: true, message: 'Aadhar uploaded. Pending verification.', data: user.documents.aadharCard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/owner/documents/license
// @desc    Upload Driving License
// @access  Private/Owner
router.post('/documents/license', protect, authorize('owner'), upload.single('license'), async (req, res) => {
  try {
    const { licenseNumber, expiryDate } = req.body;
    const user = await User.findById(req.user.id);
    user.documents.drivingLicense = { number: licenseNumber, imageUrl: req.file.path, expiryDate, verified: false };
    await user.save();
    res.json({ success: true, message: 'License uploaded. Pending verification.', data: user.documents.drivingLicense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/owner/documents/business
// @desc    Upload Business Registration / GST
// @access  Private/Owner
router.post('/documents/business', protect, authorize('owner'), upload.single('businessDoc'), async (req, res) => {
  try {
    const { gstNumber } = req.body;
    const user = await User.findById(req.user.id);
    if (!user.documents) user.documents = {};
    user.documents.businessRegistration = { number: gstNumber, imageUrl: req.file.path, verified: false };
    user.markModified('documents');
    await user.save();
    res.json({ success: true, message: 'Business document uploaded. Pending verification.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
