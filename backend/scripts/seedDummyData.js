const { sequelize, User, Field, SensorData } = require('../models');
const bcrypt = require('bcryptjs');

const indianFarmerNames = [
  { fullName: 'Ramesh Kumar Patel', location: 'Lucknow, Uttar Pradesh', phone: '9876543210' },
  { fullName: 'Suresh Singh Yadav', location: 'Muzaffarpur, Bihar', phone: '9876543211' },
  { fullName: 'Mahesh Babu Reddy', location: 'Nalgonda, Telangana', phone: '9876543212' },
  { fullName: 'Rajesh Kumar Singh', location: 'Gorakhpur, Uttar Pradesh', phone: '9876543213' },
  { fullName: 'Prakash Chandra Sharma', location: 'Pune, Maharashtra', phone: '9876543214' },
  { fullName: 'Dinesh Patel', location: 'Surat, Gujarat', phone: '9876543215' },
  { fullName: 'Ganesh Naik', location: 'Belgaum, Karnataka', phone: '9876543216' },
  { fullName: 'Vijay Kumar Deshmukh', location: 'Nagpur, Maharashtra', phone: '9876543217' },
  { fullName: 'Anil Singh Chauhan', location: 'Meerut, Uttar Pradesh', phone: '9876543218' },
  { fullName: 'Santosh Kumar Jha', location: 'Patna, Bihar', phone: '9876543219' },
  { fullName: 'Mohan Lal Verma', location: 'Indore, Madhya Pradesh', phone: '9876543220' },
  { fullName: 'Ravi Shankar Rao', location: 'Vijayawada, Andhra Pradesh', phone: '9876543221' },
  { fullName: 'Ashok Kumar Meena', location: 'Jaipur, Rajasthan', phone: '9876543222' },
  { fullName: 'Deepak Chauhan', location: 'Dehradun, Uttarakhand', phone: '9876543223' },
  { fullName: 'Kailash Prajapati', location: 'Vadodara, Gujarat', phone: '9876543224' },
  { fullName: 'Naresh Gowda', location: 'Mysore, Karnataka', phone: '9876543225' },
  { fullName: 'Mukesh Thakur', location: 'Shimla, Himachal Pradesh', phone: '9876543226' },
  { fullName: 'Subhash Yadav', location: 'Kanpur, Uttar Pradesh', phone: '9876543227' },
  { fullName: 'Yogesh Patil', location: 'Kolhapur, Maharashtra', phone: '9876543228' },
  { fullName: 'Harish Reddy', location: 'Warangal, Telangana', phone: '9876543229' },
];

const fieldNames = [
  'North Field Plot A', 'South Field Plot B', 'East Field Plot C', 'West Field Plot D',
  'Main Farm Section 1', 'Main Farm Section 2', 'Riverside Field', 'Hill Side Plot',
  'Valley Farm Area', 'Highland Sector', 'Irrigation Zone A', 'Organic Plot',
  'Experimental Field', 'Premium Sugarcane Area', 'Traditional Farming Zone'
];

const sugarcaneVarieties = [
  'CoC 671', 'Co 0238', 'Co 86032', 'CoS 767', 'Co 0118',
  'CoLk 8102', 'CoS 8436', 'Co 94012', 'CoM 88121', 'Co 98014'
];

