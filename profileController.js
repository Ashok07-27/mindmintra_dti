const User = require("./User");
const Mood = require("./Mood");

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const moods = await Mood.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(7);

    res.json({ user, moods });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { username, bio, tags } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username, bio, tags },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getProfile, updateProfile };



