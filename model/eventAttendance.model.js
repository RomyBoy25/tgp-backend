const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attendanceStatus: {
      type: String,
      enum: ["Pending", "Present", "Absent", "Excused"],
      default: "Pending",
    },

    checkedInAt: Date,

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { event: 1, member: 1 },
  { unique: true }
);

// Para sa mabilis na filtering
attendanceSchema.index({
  event: 1,
  attendanceStatus: 1,
});

module.exports = mongoose.model(
  "EventAttendance",
  attendanceSchema
);