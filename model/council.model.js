const mongoose = require("mongoose");

const councilSchema = new mongoose.Schema({
  name: {
    type: String,
  },
 foundDate: {
    type: Date,
  },
  status: {
    type: String,
  },
  locationAddress: {
    type: String,
  },
  founderNames: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  ],
  displayPic: {
    data: String,      
    contentType: String
  },
  verifiedBy: {
    type: String,
  },
}, {
  timestamps: true 
});

const Council = mongoose.model("Council", councilSchema);

module.exports = Council;