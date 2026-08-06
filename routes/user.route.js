const express = require("express");
const router = express.Router();
const {getUsers, getUser, updateUser, deleteUser,updateProfile,updateOrganization,updatePassword} = require("../controllers/user.controller.js");
const authMiddleware = require("../middleware/auth.js");

router.get('/', getUsers);
// router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id/profile', updateProfile);
router.put('/:id/organization',authMiddleware, updateOrganization);
router.put('/:id/password', updatePassword);
router.delete('/:id', deleteUser);

module.exports = router;