const express = require("express");
const { sendMessage, getMessages } = require("./chatController");
const { protect } = require("./authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:userId", protect, getMessages);

module.exports = router;



