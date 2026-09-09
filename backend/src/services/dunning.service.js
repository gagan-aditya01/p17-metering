const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');

exports.runDunningEvaluation = async () => {
  const now = new Date();

  // Find overdue unpaid invoices
  const overdueInvoices = await Invoice.find({
    status: 'unpaid',
    dueDate: { $lt: now }
  }).populate('subscriptionId');

  const dunningResults = [];

  for (const inv of overdueInvoices) {
    if (!inv.subscriptionId) continue;

    const sub = await Subscription.findById(inv.subscriptionId);
    if (!sub) continue;

    sub.retryCount = (sub.retryCount || 0) + 1;
    sub.lastRetryAt = now;

    if (sub.retryCount === 1) {
      sub.dunningStatus = 'warning';
      sub.status = 'past_due';
    } else if (sub.retryCount === 2) {
      sub.dunningStatus = 'final_notice';
      sub.status = 'past_due';
    } else if (sub.retryCount >= 3) {
      sub.dunningStatus = 'terminated';
      sub.status = 'canceled';
    }

    await sub.save();
    dunningResults.push({
      invoiceId: inv._id,
      invoiceNumber: inv.invoiceNumber,
      newDunningStatus: sub.dunningStatus,
      newSubStatus: sub.status
    });
  }

  return dunningResults;
};
