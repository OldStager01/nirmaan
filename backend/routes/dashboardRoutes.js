const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/charts/maturity-distribution', dashboardController.getMaturityDistribution);
router.get('/charts/sucrose-trend', dashboardController.getSucroseTrend);
router.get('/charts/environmental', dashboardController.getEnvironmentalData);
router.get('/alerts', dashboardController.getAlerts);

module.exports = router;
