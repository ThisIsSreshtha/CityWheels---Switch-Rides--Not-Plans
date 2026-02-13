const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');

const updateVehicleStatuses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/citywheels');
        console.log('MongoDB connected...');

        // Get all vehicles
        const allVehicles = await Vehicle.find();
        console.log(`Total vehicles: ${allVehicles.length}`);

        if (allVehicles.length === 0) {
            console.log('No vehicles found');
            process.exit(0);
        }

        // Update first 6 vehicles with different statuses to show variety
        const updates = [
            { status: 'rented', count: 2 },      // 2 booked
            { status: 'maintenance', count: 1 }, // 1 in maintenance
            { status: 'inactive', count: 1 }     // 1 inactive
            // Rest stay 'available'
        ];

        let vehicleIndex = 0;

        for (const update of updates) {
            for (let i = 0; i < update.count && vehicleIndex < allVehicles.length; i++) {
                const vehicle = allVehicles[vehicleIndex];
                vehicle.availability = update.status;
                await vehicle.save();
                console.log(`Updated ${vehicle.name} to ${update.status}`);
                vehicleIndex++;
            }
        }

        console.log('✅ Vehicle statuses updated successfully!');
        console.log(`- ${updates[0].count} vehicles set to 'rented'  (Booked)`);
        console.log(`- ${updates[1].count} vehicle set to 'maintenance'`);
        console.log(`- ${updates[2].count} vehicle set to 'inactive' (Unavailable)`);
        console.log(`- ${allVehicles.length - vehicleIndex} vehicles remain 'available'`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

updateVehicleStatuses();
