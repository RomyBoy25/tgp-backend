const express = require("express");
const router = express.Router();
const {getChapter, getChapterById, createUser, updateChapter, deleteChapter, createChapter} = require("../controllers/chapter.controller.js");

 router.get('/', getChapter);
 router.post('/', createChapter);
 router.get('/:id', getChapterById);
 router.put('/:id', updateChapter);
 router.delete('/:id', deleteChapter);

module.exports = router;