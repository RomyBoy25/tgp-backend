const mongoose = require("mongoose");
const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
      trim: true
    },

    batchPicture: {
      data: Buffer,
      contentType: String,
    },

    triskelionBirth: {
      type: Date,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    council: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Council",
      required: true
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model("Batch", batchSchema);