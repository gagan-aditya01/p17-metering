const mongoose = require('mongoose');

const UsageTierSchema = new mongoose.Schema({
  upTo: {
    type: Number, // null or Infinity for uncapped top tier
    default: null
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  baseFee: {
    type: Number,
    required: [true, 'Base fee is required'],
    min: 0,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  unitName: {
    type: String,
    default: 'tokens',
    trim: true
  },
  usageTiers: [UsageTierSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', PlanSchema);
