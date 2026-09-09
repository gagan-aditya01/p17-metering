const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const Plan = require('../models/Plan');

// @desc    Assign or change a plan for a customer
// @route   POST /api/v1/subscriptions
exports.createSubscription = async (req, res, next) => {
  try {
    const { customerId, planId } = req.body;

    if (!customerId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'customerId and planId are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found', errorCode: 'NOT_FOUND' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found', errorCode: 'NOT_FOUND' });
    }

    // Cancel existing active subscription if any
    await Subscription.updateMany(
      { customerId, status: 'active' },
      { status: 'canceled' }
    );

    const subscription = await Subscription.create({
      customerId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('customerId')
      .populate('planId');

    res.status(201).json({
      success: true,
      message: 'Subscription assigned successfully',
      data: populatedSubscription
    });
  } catch (error) {
    next(error);
  }
};
