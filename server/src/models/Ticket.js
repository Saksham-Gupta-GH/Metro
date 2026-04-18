const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    passenger: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    line: {
      type: String,
      required: true,
      trim: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    stops: {
      type: Number,
      required: true,
      min: 0,
    },
    farePerTicket: {
      type: Number,
      required: true,
      min: 0,
    },
    totalFare: {
      type: Number,
      required: true,
      min: 0,
    },
    discountCode: {
      type: String,
      trim: true,
      default: '',
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    originalFare: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled'],
      default: 'Confirmed',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
