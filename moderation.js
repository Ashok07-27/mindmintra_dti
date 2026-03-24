const abusiveWords = ["hate", "stupid", "idiot", "worthless"];
const harmfulWords = ["suicide", "kill myself", "self harm", "end my life"];

function sanitizeContent(content) {
  let filteredText = content;

  abusiveWords.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filteredText = filteredText.replace(regex, "*".repeat(word.length));
  });

  return filteredText;
}

function detectRisk(content) {
  const text = content.toLowerCase();
  const hasHarm = harmfulWords.some((word) => text.includes(word));

  if (hasHarm) {
    return {
      level: "high",
      warning:
        "This message may indicate harm risk. Please encourage professional help immediately.",
    };
  }

  if (text.includes("alone") || text.includes("hopeless")) {
    return {
      level: "medium",
      warning: "This post may need gentle check-ins from peers or moderators.",
    };
  }

  return { level: "low", warning: "" };
}

module.exports = { sanitizeContent, detectRisk };



