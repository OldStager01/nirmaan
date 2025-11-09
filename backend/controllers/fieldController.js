const Field = require('../models/Field');
const SensorData = require('../models/SensorData');

// @desc    Create new field
// @route   POST /api/fields
// @access  Private
exports.createField = async (req, res) => {
  try {
    const {
      fieldName,
      location,
      area,
      caneVariety,
      plantingDate,
      expectedHarvestDate,
      soilType,
      irrigationType,
      notes
    } = req.body;

    const field = await Field.create({
      userId: req.user.id,
      fieldName,
      location,
      area,
      caneVariety,
      plantingDate,
      expectedHarvestDate,
      soilType,
      irrigationType,
      notes
    });

    res.status(201).json({
      status: 'success',
      message: 'Field created successfully',
      data: { field }
    });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all fields
// @route   GET /api/fields
// @access  Private
exports.getFields = async (req, res) => {
  try {
    const where = req.user.role !== 'admin' ? { userId: req.user.id } : {};

    const fields = await Field.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { fields }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get field by ID
// @route   GET /api/fields/:id
// @access  Private
exports.getFieldById = async (req, res) => {
  try {
    const field = await Field.findByPk(req.params.id);

    if (!field) {
      return res.status(404).json({
        status: 'error',
        message: 'Field not found'
      });
    }

    if (req.user.role !== 'admin' && field.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this field'
      });
    }

    res.json({
      status: 'success',
      data: { field }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update field
// @route   PUT /api/fields/:id
// @access  Private
exports.updateField = async (req, res) => {
  try {
    const field = await Field.findByPk(req.params.id);

    if (!field) {
      return res.status(404).json({
        status: 'error',
        message: 'Field not found'
      });
    }

    if (req.user.role !== 'admin' && field.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this field'
      });
    }

    await field.update(req.body);

    res.json({
      status: 'success',
      message: 'Field updated successfully',
      data: { field }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete field
// @route   DELETE /api/fields/:id
// @access  Private
exports.deleteField = async (req, res) => {
  try {
    const field = await Field.findByPk(req.params.id);

    if (!field) {
      return res.status(404).json({
        status: 'error',
        message: 'Field not found'
      });
    }

    if (req.user.role !== 'admin' && field.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this field'
      });
    }

    await field.destroy();

    res.json({
      status: 'success',
      message: 'Field deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get field sensor readings
// @route   GET /api/fields/:id/readings
// @access  Private
exports.getFieldReadings = async (req, res) => {
  try {
    const field = await Field.findByPk(req.params.id);

    if (!field) {
      return res.status(404).json({
        status: 'error',
        message: 'Field not found'
      });
    }

    if (req.user.role !== 'admin' && field.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this field'
      });
    }

    const readings = await SensorData.findAll({
      where: { fieldId: req.params.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      status: 'success',
      data: { field, readings }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
