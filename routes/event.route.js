const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAttendance,
  updateAttendance,
  closeEvent,
  getEventDetails,
  getAllEvents,
  deleteEvent,
} = require("../controllers/event.controller");

const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/eventExpense.controller");

// Events
router.post("/", createEvent);
router.post("/:id/attendance", createEvent);

router.get("/", getAllEvents);
router.get("/:eventId", getEventDetails);
router.delete("/:eventId", deleteEvent);

// Attendance
router.get("/:eventId/attendance", getAttendance);
router.put("/:eventId/attendance/:memberId", updateAttendance);
router.put("/:eventId/close", closeEvent);

// Expenses
router.post("/:eventId/expenses", createExpense);
router.get("/:eventId/expenses", getExpenses);
router.put("/:eventId/expenses/:expenseId", updateExpense);
router.delete("/:eventId/expenses/:expenseId", deleteExpense);

module.exports = router;