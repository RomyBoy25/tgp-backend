const mongoose = require('mongoose');
const Chapter = require('../model/chapter.model.js')
const Council = require('../model/council.model.js')

const createChapter = async (req, res) => {
  try {
    const { name, council, founderNames, foundDate, status, locationAddress, verifiedBy, displayPic, code } = req.body;

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
    const chapter = await Chapter.find({}, '-password').sort({ createdAt: -1 }).lean()
    .lean().populate('council', 'name status foundDate founderName')
    .lean().populate('founderNames', '_id firstName lastName suffix alexis')

    res.status(200).json({
      message: "Success",
      result: true,
      data: chapter
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      result: false,
      error: error.message
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


// const getUser = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const user = await User.findById(id)
//         res.status(200).json(user);
//     } catch (error) {
//         res.status(500).json({message: error.message})
//     }
// }

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

// const deleteUser = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const user = await User.findByIdAndDelete(id, req.body);
//         if(!user) {
//             return res.status(404).json({message: "User not found"});
//         }
//         res.status(200).json({message: "User Deleted Successfully"});

//     } catch (error) {
//         res.status(500).json({message: error.message})
//     }
// }

module.exports = {
    createChapter,
    getChapter,
    deleteChapter,
    getChapterById,
    updateChapter

}