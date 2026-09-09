const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// @desc    Get customer wallet balance & transactions
// @route   GET /api/v1/wallets
exports.getWallet = async (req, res, next) => {
  try {
    const user = req.user;
    let targetCustomerId;

    if (user.role === 'customer') {
      if (!user.customerId) {
        return res.status(404).json({ success: false, message: 'No customer account attached', errorCode: 'NOT_FOUND' });
      }
      targetCustomerId = user.customerId;
    } else {
      targetCustomerId = req.query.customerId;
      if (!targetCustomerId) {
        // If admin doesn't pass customerId, fetch first customer's wallet or return summary
        const firstCust = await Customer.findOne();
        if (!firstCust) return res.status(200).json({ success: true, wallet: null, transactions: [] });
        targetCustomerId = firstCust._id;
      }
    }

    let wallet = await Wallet.findOne({ customerId: targetCustomerId }).populate('customerId', 'name email');
    if (!wallet) {
      wallet = await Wallet.create({ customerId: targetCustomerId, balance: 50 });
      wallet = await Wallet.findById(wallet._id).populate('customerId', 'name email');
    }

    const transactions = await Transaction.find({ customerId: targetCustomerId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        wallet,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Top-up credits to customer wallet (Atomic $inc operator)
// @route   POST /api/v1/wallets/topup
exports.topUpWallet = async (req, res, next) => {
  try {
    const { amount, customerId, description } = req.body;
    const user = req.user;

    const topUpAmount = Number(amount);
    if (!topUpAmount || topUpAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive top-up amount is required', errorCode: 'VALIDATION_ERROR' });
    }

    let targetCustId = user.role === 'customer' ? user.customerId : customerId;
    if (!targetCustId) {
      return res.status(400).json({ success: false, message: 'customerId is required', errorCode: 'VALIDATION_ERROR' });
    }

    // Atomic Balance Credit via $inc operator
    const updatedWallet = await Wallet.findOneAndUpdate(
      { customerId: targetCustId },
      { $inc: { balance: topUpAmount } },
      { new: true, upsert: true }
    );

    // Create Audit Transaction Record
    const transaction = await Transaction.create({
      customerId: targetCustId,
      amount: topUpAmount,
      type: 'credit',
      description: description || 'Manual Credit Top-Up',
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Successfully credited $${topUpAmount} to wallet`,
      data: {
        wallet: updatedWallet,
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};
