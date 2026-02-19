const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  rentalPeriod: {
    type: String,
    enum: ['hourly', 'daily', 'weekly'],
    required: true
  },
  duration: {
    type: Number,
    required: true // hours, days, or weeks based on rentalPeriod
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    address: String
  },
  dropoffLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    address: String
  },
  travelPurpose: {
    type: String,
    required: true,
    enum: ['personal', 'business', 'tourism', 'emergency', 'other']
  },
  purposeDetails: String,
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    securityDeposit: {
      type: Number,
      required: true
    },
    taxes: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'partial'],
      default: 'pending'
    },
    method: String,
    transactionId: String,
    paidAmount: Number,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  verificationStatus: {
    documentsVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  },
  vehicleCondition: {
    beforeRental: {
      condition: String,
      images: [String],
      notes: String,
      checkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    afterRental: {
      condition: String,
      images: [String],
      notes: String,
      damages: String,
      extraCharges: Number,
      checkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  },
  rating: {
    vehicleRating: Number,
    serviceRating: Number,
    review: String,
    ratedAt: Date
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['user', 'admin']
    },
    reason: String,
    cancelledAt: Date,
    refundAmount: Number
  }
}, {
  timestamps: true
});

// Generate booking ID
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingId = `CW${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
