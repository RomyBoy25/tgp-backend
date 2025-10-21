const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  alexis: {
    type: String, 
  },
  birthday: {
    type: Date,
  },
  chapterRoot: {
    type: String,
  },
  chapterStatus: {
    type: String,
    enum: ["active", "inactive", "pending"], 
    default: "active",
  },
}, {
  timestamps: true 
});

const User = mongoose.model("User", userSchema);

module.exports = User;