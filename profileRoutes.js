const express = require("express");
const { getProfile, updateProfile } = require("./profileController");
const { protect } = require("./authMiddleware");

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);

module.exports = router;



