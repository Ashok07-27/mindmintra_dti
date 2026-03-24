const Post = require("./Post");
const Reaction = require("./Reaction");
const Report = require("./Report");
const User = require("./User");
const { sanitizeContent, detectRisk } = require("./moderation");
const { suggestTags, detectEmotion } = require("./ai");
const { jaccardSimilarity, normalizeTags } = require("./jaccard");

async function createPost(req, res) {
  try {
    const { content, tags = [], isAnonymous = false } = req.body;
    const cleanContent = sanitizeContent(content);
    const aiTags = suggestTags(cleanContent);
    const mergedTags = normalizeTags([...tags, ...aiTags]);
    const risk = detectRisk(cleanContent);
    const emotion = detectEmotion(cleanContent);

    const post = await Post.create({
      userId: req.user._id,
      content: cleanContent,
      tags: mergedTags,
      isAnonymous,
      emotion,
      riskLevel: risk.level,
    });

    res.status(201).json({
      post,
      ai: {
        suggestedTags: aiTags,
        emotion,
        risk,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getPosts(req, res) {
  try {
    const posts = await Post.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .lean();

    const postIds = posts.map((post) => post._id);
    const reactions = await Reaction.find({ postId: { $in: postIds } }).lean();

    const reactionMap = postIds.reduce((acc, id) => {
      acc[id.toString()] = { relate: 0, support: 0 };
      return acc;
    }, {});

    reactions.forEach((reaction) => {
      const key = reaction.postId.toString();
      reactionMap[key][reaction.type] += 1;
    });

    const result = posts.map((post) => ({
      ...post,
      displayName: post.isAnonymous ? "Anonymous Student" : post.userId.username,
      reactions: reactionMap[post._id.toString()] || { relate: 0, support: 0 },
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function reactToPost(req, res) {
  try {
    const { type } = req.body;
    const { postId } = req.params;

    const reaction = await Reaction.findOneAndUpdate(
      { userId: req.user._id, postId, type },
      { userId: req.user._id, postId, type },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Reaction saved", reaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function reportPost(req, res) {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    await Report.create({
      postId,
      userId: req.user._id,
      reason,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { reportCount: 1 } });

    res.json({ message: "Post reported to moderators" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getRecommendedPosts(req, res) {
  try {
    const user = await User.findById(req.user._id).lean();
    const posts = await Post.find({ userId: { $ne: req.user._id } })
      .populate("userId", "username")
      .lean();

    const recommended = posts
      .map((post) => ({
        ...post,
        similarity: jaccardSimilarity(user.tags, post.tags),
      }))
      .filter((post) => post.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getPeerMatches(req, res) {
  try {
    const currentUser = await User.findById(req.user._id).lean();
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("username tags bio")
      .lean();

    const matches = users
      .map((user) => ({
        ...user,
        similarity: jaccardSimilarity(currentUser.tags, user.tags),
      }))
      .filter((user) => user.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createPost,
  getPosts,
  reactToPost,
  reportPost,
  getRecommendedPosts,
  getPeerMatches,
};



