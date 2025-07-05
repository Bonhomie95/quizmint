const OpenAI = require('openai');
const QuizQuestion = require('../models/QuizQuestion');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateQuestions = async (req, res) => {
  const { category } = req.body;

  try {
    const cached = await QuizQuestion.find({ category }).limit(10);

    if (cached.length === 10) {
      return res.json({ questions: cached });
    }

    // Else: generate and cache
    const difficulties = [
      { level: 'easy', count: 3 },
      { level: 'medium', count: 4 },
      { level: 'hard', count: 3 },
    ];

    let allQuestions = [];

    for (const { level, count } of difficulties) {
      const prompt = `
Generate ${count} ${level} difficulty multiple choice questions in the category "${category}".
Each question should include:
- question
- 4 options
- correct answer
- hint

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
      }));

      await QuizQuestion.insertMany(withMeta);
      allQuestions.push(...withMeta);
    }

    res.json({ questions: allQuestions });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Failed to generate or fetch questions' });
  }
};
