const Session = require('../models/Session');
const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  const { range } = req.query;
  const userId = req.user.id;
  const now = new Date();
  const from = new Date(
    range === 'monthly'
      ? now.setDate(now.getDate() - 30)
      : now.setDate(now.getDate() - 7)
  );

  const sessions = await Session.aggregate([
    { $match: { createdAt: { $gte: from } } },
    {
      $group: {
        _id: '$userId',
        totalScore: { $sum: '$score' },
        sessionCount: { $sum: 1 },
      },
    },
    { $sort: { totalScore: -1 } },
  ]);

  const top50 = sessions.slice(0, 50);
  const users = await User.find({ _id: { $in: top50.map((s) => s._id) } })
    .select('username avatar')
    .lean();

  const topPlayers = top50.map((s, i) => {
    const user = users.find((u) => u._id.toString() === s._id.toString());
    return {
      username: user?.username,
      avatar: user?.avatar,
      totalScore: s.totalScore,
      sessionCount: s.sessionCount,
      rank: i + 1,
    };
  });

  // Find logged-in user's position if not in top 50
  let currentUser = null;
  const userIndex = sessions.findIndex(
    (s) => s._id.toString() === userId.toString()
  );
  if (userIndex >= 50 && userIndex !== -1) {
    const selfUser = await User.findById(userId).select('username avatar');
    const selfSession = sessions[userIndex];

    currentUser = {
      username: selfUser?.username,
      avatar: selfUser?.avatar,
      totalScore: selfSession.totalScore,
      sessionCount: selfSession.sessionCount,
      rank: userIndex + 1,
    };
  }

  res.json({ topPlayers, currentUser });
};
