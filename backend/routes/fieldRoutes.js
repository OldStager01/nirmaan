const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', fieldController.createField);
router.get('/', fieldController.getFields);
router.get('/:id', fieldController.getFieldById);
router.put('/:id', fieldController.updateField);
router.delete('/:id', fieldController.deleteField);
router.get('/:id/readings', fieldController.getFieldReadings);

module.exports = router;
