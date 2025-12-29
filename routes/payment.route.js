const express = require("express");
const router = express.Router();
const {makePayment, getAllPaymentByFundId, getAllPayment, deleteFunds} = require("../controllers/payment.controller.js");

router.post('/', makePayment);
router.get('/:id', getAllPaymentByFundId);
router.get('/', getAllPayment);

module.exports = router;