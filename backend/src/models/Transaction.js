const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required']
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: [true, 'Transaction type is required']
  },
  description: {
    type: String,
    trim: true
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

module.exports = mongoose.model('Transaction', TransactionSchema);
