const express = require("express");
const router = express.Router();
const {getCouncil, getCouncilById, updateCouncil, deleteCouncil, createCouncil,getCouncilChapters} = require("../controllers/council.controller.js");

 router.get('/', getCouncil);
 router.post('/', createCouncil);
 router.get('/:id', getCouncilById);
 router.put('/:id', updateCouncil);
 router.delete('/:id', deleteCouncil);
 router.get("/:id/chapters", getCouncilChapters);

module.exports = router;