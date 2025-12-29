const mongoose = require("mongoose");
require('../model/council.model.js')
require('../model/chapter.model.js')
const bcrypt = require("bcrypt"); 

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  suffix: { type: String },
  address: { type: String },
  contactNumber: { type: Number },
  alexis: { type: String },
  dateInitiated: { type: Date },
  ChapterRoot: { type: String },
  displayPic: {
    data: String,      
    contentType: String
  },
  qrCode: {
    data: String,      
    contentType: String
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  council: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Council'
  },
  chapterStatus: { type: String, enum: ["active", "inactive", "pending"], default: "active" },
  role: {
    type: String,
    enum: ["Resident","Grand Triskelion", "Deputy Grand Triskelion", "Master Keeper of Scroll", "Master Keeper of Chest", "Master Wielder of the Wip"],
    default: "Resident",
  },
}, {
  timestamps: true
});


userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);