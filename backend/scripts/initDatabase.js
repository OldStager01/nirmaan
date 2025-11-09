const { sequelize, User, syncDatabase } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Sync database
    await syncDatabase();
    await sequelize.sync({ force: false, alter: true });

    console.log('✓ Database synced successfully');

    // Create admin user if not exists
    const adminExists = await User.findOne({
      where: { username: process.env.ADMIN_USERNAME || 'admin' }
    });

    if (!adminExists) {
      const adminUser = await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@nirmaan.gov.in',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        fullName: 'System Administrator',
        phoneNumber: '+91-1234567890',
        location: 'Government Office',
        isActive: true
      });
      console.log('✓ Admin user created:', adminUser.username);
    } else {
      console.log('ℹ Admin user already exists');
    }

    // Create farmer/user if not exists
    const farmerExists = await User.findOne({
      where: { username: process.env.USER_USERNAME || 'farmer' }
    });

    if (!farmerExists) {
      const farmerUser = await User.create({
        username: process.env.USER_USERNAME || 'farmer',
        email: process.env.USER_EMAIL || 'farmer@nirmaan.gov.in',
        password: process.env.USER_PASSWORD || 'Farmer@123',
        role: 'farmer',
        fullName: 'Ramesh Kumar',
        phoneNumber: '+91-9876543210',
        location: 'Maharashtra',
        isActive: true
      });
      console.log('✓ Farmer user created:', farmerUser.username);
    } else {
      console.log('ℹ Farmer user already exists');
    }

    console.log('\n✅ Database initialization completed!');
    console.log('\n📋 Default Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login:');
    console.log(`  Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\nFarmer Login:');
    console.log(`  Username: ${process.env.USER_USERNAME || 'farmer'}`);
    console.log(`  Password: ${process.env.USER_PASSWORD || 'Farmer@123'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
