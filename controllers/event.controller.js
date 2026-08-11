const Event = require('../model/event.model.js');
const EventAttendance = require("../model/eventAttendance.model.js");
const User = require("../model/user.model.js");
const EventExpense = require("../model/eventExpense.model.js");
const { getOpenEvent } = require("../middleware/eventGuard.js");


const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      council: req.user.councilId,
      chapter: req.user.chapterId,
      createdBy: req.user._id,
    });

    if (event.attendanceMode === "automatic") {
      const members = await User.find({
        chapter: req.user.chapterId,
      }).select("_id");

      if (members.length > 0) {
        await EventAttendance.insertMany(
          members.map((member) => ({
            event: event._id,
            chapter: req.user.chapterId,
            member: member._id,
          }))
        );
      }
    }

    const createdEvent = await Event.findById(event._id)
      .populate("chapter", "chapterName")
      .populate("council", "councilName")
      .populate("createdBy", "firstName lastName alexis");

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: createdEvent,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // Delete attendance records
    await EventAttendance.deleteMany({
      event: eventId,
    });

    // Delete expense records
    await EventExpense.deleteMany({
      event: eventId,
    });

    // if (event.isClosed) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Closed events cannot be deleted.",
    //   });
    // }

    // Delete event
    await Event.findByIdAndDelete(eventId);

    res.json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAttendance = async (req, res) => {

    try {

        const { eventId } = req.params;

        const attendance = await EventAttendance.find({
            event: eventId,
        })
        .populate("member", "firstName lastName displayPic alexis")

        res.json({
            success: true,
            data: attendance,
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message,
        });

    }

};


const updateAttendance = async (req, res) => {

    try {

        const { eventId, memberId } = req.params;

        const { attendanceStatus, remarks } = req.body;

        const { event, error } = await getOpenEvent(eventId);

        console.log("Event:", event);
console.log("Error:", error);

        if (error) {
          return res.status(error.status).json({
            success: false,
            message: error.message,
          });
        }

        const attendance = await EventAttendance.findOneAndUpdate(
          {
            event: eventId,
            member: memberId,
          },
          {
            attendanceStatus,
            remarks,
            checkedInAt: attendanceStatus === "Present" ? new Date() : null,
          },
          {
            new: true,
          }
        );

        if (!attendance) {

            return res.status(404).json({
                success: false,
                message: "Attendance not found",
            });

        }

        res.json({

            success: true,
            message: "Attendance updated.",

            data: attendance,

        });

    } catch (err) {

        res.status(500).json({

            success: false,
            message: err.message,

        });

    }

};

const closeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Hanapin ang event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // Check kung closed na
    if (event.attendanceClosed) {
      return res.status(400).json({
        success: false,
        message: "Attendance is already closed.",
      });
    }

    // Lahat ng Pending magiging Absent
    await EventAttendance.updateMany(
      {
        event: eventId,
        attendanceStatus: "Pending",
      },
      {
        attendanceStatus: "Absent",
      }
    );

    event.isClosed = true;
    event.status = "Completed";
    event.closedAt = new Date();
    event.closedBy = req.user._id;

    await event.save();

    console.log("===== EVENT CLOSED =====");
console.log(event);
console.log("isClosed:", event.isClosed);

    res.json({
      success: true,
      message: "Attendance closed successfully.",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

const getEventDetails = async (req, res) => {
  try {

    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate("chapter", "chapterName")
      .populate("council", "councilName")
      .populate("createdBy", "firstName lastName alexis");


    if (!event) {
      return res.status(404).json({
        success:false,
        message:"Event not found"
      });
    }


    // Attendance Summary
    const attendance = await EventAttendance.find({
      event: eventId,
    });


    const attendanceSummary = {
      total: attendance.length,

      present: attendance.filter(
        (item) => item.attendanceStatus === "Present"
      ).length,

      absent: attendance.filter(
        (item) => item.attendanceStatus === "Absent"
      ).length,

      pending: attendance.filter(
        (item) => item.attendanceStatus === "Pending"
      ).length,

      excused: attendance.filter(
        (item) => item.attendanceStatus === "Excused"
      ).length,
    };


    // Expense Summary
    const expenses = await EventExpense.find({
      event: eventId
    })
    .populate("createdBy", "firstName lastName")
    .sort({
      createdAt: -1
    });


    const totalExpense = expenses.reduce(
      (total,item)=> total + item.amount,
      0
    );


    res.json({

      success:true,

      data:{
        event,

        attendanceSummary,

        expenseSummary:{
          totalExpense,
          count: expenses.length,
          items: expenses
        }
      }

    });


  } catch(err){

    res.status(500).json({
      success:false,
      message:err.message
    });

  }
};


const updateEventDetails = async (req, res) => {
  try {
    const { eventId } = req.params;

    const {
      title,
      description,
      eventType,
      eventDate,
      startTime,
      endTime,
      venue,
      attendanceMode,
    } = req.body;

    // Find event first
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // Update only editable event fields
    event.title = title;
    event.description = description;
    event.eventType = eventType;
    event.eventDate = eventDate;
    event.startTime = startTime;
    event.endTime = endTime;
    event.venue = venue;
    event.attendanceMode = attendanceMode;

    await event.save();

    // Return updated event with populated information
    const updatedEvent = await Event.findById(eventId)
      .populate("chapter", "chapterName")
      .populate("council", "councilName")
      .populate("createdBy", "firstName lastName alexis");

    res.json({
      success: true,
      message: "Event updated successfully.",
      data: updatedEvent,
    });
  } catch (err) {
    console.error("UPDATE EVENT DETAILS ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



const getAllEvents = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const sortBy = req.query.sortBy || "eventDate";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const filter = {};

    // Search
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          venue: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Status Filter
    if (status) {
      filter.status = status;
    }

    const total = await Event.countDocuments(filter);

    const events = await Event.find(filter)
      .populate("chapter", "chapterName")
      .populate("council", "councilName")
      .populate("createdBy", "firstName lastName")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Compute total expense per event
    for (const event of events) {
      const expenses = await EventExpense.find({
        event: event._id,
      }).select("amount");

      event.totalExpense = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
    }

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


module.exports = {
  createEvent,
  getAttendance,
  updateAttendance,
  closeEvent,
  getEventDetails,
  getAllEvents,
  deleteEvent,
  updateEventDetails
};