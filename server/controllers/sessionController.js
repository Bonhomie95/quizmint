import User from '../models/User.js';
import Session from '../models/Session.js';
import CoinTransaction from '../models/CoinTransaction.js';
// const CoinTransaction = require('../models/CoinTransaction');
import { isNewWeek, isNewMonth } from '../utils/date.js';

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

  if (hoursSinceLast > 48) {
    // Reset streak if user missed 2 days
    user.streak = 1;
  } else {
    user.streak += 1;
  }

  // Streak milestone bonus logic
  let bonus = 100;
  if (user.streak === 7) bonus = 500;
  if (user.streak === 15) bonus = 1000;
  if (user.streak === 30) bonus = 5000;

  user.coins += bonus;
  user.lastStreakDate = now;

  // Reset streak if milestone is hit (optional for Day 30)
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
    message: `+${bonus} coins earned for Day ${
      user.streak === 1 ? 30 : user.streak - 1
    }`,
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
    const today = new Date();

    // Daily session reset if new day
    const last = user.lastSessionDate?.toDateString();
    if (last !== today.toDateString()) {
      user.dailySessions = 0;
      user.lastSessionDate = today;
    }

    if (user.dailySessions >= 100) {
      return res
        .status(403)
        .json({ message: 'Daily quiz limit reached (100).' });
    }

    const { score, total, category, usedHints } = req.body;

    // 🧮 Points logic
    const pointsEarned = score * 100;
    const bonus = score === total ? 1000 : 0;
    const totalPoints = pointsEarned + bonus;

    // 💰 Coins = 10 coins per correct
    user.coins += score * 10;

    // 🗓️ Weekly and Monthly reset logic
    const now = new Date();

    if (isNewWeek(user.lastWeeklyUpdate, now)) {
      user.weeklyPoints = 0;
      user.lastWeeklyUpdate = now;
    }

    if (isNewMonth(user.lastMonthlyUpdate, now)) {
      user.monthlyPoints = 0;
      user.lastMonthlyUpdate = now;
    }

    // 📈 Update all points
    user.allTimePoints = (user.allTimePoints || 0) + totalPoints;
    user.weeklyPoints = (user.weeklyPoints || 0) + totalPoints;
    user.monthlyPoints = (user.monthlyPoints || 0) + totalPoints;

    user.dailySessions += 1;
    await user.save();

    // 📦 Save session
    await Session.create({
      userId: user._id,
      category,
      score,
      total,
      usedHints,
      pointsEarned: totalPoints,
    });

    res.json({
      message: 'Session saved',
      totalPoints,
      updatedPoints: user.allTimePoints,
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
