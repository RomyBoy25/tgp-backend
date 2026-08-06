const express = require("express");

const router = express.Router();

const {
    createFund,
    getFunds,
    getFundById,
    updatePaymentStatus,
    deleteFund
} = require("../controllers/fund.controller");

router.post("/", createFund);
router.get("/", getFunds);
router.get("/:fundId", getFundById);
router.put(
  "/:fundId/payments/:paymentId", updatePaymentStatus
);
router.delete(
  "/:fundId",
  deleteFund
);

module.exports = router;