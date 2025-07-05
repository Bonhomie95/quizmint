const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateQuestions = async (req, res) => {
  const { category } = req.body;

  const difficulties = [
    { level: 'easy', count: 3 },
    { level: 'medium', count: 3 },
    { level: 'hard', count: 3 },
    { level: 'hardest', count: 1 },
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

Format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "B",
    "hint": "..."
  }
]
Only return JSON array.
`;

    try {
      const aiRes = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      });

      const content = aiRes.choices[0].message.content;
      const parsed = JSON.parse(content);
      allQuestions.push(...parsed);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to generate questions' });
    }
  }

  res.json({ questions: allQuestions });
};
