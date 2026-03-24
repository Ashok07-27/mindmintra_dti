const Post = require("./Post");
const Report = require("./Report");

async function getModerationDashboard(req, res) {
  try {
    const flaggedPosts = await Post.find({
      $or: [{ reportCount: { $gt: 0 } }, { riskLevel: "high" }],
    })
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    const reports = await Report.find()
      .populate("postId", "content")
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ flaggedPosts, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getModerationDashboard };



