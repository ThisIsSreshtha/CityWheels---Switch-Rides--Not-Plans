const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { protect, checkVerification } = require('../middleware/auth');
const moment = require('moment');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (User must be verified)
router.post('/', protect, checkVerification, async (req, res) => {
  try {
    const {
      vehicleId,
      rentalPeriod,
      duration,
      startDate,
      travelPurpose,
      purposeDetails,
      pickupLocation,
      dropoffLocation
    } = req.body;

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.availability !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available for booking'
      });
    }

    // Calculate end date
    let endDate;
    if (rentalPeriod === 'hourly') {
      endDate = moment(startDate).add(duration, 'hours').toDate();
    } else if (rentalPeriod === 'daily') {
      endDate = moment(startDate).add(duration, 'days').toDate();
    } else if (rentalPeriod === 'weekly') {
      endDate = moment(startDate).add(duration, 'weeks').toDate();
    }

    // Calculate pricing
    let basePrice;
    if (rentalPeriod === 'hourly') {
      basePrice = vehicle.pricing.hourly * duration;
    } else if (rentalPeriod === 'daily') {
      basePrice = vehicle.pricing.daily * duration;
    } else if (rentalPeriod === 'weekly') {
      basePrice = vehicle.pricing.weekly * duration;
    }

    const taxes = basePrice * 0.18; // 18% GST
    const totalAmount = basePrice + taxes + vehicle.pricing.securityDeposit;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      vehicle: vehicleId,
      rentalPeriod,
      duration,
      startDate,
      endDate,
      travelPurpose,
      purposeDetails,
      pickupLocation,
      dropoffLocation,
      pricing: {
        basePrice,
        securityDeposit: vehicle.pricing.securityDeposit,
        taxes,
        totalAmount
      }
    });

    // Update vehicle availability
    vehicle.availability = 'rented';
    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get current user's bookings
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('vehicle')
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

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${booking.status} booking`
      });
    }

    // Calculate refund based on cancellation time
    const hoursUntilStart = moment(booking.startDate).diff(moment(), 'hours');
    let refundAmount = 0;

    if (hoursUntilStart > 24) {
      refundAmount = booking.pricing.totalAmount * 0.9; // 90% refund
    } else if (hoursUntilStart > 12) {
      refundAmount = booking.pricing.totalAmount * 0.5; // 50% refund
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user.role,
      reason: req.body.reason,
      cancelledAt: Date.now(),
      refundAmount
    };

    await booking.save();

    // Make vehicle available again
    await Vehicle.findByIdAndUpdate(booking.vehicle, {
      availability: 'available'
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/rate
// @desc    Rate a completed booking
// @access  Private
router.put('/:id/rate', protect, async (req, res) => {
  try {
    const { vehicleRating, serviceRating, review } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }

    booking.rating = {
      vehicleRating,
      serviceRating,
      review,
      ratedAt: Date.now()
    };

    await booking.save();

    // Update vehicle rating
    const vehicle = await Vehicle.findById(booking.vehicle);
    const totalRating = vehicle.rating.average * vehicle.rating.count + vehicleRating;
    vehicle.rating.count += 1;
    vehicle.rating.average = totalRating / vehicle.rating.count;
    await vehicle.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
