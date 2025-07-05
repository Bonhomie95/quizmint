const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['earn', 'spend'],
      required: true,
    },
    source: {
      type: String,
      enum: [
        'daily-claim',
        'referral',
        'hint',
        'admin',
        'share',
        'withdrawal',
        'game-bonus',
        'other',
      ],
      required: true,
    },
    coins: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
