const mongoose = require("mongoose");
require("../model/council.model.js");
require("../model/chapter.model.js");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    facebookUrl: {
      type: String,
      trim: true,
    },

    suffix: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    emergencyContactName: {
      type: String,
      trim: true,
    },

    emergencyContactRelation: {
      type: String,
      trim: true,
    },

    emergencyContactNumber: {
      type: String,
      trim: true,
    },

    alexis: {
      type: String,
      trim: true,
    },

    birthday: {
      type: Date,
    },

    // Current Assignment
    council: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Council",
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },

    // Membership Origin
    membershipOrigin: {
      type: String,
      enum: ["Home Chapter", "Welcoming"],
      default: "Home Chapter",
    },

    // Required only if Welcoming
    originCouncil: {
      type: String,
      trim: true,
      default: null,
    },

    originChapter: {
      type: String,
      trim: true,
      default: null,
    },

    welcomeCertificate: {
      url: String,
      contentType: String,
      fileName: String,
    },

    validId: {
      data: String,
      contentType: String,
    },

    displayPic: {
      data: String,
      contentType: String,
    },

    qrCode: {
      data: String,
      contentType: String,
    },

    chapterStatus: {
      type: String,
      enum: [
        "active",
        "inactive",
        "pending",
        "suspended",
        "expelled",
        "voluntary_quit",
      ],
      default: "active",
    },

    role: {
      type: String,
      enum: [
        "Resident",
        "Founder",
        "Adviser",
        "Infocom",
        "Defense",
        "Grand Triskelion",
        "Deputy Grand Triskelion",
        "Master Keeper of Scroll",
        "Master Keeper of Chest",
        "Master Wielder of the Wip",
      ],
      default: "Resident",
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);