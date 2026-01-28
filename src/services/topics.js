const topics = [
  "Mindful morning routines for productivity",
  "Easy plant-based recipes for beginners",
  "How to start a minimalist lifestyle",
  "Gentle yoga stretches for stress relief",
  "Budget-friendly home decor ideas",
  "Digital detox tips for mental health",
  "Indoor gardening tips for small spaces",
  "Sustainable fashion on a budget",
  "Simple meditation techniques for anxiety",
  "Zero waste swaps for the kitchen"
];

function getTopic() {
  // Returns a random topic from the list
  return topics[Math.floor(Math.random() * topics.length)];
}

module.exports = { getTopic };
