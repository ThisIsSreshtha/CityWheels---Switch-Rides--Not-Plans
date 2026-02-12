const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@citywheels.com' });

        if (existingAdmin) {
            console.log('Admin account already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('To reset password, delete this user from database and run this script again.');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@citywheels.com',
            phone: '9999999999',
            password: 'Admin@123',
            role: 'admin',
            isVerified: true,
            isActive: true
        });

        console.log('✅ Admin account created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    admin@citywheels.com');
        console.log('🔑 Password: Admin@123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
