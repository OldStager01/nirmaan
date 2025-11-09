const { sequelize, User, Field, SensorData } = require('./models');

async function assignDataToOriginalFarmer() {
  try {
    // Find the original farmer and farmer1
    const originalFarmer = await User.findOne({ where: { username: 'farmer' } });
    const farmer1 = await User.findOne({ where: { username: 'farmer1' } });
    
    if (!originalFarmer || !farmer1) {
      console.log('Could not find required users');
      return;
    }
    
    console.log(`Transferring data from farmer1 to farmer...`);
    
    // Transfer 2 fields from farmer1 to original farmer
    const fields = await Field.findAll({ 
      where: { userId: farmer1.id },
      limit: 2
    });
    
    for (const field of fields) {
      await field.update({ userId: originalFarmer.id });
      console.log(`✓ Transferred field: ${field.fieldName}`);
      
      // Transfer sensor data for this field
      const sensorCount = await SensorData.count({ where: { fieldId: field.id } });
      await SensorData.update(
        { userId: originalFarmer.id },
        { where: { fieldId: field.id } }
      );
      console.log(`  ✓ Transferred ${sensorCount} sensor readings`);
    }
    
    console.log('\n✅ Data transfer completed!');
    console.log('Now the original farmer account has data to display.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

assignDataToOriginalFarmer();
