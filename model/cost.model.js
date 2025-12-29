const mongoose = require("mongoose");

const CostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  costName: String,
  amount: Number,
  description: String,

  displayPic: {
    data: String,      
    contentType: String
  },
  chapter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chapter', required: true 
  },
  approvedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
  }],
  beforeFund: Number,
  afterFund: Number,
  paidAt: Date,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  costBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
  }],
  gallery: [String],
}, { timestamps: true });

module.exports = mongoose.model('Costs', CostSchema);