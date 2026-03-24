const express = require("express");
const {
  createPost,
  getPosts,
  reactToPost,
  reportPost,
  getRecommendedPosts,
  getPeerMatches,
} = require("./postController");
const { protect } = require("./authMiddleware");

const router = express.Router();

router.route("/").get(protect, getPosts).post(protect, createPost);
router.get("/recommended", protect, getRecommendedPosts);
router.get("/matches", protect, getPeerMatches);
router.post("/:postId/react", protect, reactToPost);
router.post("/:postId/report", protect, reportPost);

module.exports = router;



