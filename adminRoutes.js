const express = require("express");
const { getModerationDashboard } = require("./adminController");
const { protect, adminOnly } = require("./authMiddleware");

const router = express.Router();

router.get("/moderation", protect, adminOnly, getModerationDashboard);

module.exports = router;



