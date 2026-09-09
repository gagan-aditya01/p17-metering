const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const UsageEvent = require('../models/UsageEvent');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

exports.generateInvoicesForPeriod = async () => {
  const activeSubscriptions = await Subscription.find({ status: { $in: ['active', 'past_due'] } })
    .populate('customerId')
    .populate('planId');

  const generatedInvoices = [];

  for (const sub of activeSubscriptions) {
    if (!sub.customerId || !sub.planId) continue;

    const periodStart = sub.currentPeriodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const periodEnd = sub.currentPeriodEnd || new Date();

    // Aggregate usage events for this period
    const usageLogs = await UsageEvent.find({
      customerId: sub.customerId._id,
      timestamp: { $gte: periodStart, $lte: periodEnd }
    });

    const totalUsageFee = usageLogs.reduce((acc, log) => acc + (log.calculatedCost || 0), 0);
    const totalUnits = usageLogs.reduce((acc, log) => acc + (log.units || 0), 0);

    const baseFee = sub.planId.baseFee || 0;
    const totalAmount = Math.round((baseFee + totalUsageFee) * 100) / 100;

    const lineItems = [
      {
        description: `Base Subscription Fee (${sub.planId.name})`,
        quantity: 1,
        amount: baseFee
      }
    ];

    if (totalUnits > 0) {
      lineItems.push({
        description: `Metered Usage Charges (${totalUnits.toLocaleString()} ${sub.planId.unitName || 'units'})`,
        quantity: totalUnits,
        amount: Math.round(totalUsageFee * 100) / 100
      });
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // Auto-pay if customer has sufficient wallet balance
    let status = 'unpaid';
    let paidAt = null;

    const wallet = await Wallet.findOne({ customerId: sub.customerId._id });
    if (wallet && wallet.balance >= totalAmount && totalAmount > 0) {
      // Settle invoice using wallet balance
      await Wallet.findOneAndUpdate(
        { customerId: sub.customerId._id },
        { $inc: { balance: -totalAmount } }
      );
      await Transaction.create({
        customerId: sub.customerId._id,
        amount: totalAmount,
        type: 'debit',
        description: `Automatic Settlement for Invoice ${invoiceNumber}`,
        metadata: { invoiceNumber }
      });
      status = 'paid';
      paidAt = new Date();
    } else if (totalAmount === 0) {
      status = 'paid';
      paidAt = new Date();
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      customerId: sub.customerId._id,
      subscriptionId: sub._id,
      lineItems,
      baseFee,
      usageFee: Math.round(totalUsageFee * 100) / 100,
      totalAmount,
      status,
      billingPeriod: { start: periodStart, end: periodEnd },
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      paidAt
    });

    generatedInvoices.push(invoice);
  }

  return generatedInvoices;
};
