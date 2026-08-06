const Fund = require("../model/fund.model");
const FundPayment = require("../model/fundPayment.model");
const User = require("../model/user.model");

const { sendSuccess, sendError } = require("../utils/apiResponse");

const createFund = async (req, res) => {
  try {
    const {
      title,
      amount,
      description,
      deadline,
    } = req.body;

    const chapterId = req.user.chapterId;

    const fund = await Fund.create({
      title,
      amount,
      description,
      deadline,
      chapter: chapterId,
      createdBy: req.user._id,
    });

    // Auto-create payment records for all chapter members
    const members = await User.find({
      chapter: chapterId,
    }).select("_id");

    if (members.length) {
      const payments = members.map((member) => ({
        fund: fund._id,
        member: member._id,
        chapter: chapterId,
        status: "Unpaid",
      }));

      await FundPayment.insertMany(payments);
    }

    return sendSuccess(
      res,
      "Fund created successfully.",
      fund
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to create fund.",
      err.message
    );
  }
};


const getFunds = async (req, res) => {
  try {
    const chapterId = req.user.chapterId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const type = req.query.type || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const filter = {
      chapter: chapterId,
    };

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (type) {
      filter.type = type;
    }

    const total = await Fund.countDocuments(filter);

    const funds = await Fund.find(filter)
      .populate("createdBy", "firstName lastName alexis")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    for (const fund of funds) {
      const totalMembers = await FundPayment.countDocuments({
        fund: fund._id,
      });

      const paidMembers = await FundPayment.countDocuments({
        fund: fund._id,
        status: "Paid",
      });

      fund.totalMembers = totalMembers;
      fund.paidMembers = paidMembers;
      fund.unpaidMembers = totalMembers - paidMembers;

      // NEW
      fund.collectedAmount = paidMembers * fund.amount;
      fund.remainingAmount = (totalMembers - paidMembers) * fund.amount;
      fund.expectedAmount = totalMembers * fund.amount;
    }

    return sendSuccess(
      res,
      "Funds retrieved successfully.",
      funds,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      }
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to retrieve funds.",
      err.message
    );
  }
};

const getFundById = async (req, res) => {
  try {
    const { fundId } = req.params;
    const chapterId = req.user.chapterId;

    const fund = await Fund.findOne({
      _id: fundId,
      chapter: chapterId,
    })
      .populate("createdBy", "firstName lastName alexis")
      .lean();

    if (!fund) {
      return sendError(
        res,
        404,
        "Fund not found."
      );
    }

    let payments = await FundPayment.find({
      fund: fundId,
    })
      .populate(
        "member",
        "firstName lastName alexis displayPic"
      )
      .populate(
        "updatedBy",
        "firstName lastName alexis"
      )
      .sort({
        status: 1,
        "member.firstName": 1,
      })
      .lean();

    // Remove orphaned payment records (deleted members)
    payments = payments.filter((payment) => payment.member);

    return sendSuccess(
      res,
      "Fund retrieved successfully.",
      {
        fund,
        payments,
      }
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to retrieve fund.",
      err.message
    );
  }
};

const deleteFund = async (req, res) => {
  try {
    const { fundId } = req.params;
    const chapterId = req.user.chapterId;

    const fund = await Fund.findOne({
      _id: fundId,
      chapter: chapterId,
    });

    if (!fund) {
      return sendError(res, 404, "Fund not found.");
    }

    // Delete all payment records first
    await FundPayment.deleteMany({
      fund: fundId,
    });

    // Delete fund
    await Fund.deleteOne({
      _id: fundId,
    });

    return sendSuccess(
      res,
      "Fund deleted successfully."
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to delete fund.",
      err.message
    );
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { fundId, paymentId } = req.params;
    const { status } = req.body;
    const chapterId = req.user.chapterId;

    if (!["Paid", "Unpaid"].includes(status)) {
      return sendError(res, 400, "Invalid payment status.");
    }

    const payment = await FundPayment.findOne({
      _id: paymentId,
      fund: fundId,
      chapter: chapterId,
    });

    if (!payment) {
      return sendError(res, 404, "Payment record not found.");
    }

    payment.status = status;
    payment.updatedBy = req.user._id;
    payment.paidAt = status === "Paid" ? new Date() : null;

    await payment.save();

    await payment.populate(
      "updatedBy",
      "firstName lastName alexis"
    );

    return sendSuccess(
      res,
      `Payment marked as ${status}.`,
      payment
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to update payment status.",
      err.message
    );
  }
};

module.exports = {
  createFund,
  getFunds,
  getFundById,
   updatePaymentStatus,
   deleteFund
};