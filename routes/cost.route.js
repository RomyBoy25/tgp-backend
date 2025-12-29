const express = require("express");
const router = express.Router();
const {addCosting, getAllCostByChapter, getAllPayment, deleteFunds} = require("../controllers/cost.controller.js");
const upload = require('../middleware/upload');

// router.post('/', uploadCostGallery, addCosting);
router.post('/', upload.array('gallery'), addCosting);
router.get('/', getAllCostByChapter);
// router.get('/', getAllPayment);

module.exports = router;