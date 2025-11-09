const SensorData = require('../models/SensorData');
const Field = require('../models/Field');
const { Op } = require('sequelize');

// Simulate ML maturity prediction (In production, call actual ML model)
const predictMaturity = (sensorReading) => {
  const { sucroseLevel, temperature, humidity, soilMoisture } = sensorReading;
  
  let maturityScore = 0;
  let maturityStatus = 'immature';
  let daysToHarvest = 30;

  // Simple rule-based prediction (replace with actual ML model)
  if (sucroseLevel) {
    if (sucroseLevel >= 18) {
      maturityScore = 95;
      maturityStatus = 'ready';
      daysToHarvest = 0;
    } else if (sucroseLevel >= 15) {
      maturityScore = 75;
      maturityStatus = 'maturing';
      daysToHarvest = 7;
    } else if (sucroseLevel >= 12) {
      maturityScore = 50;
      maturityStatus = 'maturing';
      daysToHarvest = 14;
    } else {
      maturityScore = 30;
      maturityStatus = 'immature';
      daysToHarvest = 25;
    }
  }

  // Adjust based on environmental factors
  if (temperature && temperature > 30) maturityScore -= 5;
  if (humidity && humidity < 60) maturityScore -= 3;
  if (soilMoisture && soilMoisture < 40) maturityScore -= 5;

  maturityScore = Math.max(0, Math.min(100, maturityScore));

  const predictedHarvestDate = new Date();
  predictedHarvestDate.setDate(predictedHarvestDate.getDate() + daysToHarvest);

  return {
    maturityScore,
    maturityStatus,
    predictedHarvestDate
  };
};

// @desc    Submit sensor data
// @route   POST /api/sensors/data
// @access  Private
exports.submitSensorData = async (req, res) => {
  try {
    const {
      deviceId,
      fieldId,
      sucroseLevel,
      temperature,
      humidity,
      soilMoisture,
      latitude,
      longitude,
      imageUrl,
      leafColorIndex,
      notes,
      rawData
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        status: 'error',
        message: 'Device ID is required'
      });
    }

    // Predict maturity
    const prediction = predictMaturity({
      sucroseLevel,
      temperature,
      humidity,
      soilMoisture
    });

    // Create sensor data record
    const sensorData = await SensorData.create({
      deviceId,
      fieldId: fieldId || null,
      userId: req.user.id,
      sucroseLevel,
      temperature,
      humidity,
      soilMoisture,
      latitude,
      longitude,
      imageUrl,
      leafColorIndex,
      notes,
      rawData,
      ...prediction
    });

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    io.emit('newSensorData', {
      id: sensorData.id,
      deviceId: sensorData.deviceId,
      maturityStatus: sensorData.maturityStatus,
      maturityScore: sensorData.maturityScore,
      sucroseLevel: sensorData.sucroseLevel,
      timestamp: sensorData.createdAt
    });

    res.status(201).json({
      status: 'success',
      message: 'Sensor data submitted successfully',
      data: { sensorData }
    });
  } catch (error) {
    console.error('Submit sensor data error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to submit sensor data'
    });
  }
};

// @desc    Get all sensor data with filtering
// @route   GET /api/sensors/data
// @access  Private
exports.getSensorData = async (req, res) => {
  try {
    const {
      fieldId,
      deviceId,
      maturityStatus,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = req.query;

    const where = {};

    // Non-admin users can only see their own data
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }

    if (fieldId) where.fieldId = fieldId;
    if (deviceId) where.deviceId = deviceId;
    if (maturityStatus) where.maturityStatus = maturityStatus;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const sensorData = await SensorData.findAll({
      where,
      include: [
        {
          model: Field,
          as: 'field',
          attributes: ['id', 'fieldName', 'location', 'caneVariety']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await SensorData.count({ where });

    res.json({
      status: 'success',
      data: {
        sensorData,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: total > parseInt(offset) + parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get sensor data error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get sensor data by ID
// @route   GET /api/sensors/data/:id
// @access  Private
exports.getSensorDataById = async (req, res) => {
  try {
    const sensorData = await SensorData.findByPk(req.params.id, {
      include: [
        {
          model: Field,
          as: 'field',
          attributes: ['id', 'fieldName', 'location', 'caneVariety', 'plantingDate']
        }
      ]
    });

    if (!sensorData) {
      return res.status(404).json({
        status: 'error',
        message: 'Sensor data not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && sensorData.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this data'
      });
    }

    res.json({
      status: 'success',
      data: { sensorData }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get latest readings for dashboard
// @route   GET /api/sensors/latest
// @access  Private
exports.getLatestReadings = async (req, res) => {
  try {
    const where = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    const latestReadings = await SensorData.findAll({
      where,
      include: [
        {
          model: Field,
          as: 'field',
          attributes: ['fieldName', 'location']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      status: 'success',
      data: { latestReadings }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get device-specific data
// @route   GET /api/sensors/device/:deviceId
// @access  Private
exports.getDeviceData = async (req, res) => {
  try {
    const where = { deviceId: req.params.deviceId };
    
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }

    const deviceData = await SensorData.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      status: 'success',
      data: { deviceData }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete sensor data
// @route   DELETE /api/sensors/data/:id
// @access  Private
exports.deleteSensorData = async (req, res) => {
  try {
    const sensorData = await SensorData.findByPk(req.params.id);

    if (!sensorData) {
      return res.status(404).json({
        status: 'error',
        message: 'Sensor data not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && sensorData.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this data'
      });
    }

    await sensorData.destroy();

    res.json({
      status: 'success',
      message: 'Sensor data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
