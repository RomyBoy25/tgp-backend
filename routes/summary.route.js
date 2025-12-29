const express = require("express");
const router = express.Router();
const {getFundSummary} = require("../controllers/summary.controller.js");

router.get('/', getFundSummary );

module.exports = router;