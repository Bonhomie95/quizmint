const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  category: String,
  score: Number,
  total: Number,
  usedHints: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);
