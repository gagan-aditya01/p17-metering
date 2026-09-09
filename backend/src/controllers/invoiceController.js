const Invoice = require('../models/Invoice');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { generateInvoicesForPeriod } = require('../services/invoice.service');
const { runDunningEvaluation } = require('../services/dunning.service');

// @desc    Get Invoices
// @route   GET /api/v1/invoices
exports.getInvoices = async (req, res, next) => {
  try {
    const user = req.user;
    let query = {};

    if (user.role === 'customer') {
      if (!user.customerId) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      query.customerId = user.customerId;
    } else if (req.query.customerId) {
      query.customerId = req.query.customerId;
    }

    const invoices = await Invoice.find(query)
      .populate('customerId', 'name email')
      .populate('subscriptionId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay / Settle an Invoice
// @route   POST /api/v1/invoices/:id/pay
exports.payInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found', errorCode: 'NOT_FOUND' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already paid', errorCode: 'ALREADY_PAID' });
    }

    // Debit customer wallet if available or process payment
    let wallet = await Wallet.findOne({ customerId: invoice.customerId });
    if (wallet && wallet.balance >= invoice.totalAmount) {
      await Wallet.findOneAndUpdate(
        { customerId: invoice.customerId },
        { $inc: { balance: -invoice.totalAmount } }
      );
      await Transaction.create({
        customerId: invoice.customerId,
        amount: invoice.totalAmount,
        type: 'debit',
        description: `Manual Settlement for Invoice ${invoice.invoiceNumber}`,
        metadata: { invoiceNumber: invoice.invoiceNumber }
      });
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();

    res.status(200).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} paid successfully`,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger Batch Invoice Generation (Admin only)
// @route   POST /api/v1/invoices/generate
exports.generateInvoices = async (req, res, next) => {
  try {
    const invoices = await generateInvoicesForPeriod();
    await runDunningEvaluation(); // Run dunning evaluation after generating invoices

    res.status(201).json({
      success: true,
      message: `Generated ${invoices.length} invoices for current period`,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};
