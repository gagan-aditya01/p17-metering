const Subscription = require('../models/Subscription');
const UsageEvent = require('../models/UsageEvent');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

exports.getExecutiveAnalytics = async () => {
  // 1. Active Subscriptions & MRR calculation
  const activeSubs = await Subscription.find({ status: 'active' }).populate('planId');
  const mrr = activeSubs.reduce((acc, sub) => acc + (sub.planId?.baseFee || 0), 0);

  // 2. Churn & Total Subscriptions
  const totalSubs = await Subscription.countDocuments();
  const canceledSubs = await Subscription.countDocuments({ status: 'canceled' });
  const pastDueSubs = await Subscription.countDocuments({ status: 'past_due' });
  const churnRate = totalSubs > 0 ? (canceledSubs / totalSubs) * 100 : 0;

  // 3. Usage Volume Telemetry
  const usageAggregation = await UsageEvent.aggregate([
    {
      $group: {
        _id: null,
        totalTokens: { $sum: '$units' },
        totalRatedValue: { $sum: '$calculatedCost' },
        eventCount: { $sum: 1 }
      }
    }
  ]);

  const telemetry = usageAggregation[0] || { totalTokens: 0, totalRatedValue: 0, eventCount: 0 };

  // 4. Invoices Overview
  const totalInvoices = await Invoice.countDocuments();
  const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
  const unpaidInvoices = await Invoice.countDocuments({ status: 'unpaid' });

  const outstandingAggregation = await Invoice.aggregate([
    { $match: { status: 'unpaid' } },
    { $group: { _id: null, totalOutstanding: { $sum: '$totalAmount' } } }
  ]);
  const totalOutstanding = outstandingAggregation[0]?.totalOutstanding || 0;

  // 5. Total Customers
  const totalCustomers = await Customer.countDocuments({ status: 'active' });

  return {
    mrr: Math.round(mrr * 100) / 100,
    churnRate: Math.round(churnRate * 10) / 10,
    activeCustomers: totalCustomers,
    subscriptions: {
      active: activeSubs.length,
      pastDue: pastDueSubs,
      canceled: canceledSubs,
      total: totalSubs
    },
    telemetry: {
      totalTokens: telemetry.totalTokens,
      totalRatedValue: Math.round(telemetry.totalRatedValue * 1000) / 1000,
      totalEvents: telemetry.eventCount
    },
    invoicing: {
      total: totalInvoices,
      paid: paidInvoices,
      unpaid: unpaidInvoices,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100
    }
  };
};
