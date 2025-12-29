const User = require('../model/user.model.js');
const Funds = require('../model/funds.model.js');
const mongoose = require('mongoose');
const Chapter = require('../model/chapter.model.js');
const paymentModel = require('../model/payment.model.js');

const createMonthlyFunds = async (req, res) => {

  if (!req.user || !req.user._id || !req.user.chapterId) {
    console.log("❌ User information missing or incomplete:", req.user);
    return res.status(400).json({
      message: "User information missing in request.",
      result: false
    });
  }

  try {
    const { month, amount, deadlines, displayPic, description, paymentDetails, approvedBy, modeOfPayment } = req.body;

    const funds = new Funds({
      month,
      amount,
      deadlines,
      displayPic,
      description,
      paymentDetails,
      approvedBy,
      modeOfPayment,
      chapter: req.user.chapterId, 
      createdBy: req.user._id    
    });

    await funds.save();

    const members = await User.find({ chapter: req.user.chapterId });

    const paymentsPayload = members.map(member => ({
      fundId: funds._id,    // correct fund id
      userId: member._id,    // use single member's id
      chapter: req.user.chapterId,
      amount: 0,
      status: "Unpaid"
    }));

    await paymentModel.insertMany(paymentsPayload);

    return res.status(201).json({
      message: "Funds created successfully.",
      result: true,
      data: funds,
    });

  } catch (error) {
    console.error("❌ Error creating Funds:", error);
    return res.status(500).json({
      message: "Error creating Funds",
      error: error.message,
    });
  }
};



const getMonthlyFunds = async (req, res) => {
  const chapterId = req.user.chapterId;
  try {
    const funds = await Funds.find({ chapter: chapterId })
    .populate('approvedBy', 'firstName lastName suffix displayPic')
    .populate('createdBy', 'firstName lastName suffix displayPic')
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      message: "Success",
      result: true,
      data: funds
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      result: false,
      error: error.message
    });
  }
};


const getFund = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ result: false, message: 'Invalid chapter ID' });
    }

    const fund = await Funds.findById(id)
    .populate('approvedBy', 'firstName lastName suffix displayPic role qrCode')
    .populate('createdBy', 'firstName lastName suffix displayPic role')

    if (!fund) {
      return res.status(404).json({ result: false, message: 'fund not found' });
    }

    res.json({
      result: true,
      message: 'Success',
      data: fund
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: err.message });
  }
};


const deleteFunds = async (req, res) => {
    try {
        const {id} = req.params;
        const funds = await Funds.findByIdAndDelete(id, req.body);
        if(!funds) {
            return res.status(404).json({message: "funds not found"});
        }
        await paymentModel.deleteMany({ fundId: id });

        res.status(200).json({message: "funds Deleted Successfully"});

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    createMonthlyFunds,
    getMonthlyFunds,
    deleteFunds,
    getFund
}