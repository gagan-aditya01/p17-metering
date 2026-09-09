const Plan = require('../models/Plan');

// @desc    Create a new Plan
// @route   POST /api/v1/plans
exports.createPlan = async (req, res, next) => {
  try {
    const { name, description, baseFee, currency, unitName, usageTiers } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Plan name is required', errorCode: 'VALIDATION_ERROR' });
    }

    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return res.status(409).json({ success: false, message: 'Plan with this name already exists', errorCode: 'DUPLICATE_ERROR' });
    }

    const plan = await Plan.create({
      name,
      description,
      baseFee: baseFee || 0,
      currency: currency || 'USD',
      unitName: unitName || 'tokens',
      usageTiers: usageTiers || []
    });

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active plans
// @route   GET /api/v1/plans
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};
