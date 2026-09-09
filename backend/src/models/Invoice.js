const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  amount: {
    type: Number,
    required: true
  }
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
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
  lineItems: [LineItemSchema],
  baseFee: {
    type: Number,
    default: 0
  },
  usageFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'paid', 'unpaid', 'void'],
    default: 'unpaid',
    index: true
  },
  billingPeriod: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
