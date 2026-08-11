const express = require("express");
const router = express.Router();

const {
  createPledge,
  getPledges,
  getPledgeById,
  searchMembers,
  addContribution,
  deletePledge,
  updatePledge,
  deleteContribution
} = require("../controllers/pledge.controller");


router.post(
  "/",
  createPledge
);

router.put(
  "/:pledgeId",
  updatePledge
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

router.delete(
  '/contributions/:contributionId',
  deleteContribution,
);

router.delete("/:pledgeId", deletePledge);


module.exports = router;