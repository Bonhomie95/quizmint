const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  backupMnemonicHash: { type: String, default: null },
  mnemonicHash: String,
  pinHash: String,
  username: String,
  avatar: String,
  coins: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 },
  wallet: { type: String, default: '' },
  streak: { type: Number, default: 0 },
  lastStreakDate: { type: Date },
  dailySessions: { type: Number, default: 0 },
  lastSessionDate: { type: Date },
  allTimePoints: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  winRateWithoutHints: { type: Number, default: 0 },
  tier: {
    level: { type: String, default: 'Bronze' },
    emoji: { type: String, default: '🥉' },
    color: { type: String, default: '#cd7f32' },
  },
  weeklyPoints: { type: Number, default: 0 },
  monthlyPoints: { type: Number, default: 0 },
  lastWeeklyUpdate: Date,
  lastMonthlyUpdate: Date,
  referredBy: { type: String, default: null },
  hasClaimedReferral: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
