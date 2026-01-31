const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/users/documents/aadhar
// @desc    Upload Aadhar card
// @access  Private
router.post('/documents/aadhar', protect, upload.single('aadhar'), async (req, res) => {
  try {
    const { aadharNumber } = req.body;

    const user = await User.findById(req.user.id);
    user.documents.aadharCard = {
      number: aadharNumber,
      imageUrl: req.file.path,
      verified: false
    };

    await user.save();

    res.json({
      success: true,
      message: 'Aadhar card uploaded successfully',
      data: user.documents.aadharCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/users/documents/license
// @desc    Upload Driving License
// @access  Private
router.post('/documents/license', protect, upload.single('license'), async (req, res) => {
  try {
    const { licenseNumber, expiryDate } = req.body;

    const user = await User.findById(req.user.id);
    user.documents.drivingLicense = {
      number: licenseNumber,
      imageUrl: req.file.path,
      expiryDate,
      verified: false
    };

    await user.save();

    res.json({
      success: true,
      message: 'Driving license uploaded successfully',
      data: user.documents.drivingLicense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
