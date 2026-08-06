const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const { signUpUser } = require('../controllers/signup.controller');
const upload = require('../middleware/upload');

const router = express.Router();

// Signup
router.post(
  '/signup',
  upload.fields([
    {
      name: 'displayPic',
      maxCount: 1
    },
    {
      name: 'welcomeCertificate',
      maxCount: 1
    },
    {
      name: 'validId',
      maxCount: 1
    }
  ]),
  signUpUser 
);

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
    

    const user = await User.findOne({ email }).populate({
      path: 'chapter',
      populate: {
        path: 'council'
      }
    });
    
    if (!user) return res.status(400).json({ result: false, message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ result: false, message: 'Invalid password' });

      const payload = {
        _id: user._id,
        email: user.email,
        chapterId: user.chapter?._id,
        councilId: user.chapter?.council?._id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      const userWithoutPassword = {
        _id: user._id,
        alexis: user.alexis,
        email: user.email,
        chapterRoot: user.chapterRoot,
        createdBy: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        displayPic: user.displayPic,
        suffix: user.suffix,
        role: user.role,

        chapter: user.chapter
          ? {
              _id: user.chapter._id,
              chapterName: user.chapter.name,
            }
          : null,

        council: user.chapter?.council
          ? {
              _id: user.chapter.council._id,
              councilName: user.chapter.council.name,
            }
          : null,
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