async function seedDummyData() {
  try {
    console.log('🌱 Starting to seed dummy data...\n');

    // Check if dummy data already exists
    const existingFarmers = await User.count({ where: { username: 'farmer1' } });
    if (existingFarmers > 0) {
      console.log('⚠️  Dummy data already exists!');
      console.log('   Run this command to reset: rm backend/database.sqlite && npm run init-db && npm run seed-data');
      console.log('\nExiting...\n');
      return;
    }

    // Hash password for all farmers
    const hashedPassword = await bcrypt.hash('Farmer@123', 10);

    // Create 20 farmers
    console.log('👨‍🌾 Creating farmer accounts...');
    const farmers = [];
    for (let i = 0; i < indianFarmerNames.length; i++) {
      const farmer = await User.create({
        username: `farmer${i + 1}`,
        email: `farmer${i + 1}@nirmaan.gov.in`,
        password: hashedPassword,
        role: 'farmer',
        fullName: indianFarmerNames[i].fullName,
        phoneNumber: indianFarmerNames[i].phone,
        location: indianFarmerNames[i].location,
        isActive: Math.random() > 0.1 // 90% active
      });
      farmers.push(farmer);
      console.log(`  ✓ Created: ${farmer.fullName} (${farmer.username})`);
    }

    // Create 2-4 fields per farmer
    console.log('\n🌾 Creating sugarcane fields...');
    const fields = [];
    for (const farmer of farmers) {
      const numFields = Math.floor(Math.random() * 3) + 2; // 2-4 fields
      for (let i = 0; i < numFields; i++) {
        const plantingDate = new Date();
        plantingDate.setMonth(plantingDate.getMonth() - Math.floor(Math.random() * 12)); // 0-12 months ago
        
        const field = await Field.create({
          userId: farmer.id,
          fieldName: fieldNames[Math.floor(Math.random() * fieldNames.length)] + ` ${i + 1}`,
          location: farmer.location,
          area: (Math.random() * 4 + 1).toFixed(2), // 1-5 acres
          caneVariety: sugarcaneVarieties[Math.floor(Math.random() * sugarcaneVarieties.length)],
          plantingDate: plantingDate,
          expectedHarvestDate: new Date(plantingDate.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year later
          status: 'active'
        });
        fields.push(field);
      }
    }
    console.log(`  ✓ Created ${fields.length} fields`);

    // Create sensor data for each field (multiple readings per field)
    console.log('\n📊 Generating sensor data...');
    let totalReadings = 0;
    
    for (const field of fields) {
      // Generate 5-15 readings per field over the last 30 days
      const numReadings = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < numReadings; i++) {
        const readingDate = new Date();
        readingDate.setDate(readingDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
        
        // Simulate realistic sensor data
        const baseSuccrose = 12 + Math.random() * 10; // 12-22%
        const temperature = 25 + Math.random() * 10; // 25-35°C
        const humidity = 60 + Math.random() * 30; // 60-90%
        const soilMoisture = 40 + Math.random() * 40; // 40-80%
        
        // Calculate maturity based on sucrose level
        let maturityStatus, maturityScore;
        if (baseSuccrose >= 18) {
          maturityStatus = 'ready';
          maturityScore = 80 + Math.random() * 20;
        } else if (baseSuccrose >= 15) {
          maturityStatus = 'maturing';
          maturityScore = 60 + Math.random() * 20;
        } else if (baseSuccrose >= 12) {
          maturityStatus = 'immature';
          maturityScore = 40 + Math.random() * 20;
        } else {
          maturityStatus = 'not_ready';
          maturityScore = Math.random() * 40;
        }
        
        // Predicted harvest date based on maturity
        const predictedHarvestDate = new Date();
        if (maturityStatus === 'ready') {
          predictedHarvestDate.setDate(predictedHarvestDate.getDate() + Math.floor(Math.random() * 7)); // 0-7 days
        } else if (maturityStatus === 'maturing') {
          predictedHarvestDate.setDate(predictedHarvestDate.getDate() + Math.floor(Math.random() * 21) + 7); // 7-28 days
        } else {
          predictedHarvestDate.setDate(predictedHarvestDate.getDate() + Math.floor(Math.random() * 60) + 28); // 28-88 days
        }
        
        await SensorData.create({
          userId: field.userId,
          fieldId: field.id,
          deviceId: `DEVICE-${field.id.substring(0, 8)}`,
          sucroseLevel: parseFloat(baseSuccrose.toFixed(2)),
          temperature: parseFloat(temperature.toFixed(1)),
          humidity: parseFloat(humidity.toFixed(1)),
          soilMoisture: parseFloat(soilMoisture.toFixed(1)),
          maturityScore: parseFloat(maturityScore.toFixed(1)),
          maturityStatus: maturityStatus,
          predictedHarvestDate: predictedHarvestDate,
          confidence: parseFloat((75 + Math.random() * 20).toFixed(1)), // 75-95%
          latitude: (20 + Math.random() * 10).toFixed(6), // India latitude range
          longitude: (72 + Math.random() * 16).toFixed(6), // India longitude range
          createdAt: readingDate
        });
        
        totalReadings++;
      }
    }
    
    console.log(`  ✓ Created ${totalReadings} sensor readings`);

    console.log('\n✅ Dummy data seeding completed successfully!\n');
    console.log('📈 Summary:');
    console.log(`   - Farmers: ${farmers.length}`);
    console.log(`   - Fields: ${fields.length}`);
    console.log(`   - Sensor Readings: ${totalReadings}`);
    console.log('\n🔐 All farmers can login with:');
    console.log('   Username: farmer1, farmer2, ..., farmer20');
    console.log('   Password: Farmer@123');

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seeder
seedDummyData();
