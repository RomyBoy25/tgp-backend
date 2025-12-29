const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  fundId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fund', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  amount: Number,
  displayPic: {
    data: String,      
    contentType: String
  },
  chapter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chapter', required: true 
  },
  status: { 
    type: String, 
    enum: ['Unpaid', 'Paid', 'Verified / Approved', 'Rejected', 'Overdue', 'Rejected'], 
    default: 'Unpaid' 
  },
  approvedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
  }],
  paidAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);