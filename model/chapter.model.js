const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  council: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Council",
    required: true,
  },
  logo: {
    data: String,      
    contentType: String
  },
  code: {
    type: String,
    unique: true
  },
  verifiedBy: {
    type: String,
  },
}, {
  timestamps: true 
});

const Chapter = mongoose.model("Chapter", chapterSchema);

module.exports = Chapter;