const express = require("express");

const router = express.Router();

const {
    createFund,
    getFunds,
    getFundById,
    updatePaymentStatus,
    deleteFund,
    updateFund
} = require("../controllers/fund.controller");

router.post("/", createFund);
router.get("/", getFunds);
router.get("/:fundId", getFundById);
router.put("/:fundId", updateFund);
router.put(
  "/:fundId/payments/:paymentId", updatePaymentStatus
);
router.delete(
  "/:fundId",
  deleteFund
);

module.exports = router;