const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const { signUpUser, getUserId, updateUser, deleteUser } = require('../controllers/signup.controller');
const router = express.Router();

// Signup
router.post('/signup', signUpUser);
router.get('/signup/:id', getUserId);
router.put('/signup/:id', updateUser);
router.delete('/signup/:id', deleteUser);


router.get('/me/:id', async (req, res) => {
  try {

    const user = await User.findById(req.params.id).select('-password')
    .populate('chapter')
    .populate('council')
    
    if (!user) {
      return res.status(404).json({ result: false, message: 'User not found' });
    }

    const userWithoutPassword = {
      _id: user._id,
      alexis: user.alexis,
      email: user.email,
      chapterRoot: user.chapterRoot,
      chapter: user.chapter,
      council: user.council,
      firstName: user.firstName,
      lastName: user.lastName,
      displayPic: user.displayPic,
      suffix: user.suffix,
      role: user.role,
    };

    return res.status(200).json({
      result: true,
      message: 'User fetched successfully',
      data: userWithoutPassword,
    });

  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ result: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).populate('chapter')  ;
    if (!user) return res.status(400).json({ result: false, message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ result: false, message: 'Invalid password' });

      const payload = {
      _id: user._id,            
      email: user.email,
      chapterId: user.chapter?._id
    };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      const userWithoutPassword = {
        _id: user._id,
        alexis: user.alexis,
        email: user.email,
        chapterRoot: user.chapterRoot,
        chapterId: user.chapter?._id,
        createdBy: user._id,    
        firstName: user.firstName,
        lastName: user.lastName,
        displayPic: user.displayPic,
        suffix: user.suffix,
        role: user.role,
      };

      res.status(200).json({
        result: true,
        message: 'Login successful',
        token,
        user: userWithoutPassword,
      });

  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

module.exports = router;
