const mongoose = require("mongoose");

const monthlyDuesSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
    },
    deadlines: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    modeOfPayment: {
      type: String,
    },
    amount: {
    type: Number,
    required: true,
    },
    mode: {
    type: String,
    // required: true,
    },
    createdAt: {
      type: Date
    },
    chapter: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Chapter',
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    approvedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Monthly Funds", monthlyDuesSchema);
