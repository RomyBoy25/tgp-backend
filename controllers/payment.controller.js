const mongoose = require('mongoose');
const Payment = require('../model/payment.model.js');
const userModel = require('../model/user.model.js');
const fundsModel = require('../model/funds.model.js');
const ledgerModel = require('../model/ledger.model.js');
const paymentModel = require('../model/payment.model.js');


const makePayment = async (req, res) => {
    const chapterId = req.user.chapterId;
    const userId = req.user._id;
    const { fundId, amount, displayPic, status } = req.body;

    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { fundId, userId, chapter: chapterId },

            {
                $inc: { amount: amount }, // Add payment
                $set: {
                    status: status || 'Paid',
                    displayPic: displayPic || null,
                    paidAt: new Date()
                }
            },

            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true // IMPORTANT when using upsert
            }
        );

        await ledgerModel.create({
            chapter: chapterId,
            type: "CREDIT",
            referenceId: paymentModel._id,
            amount,
            description: "Monthly Fund"
        });

        return res.status(200).json({
            result: true,
            message: 'Payment recorded/updated successfully',
            data: updatedPayment
        });

    } catch (error) {
        console.error("❌ Error updating Payment:", error);
        return res.status(500).json({
            message: "Error updating Payment",
            error: error.message,
        });
    }
};




const getAllPaymentByFundId = async (req, res) => {
  try {
    const { id } = req.params; // this is the fundId
    const chapterId = req.user.chapterId; // get chapterId from logged-in user

    const fund = await fundsModel.findById(id)
    .populate('approvedBy', 'firstName lastName suffix displayPic role qrCode')
    // Find all payments for this fund and chapter
    const payments = await Payment.find({ fundId: id, chapter: chapterId })
    .populate('userId', 'alexis firstName lastName suffix displayPic')

    res.status(200).json({ message: "Success", result: true, data: payments });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      result: false,
      error: error.message
    });
  }
};

const getAllPayment = async (req, res) => {
  try {
    const chapterId = req.user.chapterId; // get chapterId from logged-in user
    
    const payments = await Payment.find({chapter: chapterId })

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.status(200).json({ 
      message: "Success", 
      result: true, 
      data: payments,
      totalAmount: totalAmount
    });
    
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      result: false,
      error: error.message
    });
  }
};


module.exports = {
    makePayment,
    getAllPaymentByFundId,
    getAllPayment
}