const express = require("express");
const { saveMood, getMoodHistory } = require("./moodController");
const { protect } = require("./authMiddleware");

const router = express.Router();

router.route("/").post(protect, saveMood).get(protect, getMoodHistory);

module.exports = router;



