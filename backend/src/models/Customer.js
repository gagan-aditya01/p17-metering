const mongoose = require('mongoose');
const crypto = require('crypto');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  apiKey: {
    type: String,
    unique: true,
    index: true
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Auto-generate secure unique API Key before saving if not present
CustomerSchema.pre('save', function (next) {
  if (!this.apiKey) {
    this.apiKey = 'p17_live_' + crypto.randomBytes(18).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Customer', CustomerSchema);
