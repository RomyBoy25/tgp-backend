const Pledge = require("../model/pledge.model");
const User = require("../model/user.model");
const PledgeContribution = require("../model/pledgeContribution.model");

const { sendSuccess, sendError } = require("../utils/apiResponse");

const createPledge = async (req, res) => {
  try {
    const {
      title,
      description,
      deadline,
    } = req.body;

    const chapterId = req.user.chapterId;

    const pledge = await Pledge.create({
      title,
      description,
      deadline,
      chapter: chapterId,
      createdBy: req.user._id,
    });

    return sendSuccess(
      res,
      "Pledge created successfully.",
      pledge
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to create pledge.",
      err.message
    );
  }
};

const updatePledge = async (req, res) => {
  try {
    const { pledgeId } = req.params;
    const {
      title,
      description,
      deadline,
    } = req.body;

    const pledge = await Pledge.findById(pledgeId);

    if (!pledge) {
      return sendError(
        res,
        404,
        "Pledge not found."
      );
    }

    // Optional: make sure the pledge belongs to the
    // current user's chapter
    if (
      pledge.chapter &&
      pledge.chapter.toString() !== req.user.chapterId.toString()
    ) {
      return sendError(
        res,
        403,
        "You are not authorized to update this pledge."
      );
    }

    pledge.title = title;
    pledge.description = description;
    pledge.deadline = deadline;

    const updatedPledge = await pledge.save();

    return sendSuccess(
      res,
      "Pledge updated successfully.",
      updatedPledge
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to update pledge.",
      err.message
    );
  }
};

const getPledges = async (req, res) => {
  try {
    const chapterId = req.user.chapterId;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const filter = {
      chapter: chapterId,
    };

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    const total = await Pledge.countDocuments(filter);

    const pledges = await Pledge.find(filter)
      .populate(
        "createdBy",
        "firstName lastName alexis"
      )
      .sort({
        [sortBy]: sortOrder,
      })
      .skip(skip)
      .limit(limit)
      .lean();

    for (const pledge of pledges) {
      const contributions = await PledgeContribution.find({
        pledge: pledge._id,
      }).select("amount");

      pledge.totalContributors = contributions.length;

      pledge.totalCollected = contributions.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      // Optional dashboard values
      pledge.expectedAmount = pledge.totalCollected;
      pledge.remainingAmount = 0;
    }

    return sendSuccess(
      res,
      "Pledges retrieved successfully.",
      pledges,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext:
          page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      }
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to retrieve pledges.",
      err.message
    );
  }
};

const getPledgeById = async (req, res) => {
  try {
    const { pledgeId } = req.params;
    const chapterId = req.user.chapterId;

    const pledge = await Pledge.findOne({
      _id: pledgeId,
      chapter: chapterId,
    })
      .populate(
        "createdBy",
        "firstName lastName alexis"
      )
      .lean();

    if (!pledge) {
      return sendError(
        res,
        404,
        "Pledge not found."
      );
    }

    const contributions =
      await PledgeContribution.find({
        pledge: pledgeId,
      })
        .populate(
          "member",
          "firstName lastName alexis displayPic"
        )
        .populate(
          "createdBy",
          "firstName lastName alexis"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    const totalCollected =
      contributions.reduce(
        (sum, item) => sum + item.amount,
        0
      );

    return sendSuccess(
      res,
      "Pledge retrieved successfully.",
      {
        pledge,
        contributions,
        totalCollected,
        totalContributors:
          contributions.length,
      }
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to retrieve pledge.",
      err.message
    );
  }
};

const searchMembers = async (req, res) => {
  try {

    const chapterId = req.user.chapterId;

    const search = req.query.search || "";


    const members = await User.find({
      chapter: chapterId,
      $or:[
        {
          firstName:{
            $regex:search,
            $options:"i"
          }
        },
        {
          lastName:{
            $regex:search,
            $options:"i"
          }
        },
        {
          alexis:{
            $regex:search,
            $options:"i"
          }
        }
      ]
    })
    .select(
      "firstName lastName alexis displayPic"
    )
    .limit(10)
    .lean();



    return sendSuccess(
      res,
      "Members retrieved successfully.",
      members
    );


  } catch(err){

    return sendError(
      res,
      500,
      "Failed to search members.",
      err.message
    );

  }
};


const createContribution = async (req, res) => {
  try {
    const { pledgeId } = req.params;
    const { memberId, amount, description } = req.body;

    const chapterId = req.user.chapterId;

    if (!memberId) {
      return sendError(res, 400, "Member is required.");
    }

    if (!amount || Number(amount) <= 0) {
      return sendError(res, 400, "Amount must be greater than zero.");
    }

    const pledge = await Pledge.findOne({
      _id: pledgeId,
      chapter: chapterId,
    });

    if (!pledge) {
      return sendError(res, 404, "Pledge not found.");
    }

    const member = await User.findOne({
      _id: memberId,
      chapter: chapterId,
    });

    if (!member) {
      return sendError(res, 404, "Member not found.");
    }

    const contribution = await PledgeContribution.create({
      pledge: pledgeId,
      member: memberId,
      amount,
      description,
      chapter: chapterId,
      createdBy: req.user._id,
    });

    await contribution.populate(
      "member",
      "firstName lastName alexis displayPic"
    );

    await contribution.populate(
      "createdBy",
      "firstName lastName alexis"
    );

    return sendSuccess(
      res,
      "Contribution added successfully.",
      contribution
    );
  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to add contribution.",
      err.message
    );
  }
};

