const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');

const cities = ['Kolkata', 'Delhi', 'Mumbai', 'Chennai', 'Bangalore'];
const vehicles = [];
let regCounter = 1000;

cities.forEach(city => {
  const stateMap = {
    'Kolkata': 'West Bengal',
    'Delhi': 'Delhi',
    'Mumbai': 'Maharashtra',
    'Chennai': 'Tamil Nadu',
    'Bangalore': 'Karnataka'
  };

  const coordsMap = {
    'Kolkata': [88.3639, 22.5726],
    'Delhi': [77.1025, 28.7041],
    'Mumbai': [72.8777, 19.0760],
    'Chennai': [80.2707, 13.0827],
    'Bangalore': [77.5946, 12.9716]
  };

  const prefixMap = {
    'Kolkata': 'WB',
    'Delhi': 'DL',
    'Mumbai': 'MH',
    'Chennai': 'TN',
    'Bangalore': 'KA'
  };

  // Scooters
  vehicles.push({
    name: `Honda Activa (${city})`,
    type: 'scooter',
    category: 'non-electric',
    brand: 'Honda',
    model: 'Activa 6G',
    registrationNumber: `${prefixMap[city]}01AB${regCounter++}`,
    specifications: { seatingCapacity: 2, fuelType: 'petrol', mileage: '50 km/l', year: 2023 },
    pricing: { hourly: 150, daily: 750, weekly: 4200, securityDeposit: 100 },
    location: {
      city,
      state: stateMap[city],
      area: 'Central Area',
      pickupPoint: {
        type: 'Point',
        coordinates: coordsMap[city],
        address: `Main Street, ${city}`
      }
    },
    availability: 'available'
  });

  vehicles.push({
    name: `Ather 450X (${city})`,
    type: 'scooter',
    category: 'electric',
    brand: 'Ather',
    model: '450X',
    registrationNumber: `${prefixMap[city]}02EL${regCounter++}`,
    specifications: { seatingCapacity: 2, fuelType: 'electric', mileage: '85 km/charge', year: 2023 },
    pricing: { hourly: 120, daily: 600, weekly: 3500, securityDeposit: 100 },
    location: {
      city,
      state: stateMap[city],
      area: 'Tech Hub',
      pickupPoint: {
        type: 'Point',
        coordinates: coordsMap[city],
        address: `Tech Park, ${city}`
      }
    },
    availability: 'available'
  });

  // Motorcycles
  vehicles.push({
    name: `Bajaj Pulsar (${city})`,
    type: 'motorcycle',
    category: 'non-electric',
    brand: 'Bajaj',
    model: 'Pulsar 150',
    registrationNumber: `${prefixMap[city]}03MC${regCounter++}`,
    specifications: { seatingCapacity: 2, fuelType: 'petrol', mileage: '45 km/l', year: 2023 },
    pricing: { hourly: 180, daily: 900, weekly: 5500, securityDeposit: 100 },
    location: {
      city,
      state: stateMap[city],
      area: 'Market Area',
      pickupPoint: {
        type: 'Point',
        coordinates: coordsMap[city],
        address: `Market Street, ${city}`
      }
    },
    availability: 'available'
  });

  vehicles.push({
    name: `Royal Enfield Classic (${city})`,
    type: 'motorcycle',
    category: 'non-electric',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    registrationNumber: `${prefixMap[city]}04RE${regCounter++}`,
    specifications: { seatingCapacity: 2, fuelType: 'petrol', mileage: '35 km/l', year: 2023 },
    pricing: { hourly: 200, daily: 1000, weekly: 6000, securityDeposit: 100 },
    location: {
      city,
      state: stateMap[city],
      area: 'Downtown',
      pickupPoint: {
        type: 'Point',
        coordinates: coordsMap[city],
        address: `Downtown Area, ${city}`
      }
    },
    availability: 'available'
  });

  // Cars
  vehicles.push({
    name: `Maruti Swift (${city})`,
    type: 'car',
    category: 'non-electric',
    brand: 'Maruti',
    model: 'Swift Dzire',
    registrationNumber: `${prefixMap[city]}05CR${regCounter++}`,
    specifications: { seatingCapacity: 5, fuelType: 'petrol', mileage: '22 km/l', year: 2023 },
    pricing: { hourly: 300, daily: 1500, weekly: 9000, securityDeposit: 150 },
    location: {
      city,
      state: stateMap[city],
      area: 'Residential',
      pickupPoint: {
        type: 'Point',
        coordinates: coordsMap[city],
        address: `Residential Area, ${city}`
      }
    },
    availability: 'available'
  });

  // Bicycles
  vehicles.push({
    name: `City Bicycle (${city})`,
    type: 'bicycle',
    category: 'non-electric',
    brand: 'Firefox',
    model: 'Road Runner',
    registrationNumber: `${prefixMap[city]}06CY${regCounter++}`,
    specifications: { seatingCapacity: 1, fuelType: 'manual', mileage: 'N/A', year: 2023 },
    pricing: { hourly: 50, daily: 200, weekly: 1000, securityDeposit: 50 },
    location: {
      city,
      state: stateMap[city],
      area: 'Park Area',
      pickupPoint: {
        type: 'Point',
        coordinates: coordsMap[city],
        address: `City Park, ${city}`
      }
    },
    availability: 'available'
  });
});

const seedVehicles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/citywheels');
    console.log('MongoDB connected...');

    await Vehicle.deleteMany({});
    console.log('Existing vehicles cleared');

    await Vehicle.insertMany(vehicles);
    console.log(`${vehicles.length} vehicles seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    process.exit(1);
  }
};

seedVehicles();
