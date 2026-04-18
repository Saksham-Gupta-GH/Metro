const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    lines: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Info', 'Warning', 'Critical'],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);
