const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');

// ✏️ Update username and avatar
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('❌ User not found for update:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, avatar } = req.body;
    if (username) user.username = username;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated',
      username: user.username,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error('❌ Error updating profile:', err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// 👤 Get user details (minus sensitive data)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-pinHash -backupMnemonicHash'
    );
    if (!user) {
      console.error('❌ User not found for profile fetch:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
    console.log('✅ Profile fetched:', user.username);
  } catch (err) {
    console.error('❌ Error fetching profile:', err);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// 💰 Get last 100 coin transactions
exports.getCoinHistory = async (req, res) => {
  try {
    const txs = await CoinTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ transactions: txs });
  } catch (err) {
    console.error('❌ Error fetching coin history:', err);
    res
      .status(500)
      .json({ message: 'Server error while fetching transactions' });
  }
};
