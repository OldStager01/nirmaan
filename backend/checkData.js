const { sequelize, SensorData, User, Field } = require('./models');

async function checkData() {
  try {
    const sensorCount = await SensorData.count();
    const farmerCount = await User.count({ where: { role: 'farmer' } });
    const fieldCount = await Field.count();
    
    console.log('\n📊 Database Status:');
    console.log(`   Sensor Readings: ${sensorCount}`);
    console.log(`   Farmers: ${farmerCount}`);
    console.log(`   Fields: ${fieldCount}`);
    
    if (sensorCount > 0) {
      const sample = await SensorData.findOne({
        order: [['createdAt', 'DESC']]
      });
      console.log('\n   Sample Reading:');
      console.log(`   - Sucrose: ${sample.sucroseLevel}%`);
      console.log(`   - Temperature: ${sample.temperature}°C`);
      console.log(`   - Maturity: ${sample.maturityStatus}`);
      console.log(`   - Date: ${sample.createdAt}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkData();
