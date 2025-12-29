const mongoose = require("mongoose");

const LedgerSchema = new mongoose.Schema({
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  amount: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ledger', LedgerSchema);