const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
    index: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan ID is required']
  },
  status: {
    type: String,
    enum: ['active', 'past_due', 'canceled'],
    default: 'active',
    index: true
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  retryCount: {
    type: Number,
    default: 0
  },
  lastRetryAt: {
    type: Date,
    default: null
  },
  dunningStatus: {
    type: String,
    enum: ['none', 'warning', 'final_notice', 'terminated'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Compound Index for entitlement & status checks
SubscriptionSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
