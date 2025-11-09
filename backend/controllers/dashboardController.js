const { SensorData, Field, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const where = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    // Total readings
    const totalReadings = await SensorData.count({ where });

    // Readings today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const readingsToday = await SensorData.count({
      where: {
        ...where,
        createdAt: { [Op.gte]: today }
      }
    });

    // Maturity distribution
    const maturityCounts = await SensorData.findAll({
      where,
      attributes: [
        'maturityStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['maturityStatus']
    });

    const maturityDistribution = {
      immature: 0,
      maturing: 0,
      ready: 0,
      overripe: 0
    };

    maturityCounts.forEach(item => {
      if (item.maturityStatus) {
        maturityDistribution[item.maturityStatus] = parseInt(item.dataValues.count);
      }
    });

    // Fields ready to harvest
    const fieldsReady = maturityDistribution.ready;

    // Average sucrose level
    const avgSucrose = await SensorData.findOne({
      where: {
        ...where,
        sucroseLevel: { [Op.not]: null }
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('sucrose_level')), 'average']
      ]
    });

    // Active fields count
    const activeFields = await Field.count({
      where: {
        ...(req.user.role !== 'admin' ? { userId: req.user.id } : {}),
        status: 'active'
      }
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await SensorData.count({
      where: {
        ...where,
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    res.json({
      status: 'success',
      data: {
        stats: {
          totalReadings,
          readingsToday,
          fieldsReady,
          activeFields,
          recentActivity,
          averageSucroseLevel: avgSucrose?.dataValues?.average || 0,
          maturityDistribution
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get maturity distribution chart data
// @route   GET /api/dashboard/charts/maturity-distribution
// @access  Private
exports.getMaturityDistribution = async (req, res) => {
  try {
    const where = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    const distribution = await SensorData.findAll({
      where,
      attributes: [
        'maturityStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['maturityStatus']
    });

    const chartData = distribution.map(item => ({
      status: item.maturityStatus || 'unknown',
      count: parseInt(item.dataValues.count),
      percentage: 0 // Calculate after getting total
    }));

    const total = chartData.reduce((sum, item) => sum + item.count, 0);
    chartData.forEach(item => {
      item.percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
    });

    res.json({
      status: 'success',
      data: { chartData }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get sucrose trend over time
// @route   GET /api/dashboard/charts/sucrose-trend
// @access  Private
exports.getSucroseTrend = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const where = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    where.createdAt = { [Op.gte]: startDate };
    where.sucroseLevel = { [Op.not]: null };

    // Use SUBSTR for SQLite compatibility instead of DATE()
    const trendData = await SensorData.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('AVG', sequelize.col('sucrose_level')), 'avgSucrose'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    const chartData = trendData.map(item => ({
      date: item.date,
      avgSucrose: parseFloat(item.avgSucrose || 0).toFixed(2),
      count: parseInt(item.count || 0)
    }));

    res.json({
      status: 'success',
      data: { chartData }
    });
  } catch (error) {
    console.error('Sucrose trend error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get environmental data
// @route   GET /api/dashboard/charts/environmental
// @access  Private
exports.getEnvironmentalData = async (req, res) => {
  try {
    const where = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    const latestReadings = await SensorData.findAll({
      where: {
        ...where,
        temperature: { [Op.not]: null }
      },
      attributes: ['temperature', 'humidity', 'soilMoisture', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    const chartData = latestReadings.reverse().map(reading => ({
      timestamp: reading.createdAt,
      temperature: reading.temperature,
      humidity: reading.humidity,
      soilMoisture: reading.soilMoisture
    }));

    res.json({
      status: 'success',
      data: { chartData }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get alerts and notifications
// @route   GET /api/dashboard/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const where = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    const alerts = [];

    // Ready to harvest alerts
    const readyFields = await SensorData.findAll({
      where: {
        ...where,
        maturityStatus: 'ready',
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: [
        {
          model: Field,
          as: 'field',
          attributes: ['fieldName', 'location'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    readyFields.forEach(reading => {
      alerts.push({
        type: 'success',
        priority: 'high',
        title: 'Ready for Harvest',
        message: `${reading.field?.fieldName || 'Field'} has reached optimal maturity (${reading.maturityScore}% score)`,
        timestamp: reading.createdAt,
        data: {
          fieldId: reading.fieldId,
          sucroseLevel: reading.sucroseLevel
        }
      });
    });

    // Overripe warnings
    const overripe = await SensorData.count({
      where: {
        ...where,
        maturityStatus: 'overripe'
      }
    });

    if (overripe > 0) {
      alerts.push({
        type: 'warning',
        priority: 'high',
        title: 'Overripe Crops Detected',
        message: `${overripe} field(s) showing overripe status. Immediate action recommended.`,
        timestamp: new Date()
      });
    }

    // Low sucrose alerts
    const lowSucrose = await SensorData.findAll({
      where: {
        ...where,
        sucroseLevel: { [Op.lt]: 10 },
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      limit: 5
    });

    lowSucrose.forEach(reading => {
      alerts.push({
        type: 'info',
        priority: 'medium',
        title: 'Low Sucrose Detected',
        message: `Sucrose level at ${reading.sucroseLevel}% - Monitor field conditions`,
        timestamp: reading.createdAt
      });
    });

    res.json({
      status: 'success',
      data: {
        alerts: alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      }
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
