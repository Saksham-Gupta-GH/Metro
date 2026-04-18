const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    adminRequestStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    photoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    paymentMethods: [
      {
        label: {
          type: String,
          trim: true,
          required: true,
        },
        value: {
          type: String,
          trim: true,
          required: true,
        },
        type: {
          type: String,
          trim: true,
          default: 'UPI',
        },
      },
    ],
    notificationsLastReadAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
