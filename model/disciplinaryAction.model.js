const mongoose = require('mongoose');

const disciplinaryActionSchema = new mongoose.Schema(
  {
    // Member who received the disciplinary action
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // User who issued the disciplinary action
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Number of DA
    count: {
      type: Number,
      required: true,
      min: 1,
    },

    // Reason / violation
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Date when DA was issued
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Current status
    status: {
      type: String,
      enum: ['Pending', 'Received'],
      default: 'Pending',
    },

    // Member whom the DA was reported to
    reportedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Date when the DA was received
    receivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'DisciplinaryAction',
  disciplinaryActionSchema
);