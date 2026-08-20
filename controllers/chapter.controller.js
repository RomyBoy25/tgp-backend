const mongoose = require('mongoose');
const Chapter = require('../model/chapter.model.js')
const Council = require('../model/council.model.js')


const createChapter = async (req, res) => {
  try {
    const { name, council, founderNames, foundDate, status, locationAddress, verifiedBy, displayPic, code, facebookUrl } = req.body;

    // 1️⃣ Check if council exists
    const councilExists = await Council.findById(council);
    if (!councilExists) {
      return res.status(400).json({
        message: "Council not found. Please create a council first.",
      });
    }

    // 2️⃣ Create and save chapter
    const chapter = new Chapter({
      name,
      foundDate,
      status,
      locationAddress,
      founderNames,  // ✅ Add this
      verifiedBy,
      council,
      displayPic,
      code,
      facebookUrl
    });

    await chapter.save();

    return res.status(201).json({
      message: "Chapter created successfully.",
      result: true,
      data: chapter,
    });

  } catch (error) {
    console.error("❌ Error creating chapter:", error);

    // 4️⃣ Always return after sending a response
    return res.status(500).json({
      message: "Error creating chapter",
      error: error.message,
    });
  }
};


const getChapter = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;


    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { locationAddress: { $regex: search, $options: "i" } }
      ];
    }


    if (status) {
      filter.status = status;
    }


    const total = await Chapter.countDocuments(filter);


    const chapters = await Chapter.find(filter)
      .populate('council', 'name')
      .populate('founderNames', '_id firstName lastName')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();


    res.status(200).json({
      message: "Success",
      result: true,
      data: chapters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    });


  } catch(error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteChapter = async (req, res) => {
    try {
        const {id} = req.params;
        const chapter = await Chapter.findByIdAndDelete(id, req.body);
        if(!chapter) {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({message: "User Deleted Successfully"});

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const getChapterById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ result: false, message: 'Invalid chapter ID' });
    }

    // Fetch single user, exclude password, populate council
    const chapter = await Chapter.findById(id, '-password')
      .lean().populate('council', 'name status foundDate founderName')
      .lean().populate('founderNames', '_id firstName lastName suffix alexis')

    if (!chapter) {
      return res.status(404).json({ result: false, message: 'Chapter not found' });
    }

    res.json({
      result: true,
      message: 'Success',
      data: chapter
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: err.message });
  }
};


const updateChapter = async (req, res) => {
    try {
        const {id} = req.params;
        const chapter = await Chapter.findByIdAndUpdate(id, req.body);
        if(!chapter) {
            return res.status(404).json({message: "chapter not found"});
        }
        const updateChapter = await Chapter.findById(id);
        res.status(200).json(updateChapter);

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}


const getChaptersByCouncil = async (req, res) => {
  try {
    const { councilId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(councilId)) {
      return res.status(400).json({
        result: false,
        message: 'Invalid Council ID',
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const filter = {
      council: councilId,
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { locationAddress: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const total = await Chapter.countDocuments(filter);

    const chapters = await Chapter.find(filter)
      .populate('council', 'name')
      .populate('founderNames', '_id firstName lastName suffix alexis')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      result: true,
      message: 'Success',
      data: chapters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      result: false,
      message: error.message,
    });
  }
};

module.exports = {
    createChapter,
    getChapter,
    deleteChapter,
    getChapterById,
    updateChapter,
    getChaptersByCouncil 
}