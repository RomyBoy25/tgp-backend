const Batch = require("../model/batch.model");

// CREATE BATCH
const Chapter = require("../model/chapter.model");
const User = require("../model/user.model");

const createBatch = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Check if chapter exists
    const chapter = await Chapter.findById(chapterId);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    // Check duplicate batch name within the chapter
    const exists = await Batch.findOne({
      chapter: chapterId,
      batchName: req.body.batchName.trim(),
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Batch name already exists in this chapter.",
      });
    }

    let batchPicture = null;

    // Convert base64 image to Buffer
    if (req.body.batchPicture) {
      batchPicture = {
        data: Buffer.from(req.body.batchPicture.data, "base64"),
        contentType: req.body.batchPicture.contentType,
      };
    }

    const batch = await Batch.create({
      batchName: req.body.batchName.trim(),
      triskelionBirth: req.body.triskelionBirth,
      description: req.body.description || "",
      chapter: chapter._id,
      council: chapter.council,
      batchPicture,
      createdBy: req.user._id,
    });

    const createdBatch = await Batch.findById(batch._id)
      .populate("chapter", "name")
      .populate("createdBy", "firstName lastName alexis");

    res.status(201).json({
      success: true,
      message: "Batch created successfully.",
      data: createdBatch,
    });

  } catch (err) {
    console.error("CREATE BATCH ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getBatchesByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    // Validate chapter
    const chapter = await Chapter.findById(chapterId);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const query = {
      chapter: chapterId,
    };

    if (search) {
      query.batchName = {
        $regex: search,
        $options: "i",
      };
    }

    const total = await Batch.countDocuments(query);

    const batches = await Batch.find(query)
      .populate("createdBy", "firstName lastName alexis")
      .populate("chapter", "name")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: batches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    });
  } catch (err) {
    console.error("GET BATCHES ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    const duplicate = await Batch.findOne({
      _id: { $ne: batch._id },
      chapter: batch.chapter,
      batchName: req.body.batchName,
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Batch name already exists.",
      });
    }

    const updated = await Batch.findByIdAndUpdate(
      req.params.batchId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("createdBy", "firstName lastName alexis");

    res.json({
      success: true,
      message: "Batch updated successfully.",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteBatch = async (req, res) => {
  try {

    const batch = await Batch.findById(req.params.batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }


    const used = await User.exists({
      batch: batch._id,
    });


    if (used) {
      return res.status(400).json({
        success: false,
        message: "Batch cannot be deleted because it has members.",
      });
    }


    await Batch.findByIdAndDelete(batch._id);


    res.json({
      success: true,
      message: "Batch deleted successfully.",
    });


  } catch(err){

    console.error(err);

    res.status(500).json({
      success:false,
      message:err.message
    });

  }
};

const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId)
      .populate("chapter", "chapterName")
      .populate("council", "councilName")
      .populate("createdBy", "firstName lastName alexis");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found.",
      });
    }

    // Convert Mongoose document to plain object
    const batchObj = batch.toObject();

    // Convert Buffer to Base64
    if (batchObj.batchPicture?.data) {
      batchObj.batchPicture.data =
        batchObj.batchPicture.data.toString("base64");
    }

    res.status(200).json({
      success: true,
      data: batchObj,
    });
  } catch (err) {
    console.error("GET BATCH ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getBatchMembers = async (req, res) => {
  try {
    const { batchId } = req.params;

    const members = await User.find({
      batch: batchId,
    })
      .populate('chapter', 'chapterName')
      .populate('batch', 'batchName')
      .select('-password');

    res.status(200).json({
      result: true,
      data: members,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBatch,
  getBatchesByChapter,
  updateBatch,
  getBatchById,
  deleteBatch,
  getBatchMembers
};