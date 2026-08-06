const fs = require("fs");
const User = require("../model/user.model");
const removePassword = require("../utils/removePassw0rd");

const signUpUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      suffix,
      email,
      password,
      alexis,
      contactNumber,
      role,
      chapterStatus,
      membershipOrigin,
      council,
      chapter,
      batch,
      birthday,
      originCouncil,
      originChapter,
      facebookUrl,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
    } = req.body;

    if (!alexis || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Alexis, email, and password are required.",
      });
    }

    const welcomeCertificate = req.files?.welcomeCertificate?.[0]
      ? {
          url: req.files.welcomeCertificate[0].path.replace(/\\/g, "/"),
          contentType: req.files.welcomeCertificate[0].mimetype,
          fileName: req.files.welcomeCertificate[0].originalname,
        }
      : null;

    const displayPic = req.files?.displayPic?.[0]
      ? {
          data: fs
            .readFileSync(req.files.displayPic[0].path)
            .toString("base64"),
          contentType: req.files.displayPic[0].mimetype,
        }
      : null;

    const validId = req.files?.validId?.[0]
    ? {
        data: fs
          .readFileSync(req.files.validId[0].path)
          .toString("base64"),
        contentType: req.files.validId[0].mimetype,
      }
    : null;

    const newUser = new User({
      firstName,
      lastName,
      suffix,
      email,
      password,
      alexis,
      contactNumber,
      role,
      chapterStatus,
      membershipOrigin,
      council,
      chapter,
      batch,
      originCouncil,
      originChapter,
      welcomeCertificate,
      displayPic,
      validId,
      birthday,
      facebookUrl,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactRelation,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: removePassword(newUser),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  signUpUser,
};