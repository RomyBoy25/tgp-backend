const mongoose = require("mongoose");
const User = require("../model/user.model.js");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const getPublicUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid member ID.");
    }

    const user = await User.findById(id)
      .select(
        "firstName lastName suffix alexis birthday displayPic chapterStatus role batch council chapter"
      )
      .populate("council", "name displayPic")
      .populate("chapter", "name displayPic foundDate")
      .populate("batch")
      .populate("batch", "batchName triskelionBirth")
      .lean();

    if (!user) {
      return sendError(res, 404, "Member not found.");
    }

    return sendSuccess(
      res,
      "Public member profile retrieved successfully.",
      user
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to retrieve public member profile.",
      err.message
    );
  }
};

module.exports = {
  getPublicUser,
};