const Mood = require("./Mood");

async function saveMood(req, res) {
  try {
    const { mood, score, note, day } = req.body;

    const entry = await Mood.findOneAndUpdate(
      { userId: req.user._id, day },
      { mood, score, note, day, userId: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMoodHistory(req, res) {
  try {
    const moods = await Mood.find({ userId: req.user._id }).sort({ day: 1 }).limit(14);
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { saveMood, getMoodHistory };



