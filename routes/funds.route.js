const express = require("express");
const router = express.Router();
const {createMonthlyFunds, getMonthlyFunds, getFund, deleteFunds} = require("../controllers/funds.controller.js");

router.post('/', createMonthlyFunds);
router.get('/', getMonthlyFunds);
router.get('/:id', getFund);
// router.put('/:id', updateUser);
router.delete('/:id', deleteFunds);

module.exports = router;