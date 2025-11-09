const sequelize = require('../config/database');
const User = require('./User');
const SensorData = require('./SensorData');
const Field = require('./Field');

// Define associations
User.hasMany(SensorData, { foreignKey: 'userId', as: 'sensorReadings' });
SensorData.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Field, { foreignKey: 'userId', as: 'fields' });
Field.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Field.hasMany(SensorData, { foreignKey: 'fieldId', as: 'sensorReadings' });
SensorData.belongsTo(Field, { foreignKey: 'fieldId', as: 'field' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synchronized');
  } catch (error) {
    console.error('✗ Database sync error:', error.message);
  }
};

module.exports = {
  sequelize,
  User,
  SensorData,
  Field,
  syncDatabase
};
