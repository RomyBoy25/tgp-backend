const EventExpense = require("../model/eventExpense.model");
const { getOpenEvent } = require("../middleware/eventGuard");

// CREATE EXPENSE
const createExpense = async (req, res) => {
  try {
    const { eventId } = req.params;

    console.log("========== CREATE EXPENSE ==========");
    console.log("Event ID:", eventId);

    const { event, error } = await getOpenEvent(eventId);

    console.log("Event Found:", event);
    console.log("Guard Error:", error);

    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const expense = await EventExpense.create({
      ...req.body,
      event: eventId,
      createdBy: req.user._id,
    });

    const createdExpense = await EventExpense.findById(expense._id)
      .populate("createdBy", "firstName lastName alexis");

    console.log("Expense Created:", createdExpense._id);

    res.status(201).json({
      success: true,
      message: "Expense added successfully.",
      data: createdExpense,
    });

  } catch (err) {
    console.error("CREATE EXPENSE ERROR");
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL EXPENSES
const getExpenses = async (req, res) => {
  try {
    const { eventId } = req.params;

    const expenses = await EventExpense.find({
      event: eventId,
    })
      .populate("createdBy", "firstName lastName alexis")
      .sort({
        createdAt: -1,
      });

    const totalExpense = expenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    res.json({
      success: true,
      data: {
        totalExpense,
        count: expenses.length,
        items: expenses,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    const { eventId, expenseId } = req.params;

    const { event, error } = await getOpenEvent(eventId);

    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const expense = await EventExpense.findOneAndUpdate(
      {
        _id: expenseId,
        event: eventId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("createdBy", "firstName lastName alexis");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    res.json({
      success: true,
      message: "Expense updated successfully.",
      data: expense,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const { eventId, expenseId } = req.params;

    const expense = await EventExpense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

   const { event, error } = await getOpenEvent(eventId);

   if (error) {
      return res.status(error.status).json({
          success:false,
          message:error.message
      });
  }

    await EventExpense.findByIdAndDelete(expenseId);

    res.json({
      success: true,
      message: "Expense deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};