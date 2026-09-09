const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');

// @desc    Create customer & auto-generate apiKey
// @route   POST /api/v1/customers
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, currency } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and Email are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Customer with this email already exists',
        errorCode: 'DUPLICATE_ERROR'
      });
    }

    const customer = await Customer.create({
      name,
      email,
      currency: currency || 'USD'
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch all customers with active subscription
// @route   GET /api/v1/customers
exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 }).lean();

    // Fetch active subscriptions for all customers
    const customerIds = customers.map(c => c._id);
    const subscriptions = await Subscription.find({
      customerId: { $in: customerIds },
      status: 'active'
    }).populate('planId').lean();

    const subMap = {};
    subscriptions.forEach(sub => {
      subMap[sub.customerId.toString()] = sub;
    });

    const customersWithSubs = customers.map(customer => ({
      ...customer,
      subscription: subMap[customer._id.toString()] || null
    }));

    res.status(200).json({
      success: true,
      count: customersWithSubs.length,
      data: customersWithSubs
    });
  } catch (error) {
    next(error);
  }
};
