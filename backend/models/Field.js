const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Field = sequelize.define('Field', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  fieldName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'field_name'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  area: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Area in acres'
  },
  caneVariety: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'cane_variety'
  },
  plantingDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'planting_date'
  },
  expectedHarvestDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expected_harvest_date'
  },
  soilType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'soil_type'
  },
  irrigationType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'irrigation_type'
  },
  status: {
    type: DataTypes.ENUM('active', 'harvested', 'inactive'),
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'fields',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Field;
