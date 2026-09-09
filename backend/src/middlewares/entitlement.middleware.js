const Wallet = require('../models/Wallet');
const Subscription = require('../models/Subscription');
const NodeCache = require('node-cache');

// In-Memory TTL Cache for entitlement gating (30 seconds TTL)
const entitlementCache = new NodeCache({ stdTTL: 30, checkperiod: 10 });

exports.checkEntitlement = async (req, res, next) => {
  try {
    const customer = req.customer;

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Customer context missing for entitlement check',
        errorCode: 'UNAUTHORIZED'
      });
    }

    const cacheKey = `entitlement_${customer._id.toString()}`;
    const cachedData = entitlementCache.get(cacheKey);

    let wallet, activeSub;

    if (cachedData) {
      wallet = cachedData.wallet;
      activeSub = cachedData.activeSub;
    } else {
      // DB Lookup on cache miss
      activeSub = await Subscription.findOne({
        customerId: customer._id,
        status: 'active'
      });

      wallet = await Wallet.findOne({ customerId: customer._id });
      if (!wallet) {
        wallet = await Wallet.create({ customerId: customer._id, balance: 50 });
      }

      // Store in TTL Cache
      entitlementCache.set(cacheKey, { wallet, activeSub });
    }

    // Entitlement Gating Check
    if (!activeSub && wallet.balance <= 0) {
      return res.status(402).json({
        success: false,
        message: 'Payment Required: Entitlement depleted or zero wallet balance',
        errorCode: 'ENTITLEMENT_EXHAUSTED',
        walletBalance: wallet.balance,
        hasActiveSubscription: false
      });
    }

    req.wallet = wallet;
    req.activeSubscription = activeSub;
    next();
  } catch (error) {
    next(error);
  }
};

exports.invalidateEntitlementCache = (customerId) => {
  if (customerId) {
    entitlementCache.del(`entitlement_${customerId.toString()}`);
  }
};
