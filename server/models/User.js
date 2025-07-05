const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  backupMnemonicHash: { type: String, default: null },
  mnemonicHash: String,
  pinHash: String,
  wallet: String,
  username: String,
  avatar: String,
  coins: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  pinHash: { type: String },
  wallet: { type: String, default: '' },
  streak: { type: Number, default: 0 },
  lastStreakDate: { type: Date },
  dailySessions: { type: Number, default: 0 },
  lastSessionDate: { type: Date },
  allTimePoints: { type: Number, default: 0 },
  weeklyPoints: { type: Number, default: 0 },
  monthlyPoints: { type: Number, default: 0 },
  lastWeeklyUpdate: Date,
  lastMonthlyUpdate: Date,
  referredBy: { type: String, default: null },
  hasClaimedReferral: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
