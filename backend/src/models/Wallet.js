const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  autoTopUp: {
    type: Boolean,
    default: false
  },
  threshold: {
    type: Number,
    default: 10 // Auto top up when balance drops below 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Wallet', WalletSchema);
