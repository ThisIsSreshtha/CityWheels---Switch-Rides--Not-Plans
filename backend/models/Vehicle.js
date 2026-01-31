const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide vehicle name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify vehicle type'],
    enum: ['scooter', 'scooty', 'motorcycle', 'bicycle', 'car']
  },
  category: {
    type: String,
    required: true,
    enum: ['electric', 'non-electric']
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  images: [{
    type: String
  }],
  specifications: {
    seatingCapacity: Number,
    fuelType: String,
    mileage: String,
    engineCapacity: String,
    color: String,
    year: Number
  },
  pricing: {
    hourly: {
      type: Number,
      required: true
    },
    daily: {
      type: Number,
      required: true
    },
    weekly: {
      type: Number,
      required: true
    },
    securityDeposit: {
      type: Number,
      required: true
    }
  },
  location: {
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    area: String,
    pickupPoint: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      address: String
    }
  },
  availability: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'inactive'],
    default: 'available'
  },
  features: [{
    type: String
  }],
  documents: {
    rcCopy: String,
    insurance: String,
    pollution: String,
    insuranceExpiry: Date,
    pollutionExpiry: Date
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create geospatial index
vehicleSchema.index({ 'location.pickupPoint': '2dsphere' });

module.exports = mongoose.model('Vehicle', vehicleSchema);
