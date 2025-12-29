const User = require('../model/user.model.js');
const Council = require('../model/council.model.js');
const mongoose = require('mongoose');


const getUsers = async (req, res) => {
  try {
    const chapterId = req.user.chapterId;
    const users = await User.find({chapter: chapterId}, '-password').sort({ createdAt: -1 })
    .lean().populate('council', 'name status foundDate founderName')
    .lean().populate('chapter', 'name')
    res.status(200).json({
      message: "Success",
      result: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      result: false,
      error: error.message
    });
  }
};


const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ result: false, message: 'Invalid user ID' });
    }

    // Fetch single user, exclude password, populate council
    const user = await User.findById(id, '-password')
      .populate('council', 'name status foundDate founderName')
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({ result: false, message: 'User not found' });
    }

    res.json({
      result: true,
      message: 'Success',
      data: user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: err.message });
  }
};

// const createUser = async (req, res) => {
//     try {
//         const user = await User.create(req.body);
//         res.status(200).json(user);
//     } catch(error){
//         res.status(500).json({message: error.message})
//     }
// }

const updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, req.body);
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        const updateUser = await User.findById(id);
        res.status(200).json(updateUser);

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}


const deleteUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id, req.body);
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({message: "User Deleted Successfully"});

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    getUsers,
    getUser,
    // createUser,
    updateUser,
    deleteUser

}