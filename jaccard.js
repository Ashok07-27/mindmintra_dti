function normalizeTags(tags = []) {
  return [...new Set(tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean))];
}

function jaccardSimilarity(firstTags = [], secondTags = []) {
  const setA = new Set(normalizeTags(firstTags));
  const setB = new Set(normalizeTags(secondTags));

  const union = new Set([...setA, ...setB]);
  const intersectionCount = [...setA].filter((tag) => setB.has(tag)).length;

  return union.size === 0 ? 0 : intersectionCount / union.size;
}

module.exports = { jaccardSimilarity, normalizeTags };



