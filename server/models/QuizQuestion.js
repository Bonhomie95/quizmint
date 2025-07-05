const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    question: String,
    options: [String],
    answer: String,
    hint: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizQuestion', questionSchema);
