const express = require("express");
const router = express.Router();
const {getUsers, getUser, updateUser, deleteUser} = require("../controllers/user.controller.js");

router.get('/', getUsers);
// router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;