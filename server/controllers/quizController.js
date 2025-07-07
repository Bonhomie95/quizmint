const OpenAI = require('openai');
const QuizQuestion = require('../models/QuizQuestion');
const mongoose = require('mongoose');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateQuestions = async (req, res) => {
  const { category } = req.body;
  const userId = req.user.id;

  try {
    const unseen = await QuizQuestion.aggregate([
      {
        $match: {
          category,
          usedBy: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      { $sample: { size: 10 } },
    ]);

    // ✅ If we found enough unseen ones, mark them as used and return
    if (unseen.length === 10) {
      const ids = unseen.map((q) => q._id);

      await QuizQuestion.updateMany(
        { _id: { $in: ids } },
        {
          $addToSet: { usedBy: userId },
          $inc: { usedCount: 1 },
        }
      );

      return res.json({ questions: unseen });
    }

    // Else: generate new unique questions using OpenAI
    const difficulties = [
      { level: 'easy', count: 3 },
      { level: 'medium', count: 4 },
      { level: 'hard', count: 3 },
    ];

    let allQuestions = [];

    for (const { level, count } of difficulties) {
      const prompt = `
Generate ${count} ${level} difficulty multiple choice questions in the category "${category}". Make them unique and interesting.
Return ONLY JSON array in this format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "B",
    "hint": "..."
  }
]
`;

      const aiRes = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      const content = aiRes.choices[0].message.content;
      const parsed = JSON.parse(content);

      const withMeta = parsed.map((q) => ({
        ...q,
        category,
        difficulty: level,
        usedBy: [userId], // ✅ first user
        usedCount: 1,
      }));

      await QuizQuestion.insertMany(withMeta);
      allQuestions.push(...withMeta);
    }

    // Return newly generated questions (don’t rely on cached fallback)
    res.json({ questions: allQuestions });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Failed to generate or fetch questions' });
  }
};
