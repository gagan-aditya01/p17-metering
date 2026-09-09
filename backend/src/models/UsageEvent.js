const mongoose = require('mongoose');

const UsageEventSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    index: true
  },
  units: {
    type: Number,
    required: [true, 'Units consumed is required'],
    min: 0
  },
  calculatedCost: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound Index for High-Performance Analytics & Telemetry Aggregations
UsageEventSchema.index({ customerId: 1, timestamp: -1 });
UsageEventSchema.index({ customerId: 1, eventName: 1 });

module.exports = mongoose.model('UsageEvent', UsageEventSchema);
