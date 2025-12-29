const mongoose = require('mongoose');
const Payment = require('../model/payment.model.js');
const userModel = require('../model/user.model.js');
const fundsModel = require('../model/funds.model.js');
const Costing = require('../model/cost.model.js');
const Ledger = require('../model/ledger.model.js');


const fs = require("fs");
const path = require("path");

const addCosting = async (req, res) => {
  const chapterId = req.user.chapterId;
  const userId = req.user._id;

  // Multer puts files here
  const images = req.files ? req.files.map(f => f.path) : [];

  if (!images.length) {
    return res.status(400).json({ message: 'No images provided' });
  }

  const { amount, costName, description, displayPic, costBy } = req.body;

  // Parse costBy if sent as JSON string
  const costByArray = typeof costBy === 'string' ? JSON.parse(costBy) : costBy;

  try {
    // 1️⃣ Get total funds from payments
    const payments = await Payment.find({ chapter: chapterId });
    const totalFunds = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // 2️⃣ Get total previous costings
    const costings = await Costing.find({ chapter: chapterId });
    const totalCost = costings.reduce((sum, c) => sum + (c.amount || 0), 0);

    // 3️⃣ Calculate before and after fund
    const beforeFund = totalFunds - totalCost;
    const afterFund = beforeFund - Number(amount);

    // 4️⃣ Create costing record
    const costing = await Costing.create({
      chapter: chapterId,
      userId,
      costName,
      gallery: images,
      amount,
      description,
      displayPic,
      beforeFund,
      afterFund,
      createdBy: userId,
      costBy: costByArray,
    });

    res.status(200).json({ result: true, message: 'Costing recorded successfully', data: costing });
  } catch (error) {
    res.status(500).json({ result: false, message: 'Something went wrong', error: error.message });
  }
};









const getAllCostByChapter = async (req, res) => {
  try {
    const chapterId = req.user.chapterId;

    const cost = await Costing.find({ chapter: chapterId })
    .populate('createdBy', 'firstName lastName suffix displayPic')
    .populate('costBy', 'firstName lastName suffix displayPic')
    .sort({ createdAt: -1 });


    res.status(200).json({ 
        message: "Success", 
        result: true, 
        data: cost,
    });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      result: false,
      error: error.message
    });
  }
};

// const getAllPayment = async (req, res) => {
//   try {
//     const chapterId = req.user.chapterId; // get chapterId from logged-in user
    
//     // Find all payments for this fund and chapter
//     const payments = await Payment.find({chapter: chapterId })
//     .populate('userId', 'alexis firstName lastName suffix displayPic')

//     res.status(200).json({ message: "Success", result: true, data: payments });

//   } catch (error) {
//     res.status(500).json({
//       message: "Something went wrong",
//       result: false,
//       error: error.message
//     });
//   }
// };


module.exports = {
    addCosting,
    getAllCostByChapter
}