const mongoose = require('mongoose');
const Payment = require('../model/payment.model.js');
const userModel = require('../model/user.model.js');
const fundsModel = require('../model/funds.model.js');
const Costs = require('../model/cost.model.js');


const getFundSummary = async (req, res) => {
    const chapterId = req.user.chapterId;

    try {
        const credit = await Payment.find({ chapter: chapterId });
        const debit = await Costs.find({ chapter: chapterId });

        const totalFunds = credit.reduce((s, p) => s + p.amount, 0);
        const totalCost = debit.reduce((s, c) => s + c.amount, 0);

        const remaining = totalFunds - totalCost;

        res.status(200).json({
            result: true,
            totalFunds,
            totalCost,
            remaining
        });
    } catch (error) {
        res.status(500).json({ result: false, message: error.message });
    }
};


module.exports = {
    getFundSummary,
}