const addContribution = async (req, res) => {
  try {
    const { member, amount, description } = req.body;

    const { pledgeId } = req.params;

    const chapterId = req.user.chapterId;


    const contribution = await PledgeContribution.create({
      pledge: pledgeId,
      member,
      amount,
      description,
      chapter: chapterId,
      createdBy: req.user._id,
    });


    await contribution.populate(
      "member",
      "firstName lastName alexis displayPic"
    );


    return sendSuccess(
      res,
      "Contribution added successfully.",
      contribution
    );

  } catch (err) {

    return sendError(
      res,
      500,
      "Failed to add contribution.",
      err.message
    );

  }
  const deletePledge = async (req, res) => {
    try {
      const { pledgeId } = req.params;
      const chapterId = req.user.chapterId;

      const pledge = await Pledge.findOne({
        _id: pledgeId,
        chapter: chapterId,
      });

      if (!pledge) {
        return sendError(
          res,
          404,
          "Pledge not found."
        );
      }

      // Delete all contributions
      await PledgeContribution.deleteMany({
        pledge: pledgeId,
      });

      // Delete pledge
      await Pledge.findByIdAndDelete(pledgeId);

      return sendSuccess(
        res,
        "Pledge deleted successfully.",
        null
      );

    } catch (err) {
      return sendError(
        res,
        500,
        "Failed to delete pledge.",
        err.message
      );
    }
  };
};

const deletePledge = async (req, res) => {
  try {
    const { pledgeId } = req.params;
    const chapterId = req.user.chapterId;

    const pledge = await Pledge.findOne({
      _id: pledgeId,
      chapter: chapterId,
    });

    if (!pledge) {
      return sendError(
        res,
        404,
        "Pledge not found."
      );
    }

    // Delete all contributions
    await PledgeContribution.deleteMany({
      pledge: pledgeId,
    });

    // Delete pledge
    await Pledge.findByIdAndDelete(pledgeId);

    return sendSuccess(
      res,
      "Pledge deleted successfully.",
      null
    );

  } catch (err) {
    return sendError(
      res,
      500,
      "Failed to delete pledge.",
      err.message
    );
  }
};

const deleteContribution = async (req, res) => {
  try {
    const { contributionId } = req.params;

    const contribution = await PledgeContribution.findById(
      contributionId,
    );

    if (!contribution) {
      return sendError(
        res,
        404,
        'Contribution not found.',
      );
    }

    await PledgeContribution.findByIdAndDelete(
      contributionId,
    );

    return sendSuccess(
      res,
      'Contribution deleted successfully.',
      contribution,
    );
  } catch (err) {
    return sendError(
      res,
      500,
      'Failed to delete contribution.',
      err.message,
    );
  }
};

module.exports = {
  createPledge,
  getPledges,
  getPledgeById,
  searchMembers,
  createContribution,
  addContribution,
  deletePledge,
  updatePledge,
  deleteContribution
};