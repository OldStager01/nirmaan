const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SensorData = sequelize.define('SensorData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'device_id'
  },
  fieldId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'field_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  // NIR Sensor Data
  sucroseLevel: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'sucrose_level',
    comment: 'Sucrose percentage detected by NIR sensor'
  },
  // Environmental Sensors
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Temperature in Celsius'
  },
  humidity: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Relative humidity percentage'
  },
  soilMoisture: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'soil_moisture',
    comment: 'Soil moisture percentage'
  },
  // Maturity Prediction
  maturityScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'maturity_score',
    comment: 'ML model predicted maturity score (0-100)'
  },
  maturityStatus: {
    type: DataTypes.ENUM('immature', 'maturing', 'ready', 'overripe'),
    allowNull: true,
    field: 'maturity_status'
  },
  predictedHarvestDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'predicted_harvest_date'
  },
  // Location Data
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  // Image Data
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_url'
  },
  leafColorIndex: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'leaf_color_index',
    comment: 'CNN model extracted leaf color metric'
  },
  // Additional Metadata
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rawData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'raw_data',
    comment: 'Complete raw sensor data in JSON format'
  }
}, {
  tableName: 'sensor_data',
  timestamps: true,
  indexes: [
    { fields: ['device_id'] },
    { fields: ['user_id'] },
    { fields: ['field_id'] },
    { fields: ['maturity_status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = SensorData;
