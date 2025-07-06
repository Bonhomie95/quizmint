const mongoose = require('mongoose');

const mysteryBoxSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  boxType: { type: String, enum: ['small', 'medium', 'big'], required: true },
  status: { type: String, enum: ['locked', 'unlocked', 'opened'], default: 'locked' },
  createdAt: { type: Date, default: Date.now },
  unlockAt: { type: Date, required: true },
  opened: { type: Boolean, default: false },
  reward: { type: String },
});

module.exports = mongoose.model('MysteryBox', mysteryBoxSchema);
