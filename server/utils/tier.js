exports.getUserTier = ({ allTimePoints, winRate, winRateWithoutHints }) => {
  const score =
    (allTimePoints / 10000) * 0.5 +
    winRate * 100 * 0.3 +
    winRateWithoutHints * 100 * 0.2;

  const tierLevels = [
    { min: 95, tier: 10, emoji: '🧙‍♂️', color: '#7c3aed' },
    { min: 85, tier: 9, emoji: '🐉', color: '#9333ea' },
    { min: 75, tier: 8, emoji: '🦄', color: '#6366f1' },
    { min: 65, tier: 7, emoji: '👑', color: '#3b82f6' },
    { min: 55, tier: 6, emoji: '🧠', color: '#06b6d4' },
    { min: 45, tier: 5, emoji: '🧩', color: '#10b981' },
    { min: 35, tier: 4, emoji: '🔥', color: '#facc15' },
    { min: 25, tier: 3, emoji: '🧭', color: '#f97316' },
    { min: 15, tier: 2, emoji: '💡', color: '#ef4444' },
    { min: 0, tier: 1, emoji: '🚀', color: '#9ca3af' },
  ];

  return tierLevels.find((t) => score >= t.min);
};
