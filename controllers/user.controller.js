const User = require('../model/user.model.js');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require("../utils/apiResponse");
const removePassword = require("../utils/removePassw0rd");
const { resizeBase64Image } = require("../utils/imageResize.js");


const getUsers = async (req, res) => {
  try {
    const chapterId = req.user.chapterId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const filter = {
      chapter: chapterId,
    };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { alexis: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.chapterStatus = status;
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .populate("council", "name status foundDate founderName")
      .populate("chapter", "name")
      .populate("batch", "batchName")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return sendSuccess(
      res,
      "Users retrieved successfully.",
      users,
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
      "Failed to retrieve users.",
      err.message
    );

  }
};


const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user ID.");
    }

    const user = await User.findById(id)
      .select("-password")
      .populate("council", "name status foundDate founderName")
      .populate("chapter", "name")
      .populate("batch", "batchName triskelionBirth")
      .lean();

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    return sendSuccess(res, "User retrieved successfully.", user);
  } catch (err) {
    return sendError(res, 500, "Failed to retrieve user.", err.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user ID.");
    }

    const {
      firstName,
      lastName,
      email,
      contactNumber,
      birthday,
      displayPic,
      alexis,
      suffix,
      validId,
      facebookUrl,
      chapterStatus,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation
    } = req.body;

    if (validId?.data) {
      validId.data = await resizeBase64Image(
        validId.data,
        1000,
        75
      );
    }

    if (displayPic?.data) {
      displayPic.data = await resizeBase64Image(
        displayPic.data,
        400,
        80
      );
    }

    const user = await User.findByIdAndUpdate(
    id,
    {
      firstName,
      lastName,
      email,
      contactNumber,
      birthday,
      displayPic,
      validId,
      alexis,
      suffix,
      chapterStatus,
      facebookUrl,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation
    },
    {
      new: true,
      runValidators: true,
    }
  )
  .populate("council")
  .populate("chapter");

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    return sendSuccess(
      res,
      "Profile updated successfully.",
      removePassword(user)
    );

  } catch (err) {

    return sendError(
      res,
      500,
      "Failed to update profile.",
      err.message
    );

  }
};

const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user ID.");
    }

    const loggedInUserId = req.user._id.toString();
    const isOwnAccount = loggedInUserId === id;

    const {
      council,
      chapter,
      role,
      chapterStatus,
      chapterRoot,
      batch
    } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    // Save previous organization
    const oldCouncil = user.council?.toString();
    const oldChapter = user.chapter?.toString();

    // Update organization
    user.council = council;
    user.chapter = chapter;
    user.role = role;
    user.chapterStatus = chapterStatus;
    user.chapterRoot = chapterRoot;
    user.batch = batch;

    await user.save();

    await user.populate("council");
    await user.populate("chapter");

    const organizationChanged =
      oldCouncil !== user.council?._id?.toString() ||
      oldChapter !== user.chapter?._id?.toString();

    return res.status(200).json({
      success: true,
      message: "Organization updated successfully.",
      requireRelogin: isOwnAccount && organizationChanged,
      data: removePassword(user),
    });

  } catch (err) {

    return sendError(
      res,
      500,
      "Failed to update organization.",
      err.message
    );

  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user ID.");
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, "User not found.");
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return sendError(
        res,
        400,
        "Current password is incorrect."
      );
    }

    user.password = newPassword;

    await user.save();

    return sendSuccess(
      res,
      "Password updated successfully."
    );

  } catch (err) {

    return sendError(
      res,
      500,
      "Failed to update password.",
      err.message
    );

  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, "Invalid user ID.");
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return sendError(
        res,
        404,
        "User not found."
      );
    }

    return sendSuccess(
      res,
      "User deleted successfully."
    );

  } catch (err) {

    return sendError(
      res,
      500,
      "Failed to delete user.",
      err.message
    );

  }
};

module.exports = {
    getUsers,
    getUser,
    // createUser,
    deleteUser,
    updateProfile,
    updateOrganization,
    updatePassword
}