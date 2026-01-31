const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by admin
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'active' });
    const pendingVerifications = await User.countDocuments({ isVerified: false });
    
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('vehicle', 'name type')
      .sort('-createdAt')
      .limit(10);

    const revenue = await Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalVehicles,
          totalBookings,
          activeBookings,
          pendingVerifications,
          totalRevenue: revenue[0]?.total || 0
        },
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { verified, active, role } = req.query;
    
    let query = {};
    if (verified !== undefined) query.isVerified = verified === 'true';
    if (active !== undefined) query.isActive = active === 'true';
    if (role) query.role = role;

    const users = await User.find(query).sort('-createdAt');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user details
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const bookings = await Booking.find({ user: user._id })
      .populate('vehicle')
      .sort('-createdAt');

    res.json({
      success: true,
      data: {
        user,
        bookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify user documents
// @access  Private/Admin
router.put('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { verifyAadhar, verifyLicense } = req.body;

    if (verifyAadhar) {
      user.documents.aadharCard.verified = true;
    }
    if (verifyLicense) {
      user.documents.drivingLicense.verified = true;
    }

    // Mark user as verified if both documents are verified
    if (user.documents.aadharCard.verified && user.documents.drivingLicense.verified) {
      user.isVerified = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User verification updated',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Activate/Deactivate user account
// @access  Private/Admin
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('vehicle', 'name type registrationNumber')
      .sort('-createdAt');

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/bookings/:id/verify
// @desc    Verify booking documents
// @access  Private/Admin
router.put('/bookings/:id/verify', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.verificationStatus.documentsVerified = true;
    booking.verificationStatus.verifiedBy = req.user.id;
    booking.verificationStatus.verifiedAt = Date.now();
    booking.status = 'confirmed';

    await booking.save();

    res.json({
      success: true,
      message: 'Booking verified and confirmed',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/bookings/:id/start
// @desc    Mark booking as active (vehicle picked up)
// @access  Private/Admin
router.put('/bookings/:id/start', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = 'active';
    booking.actualStartTime = Date.now();
    booking.vehicleCondition.beforeRental = {
      condition: req.body.condition,
      images: req.body.images,
      notes: req.body.notes,
      checkedBy: req.user.id
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Booking started successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/bookings/:id/complete
// @desc    Mark booking as completed (vehicle returned)
// @access  Private/Admin
router.put('/bookings/:id/complete', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = 'completed';
    booking.actualEndTime = Date.now();
    booking.vehicleCondition.afterRental = {
      condition: req.body.condition,
      images: req.body.images,
      notes: req.body.notes,
      damages: req.body.damages,
      extraCharges: req.body.extraCharges || 0,
      checkedBy: req.user.id
    };

    await booking.save();

    // Make vehicle available again
    await Vehicle.findByIdAndUpdate(booking.vehicle, {
      availability: 'available',
      $inc: { totalBookings: 1 }
    });

    res.json({
      success: true,
      message: 'Booking completed successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/reports/revenue
// @desc    Get revenue reports
// @access  Private/Admin
router.get('/reports/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = { 'payment.status': 'paid' };
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const revenueByPeriod = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          totalBookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    const revenueByVehicleType = await Booking.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicle',
          foreignField: '_id',
          as: 'vehicleDetails'
        }
      },
      { $unwind: '$vehicleDetails' },
      {
        $group: {
          _id: '$vehicleDetails.type',
          totalRevenue: { $sum: '$pricing.totalAmount' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        revenueByPeriod,
        revenueByVehicleType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
