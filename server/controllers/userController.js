const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, avatar } = req.body;

    if (username) user.username = username;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({ username: user.username, avatar: user.avatar });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-pinHash -backupMnemonicHash'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};


exports.getCoinHistory = async (req, res) => {
  const txs = await CoinTransaction.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ transactions: txs });
};