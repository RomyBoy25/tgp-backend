const express = require("express");
const router = express.Router();

const { getPublicUser } = require("../controllers/public.controller.js");

router.get("/member/:id", getPublicUser);

module.exports = router;