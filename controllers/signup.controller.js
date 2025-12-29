const User = require('../model/user.model.js')
const mongoose = require('mongoose');

const signUpUser = async (req, res) => {
      try {
            const { alexis, email, password } = req.body;
            
            if (!alexis || !email || !password) {
            return res.status(400).json({ result: false, message: 'All fields are required' });
            }
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ result: false, message: 'Email already exists' });

            if (req.file) {

                const base64Data = req.file.buffer.toString('base64');
                newUserData.displayPic = {
                    data: base64Data,
                    contentType: req.file.mimetype
                };
            }

            const user = await User.create(req.body);
            res.status(201).json({ result: true, message: 'Triskelion created', userId: user._id });
        } catch (err) {
            res.status(500).json({ result: false, message: err.message });
    }
};
const getUserId = async (req, res) => {
      try {
        const { id } = req.params;
    
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ result: false, message: 'Invalid user ID' });
        }
    
        // Fetch single user, exclude password, populate council
        const user = await User.findById(id, '-password')
          .populate('council', 'name status foundDate founderName')
          .populate('chapter', 'name status foundDate founderName')
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
}

const updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, req.body);
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        // if (req.body.displayPic?.data) {
        // updateData.displayPic = {
        //     contentType: req.body.displayPic.contentType,
        //     data: req.body.displayPic.data.replace(/^data:image\/\w+;base64,/, "")
        // };
        // }
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
    signUpUser,
    getUserId,
    updateUser,
    deleteUser
}