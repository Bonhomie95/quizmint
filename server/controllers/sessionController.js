import User from '../models/User.js';
import MysteryBox from '../models/MysteryBox.js';
import Session from '../models/Session.js';
import CoinTransaction from '../models/CoinTransaction.js';
import { isNewWeek, isNewMonth } from '../utils/date.js';
import { getUserTier } from '../utils/tier.js';

function getUnlockTime(type) {
  const now = new Date();
  if (type === 'small') return new Date(now.getTime() + 3 * 60 * 60 * 1000);
  if (type === 'medium') return new Date(now.getTime() + 8 * 60 * 60 * 1000);
  if (type === 'big') return new Date(now.getTime() + 12 * 60 * 60 * 1000);
}

async function assignMysteryBox(userId, type) {
  await MysteryBox.create({
    userId,
    boxType: type,
    unlockAt: getUnlockTime(type),
  });
}

export const claimStreak = async (req, res) => {
  const user = await User.findById(req.user.id);
  const now = new Date();
  const today = now.toDateString();
  const last = user.lastStreakDate?.toDateString();

  if (last === today) {
    return res.status(400).json({ message: 'Already claimed today' });
  }

  const lastClaimDate = new Date(user.lastStreakDate || 0);
  const hoursSinceLast = (now - lastClaimDate) / 36e5;

  // Reset if missed more than 48 hours
  if (hoursSinceLast > 48) {
    user.streak = 1;
  } else {
    user.streak += 1;
  }

  // Base reward
  let base = 100;

  // Multiplier based on streak day
  let multiplier = 1;
  if (user.streak >= 30) multiplier = 3;
  else if (user.streak >= 20) multiplier = 2.5;
  else if (user.streak >= 10) multiplier = 2;
  else if (user.streak >= 5) multiplier = 1.3;

  // Streak milestone bonus (optional, stacked on multiplier)
  let milestoneBonus = 0;
  if (user.streak === 7) milestoneBonus = 500;
  if (user.streak === 15) milestoneBonus = 1000;
  if (user.streak === 30) milestoneBonus = 5000;

  const bonus = Math.floor(base * multiplier) + milestoneBonus;
  user.coins += bonus;
  user.lastStreakDate = now;

  // Optional: Reset streak after Day 30
  if (user.streak >= 30) {
    user.streak = 1;
  }

  await CoinTransaction.create({
    user: user._id,
    type: 'earn',
    source: 'daily-claim',
    coins: bonus,
    note: `Streak Day ${user.streak}`,
  });

  await user.save();

  res.json({
    streak: user.streak,
    coins: user.coins,
    bonus,
    message: `+${bonus} coins earned for Day ${user.streak}`,
  });
};

export const useHint = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.coins < 50)
    return res.status(403).json({ message: 'Insufficient coins' });

  user.coins -= 50;
  await user.save();
  res.json({ coins: user.coins });
};

export const saveSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();

    // 🔄 Reset daily session counter if it's a new day
    if (user.lastSessionDate?.toDateString() !== today.toDateString()) {
      user.dailySessions = 0;
      user.lastSessionDate = today;
    }

    if (user.dailySessions >= 100) {
      return res
        .status(403)
        .json({ message: 'Daily quiz limit reached (100).' });
    }

    const { score, total, category, usedHints } = req.body;

    // 🧠 Point System (1 point per correct + 10 bonus for perfect session)
    const pointsEarned = score;
    const bonus = score === total ? 10 : 0;
    const totalPoints = pointsEarned + bonus;

    // ⛔️ Coins are NOT awarded per question
    // Coins are rewarded from streaks or purchases only

    // ➕ Update user ranking stats
    user.allTimePoints = (user.allTimePoints || 0) + totalPoints;
    user.weeklyPoints = (user.weeklyPoints || 0) + totalPoints;
    user.monthlyPoints = (user.monthlyPoints || 0) + totalPoints;
    user.dailySessions += 1;

    // 🔄 Reset weekly/monthly if needed
    const now = new Date();
    if (isNewWeek(user.lastWeeklyUpdate, now)) {
      user.weeklyPoints = totalPoints;
      user.lastWeeklyUpdate = now;
    }
    if (isNewMonth(user.lastMonthlyUpdate, now)) {
      user.monthlyPoints = totalPoints;
      user.lastMonthlyUpdate = now;
    }

    // 📊 Performance stats
    user.totalGames = (user.totalGames || 0) + 1;
    user.totalCorrect = (user.totalCorrect || 0) + score;

    if (!usedHints) {
      user.gamesWithoutHints = (user.gamesWithoutHints || 0) + 1;
      user.correctWithoutHints = (user.correctWithoutHints || 0) + score;
    }

    // 📈 Win Rate Calculations
    user.winRate = user.totalCorrect / (user.totalGames || 1);
    user.winRateWithoutHints =
      user.correctWithoutHints / (user.gamesWithoutHints || 1);

    // 🏅 Tier system
    const previousTier = user.tier?.level || 0;
    const { tier, emoji, color } = getUserTier({
      allTimePoints: user.allTimePoints,
      winRate: user.winRate,
      winRateWithoutHints: user.winRateWithoutHints,
    });
    user.tier = { level: tier, emoji, color };

    // 🎁 Streak-based reward logic
    if (score === total) {
      user.streak = (user.streak || 0) + 1;
      if (user.streak === 10) {
        await assignMysteryBox(user._id, 'small'); // 🔓 Small box after 10 streak
      }
    } else {
      user.streak = 0;
    }

    // 🎁 Tier change-based box rewards
    const hoursSinceTierUp = (now - new Date(user.lastTierUp || 0)) / 36e5;
    const tierDiff = tier - (user.lastTierLevel || 0);
    if (tierDiff === 1 && hoursSinceTierUp <= 48) {
      await assignMysteryBox(user._id, 'medium');
    }
    if (tierDiff >= 2 && hoursSinceTierUp <= 72) {
      await assignMysteryBox(user._id, 'big');
    }

    user.lastTierUp = now;
    user.lastTierLevel = tier;

    await user.save();

    // 📝 Save session log
    await Session.create({
      userId: user._id,
      category,
      score,
      total,
      usedHints,
      pointsEarned: totalPoints,
    });

    return res.json({
      message: 'Session saved',
      totalPoints,
      updatedPoints: user.allTimePoints,
      tier: user.tier,
      coins: user.coins, // coins stay unchanged unless streak/purchase rewards occur elsewhere
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSessionHistory = async (req, res) => {
  const sessions = await Session.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('userId', 'username avatar');

  res.json({ sessions });
};
