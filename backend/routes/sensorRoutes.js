const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/data', sensorController.submitSensorData);
router.get('/data', sensorController.getSensorData);
router.get('/data/:id', sensorController.getSensorDataById);
router.get('/latest', sensorController.getLatestReadings);
router.get('/device/:deviceId', sensorController.getDeviceData);
router.delete('/data/:id', sensorController.deleteSensorData);

module.exports = router;
