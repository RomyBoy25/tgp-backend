const express = require("express");
const router = express.Router();

const {
  createBatch,
  getBatchesByChapter,
  getBatchById,
  updateBatch,
  deleteBatch,
  getBatchMembers 
} = require("../controllers/batch.controller");

router.post("/chapters/:chapterId", createBatch);

router.get("/chapters/:chapterId", getBatchesByChapter);

router.get('/:batchId/members', getBatchMembers);

router.get("/:batchId", getBatchById);

router.put("/:batchId", updateBatch);

router.delete("/:batchId", deleteBatch);

module.exports = router;