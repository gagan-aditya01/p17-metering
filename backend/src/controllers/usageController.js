const UsageEvent = require('../models/UsageEvent');
const Subscription = require('../models/Subscription');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { calculateUsageCost } = require('../services/rating.service');

// @desc    High-Throughput Rated Usage Event Ingestion
// @route   POST /api/v1/usage/ingest (Protected by verifyApiKey & checkEntitlement)
exports.ingestUsage = async (req, res, next) => {
  try {
    const { eventName, units, metadata } = req.body;

    if (!eventName || units === undefined || units <= 0) {
      return res.status(400).json({
        success: false,
        message: 'eventName and positive units are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const customer = req.customer;

    // Fetch active subscription populated with plan tier rules
    const activeSub = await Subscription.findOne({
      customerId: customer._id,
      status: 'active'
    }).populate('planId');

    // Calculate usage cost using Rating Engine
    const usageTiers = activeSub?.planId?.usageTiers || [
      { upTo: 10000, unitPrice: 0 },
      { upTo: null, unitPrice: 0.0005 } // Default rate if no plan
    ];

    const calculatedCost = calculateUsageCost(Number(units), usageTiers);

    // Save Usage Event Record with calculated monetary cost
    const event = await UsageEvent.create({
      customerId: customer._id,
      subscriptionId: activeSub ? activeSub._id : null,
      eventName,
      units: Number(units),
      calculatedCost,
      metadata: metadata || {},
      timestamp: new Date()
    });

    // Atomic Debit from Wallet Balance if cost > 0
    if (calculatedCost > 0) {
      await Wallet.findOneAndUpdate(
        { customerId: customer._id },
        { $inc: { balance: -calculatedCost } }
      );

      // Audit Ledger Entry
      await Transaction.create({
        customerId: customer._id,
        amount: calculatedCost,
        type: 'debit',
        description: `Metered Usage: ${units} units of ${eventName}`,
        metadata: { usageEventId: event._id }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Usage event rated & ingested successfully',
      eventId: event._id,
      unitsMetered: event.units,
      calculatedCost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Usage Logs
// @route   GET /api/v1/usage/logs (Protected by verifyJWT)
exports.getUsageLogs = async (req, res, next) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === 'customer') {
      if (!user.customerId) {
        return res.status(200).json({ success: true, count: 0, totalUnits: 0, totalCost: 0, data: [] });
      }
      query.customerId = user.customerId;
    } else if (req.query.customerId) {
      query.customerId = req.query.customerId;
    }

    if (req.query.eventName) {
      query.eventName = req.query.eventName;
    }

    const logs = await UsageEvent.find(query)
      .populate('customerId', 'name email')
      .sort({ timestamp: -1 })
      .limit(Number(req.query.limit) || 100)
      .lean();

    const totalUnits = logs.reduce((acc, log) => acc + log.units, 0);
    const totalCost = logs.reduce((acc, log) => acc + (log.calculatedCost || 0), 0);

    res.status(200).json({
      success: true,
      count: logs.length,
      totalUnits,
      totalCost: Math.round(totalCost * 1000) / 1000,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
