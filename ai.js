const tagLibrary = {
  anxiety: ["anxious", "panic", "nervous", "overthinking", "worry"],
  stress: ["stress", "deadline", "pressure", "burnout", "exhausted"],
  loneliness: ["alone", "lonely", "isolated", "left out"],
  sadness: ["sad", "down", "crying", "unhappy", "empty"],
  motivation: ["motivation", "focus", "study", "goals", "stuck"],
};

const emotions = {
  anxiety: ["panic", "nervous", "worry", "tense"],
  sad: ["sad", "cry", "lonely", "empty"],
  stressed: ["stress", "pressure", "burnout", "overwhelmed"],
  hopeful: ["better", "healing", "hopeful", "improving"],
};

function suggestTags(content) {
  const text = content.toLowerCase();
  const tags = Object.entries(tagLibrary)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([tag]) => tag);

  return [...new Set(tags)];
}

function detectEmotion(content) {
  const text = content.toLowerCase();

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return emotion;
    }
  }

  return "neutral";
}

module.exports = { suggestTags, detectEmotion };



