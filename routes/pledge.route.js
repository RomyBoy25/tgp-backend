const express = require("express");
const router = express.Router();

const {
  createPledge,
  getPledges,
  getPledgeById,
  searchMembers,
  addContribution,
  deletePledge
} = require("../controllers/pledge.controller");


router.post(
  "/",
  createPledge
);


router.get(
  "/",
  getPledges
);


// IMPORTANT: dapat nasa taas ito
router.get(
  "/members/search",
  searchMembers
);


router.get(
  "/:pledgeId",
  getPledgeById
);

router.post(
  "/:pledgeId/contribution",
  addContribution
);

router.delete("/:pledgeId", deletePledge);


module.exports = router;