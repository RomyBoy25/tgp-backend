const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    eventType: {
      type: String,
      enum: [
        "Meeting",
        "Community Service",
        "Seminar",
        "Celebration",
        "Others",
      ],
      default: "Meeting",
    },

    eventDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      default: "",
    },

    venue: {
      type: String,
      required: true,
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },

    council: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Council",
      required: true,
    },

    attendanceMode: {
      type: String,
      enum: ["none", "automatic", "manual"],
      default: "automatic",
    },

    status: {
      type: String,
      enum:[
        "Upcoming",
        "Ongoing",
        "Completed",
        "Cancelled"
      ],
      default:"Upcoming"
    },
    isClosed: {
    type: Boolean,
    default: false,
    },
    closedAt: Date,
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

eventSchema.index({ chapter: 1 });
eventSchema.index({ eventDate: -1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model("Event", eventSchema);