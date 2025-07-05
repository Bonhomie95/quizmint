const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const User = require('../models/User');
exports.registerNewUser = async (req, res) => {
  const uuid = uuidv4();
  const { ref } = req.query;

  const user = await User.create({
    uuid,
    referredBy: ref || null,
  });

  // If referral is valid and not self
  if (ref && ref !== uuid) {
    const referrer = await User.findOne({ uuid: ref });
    if (referrer) {
      referrer.coins += 200; // 🎁 reward for referrer
      await referrer.save();
    }
    user.coins += 100; // 🎁 reward for invitee
    user.hasClaimedReferral = true;
    await user.save();
  }

  res.json({ token: uuid, user });
};


// 🔒 Set or update PIN securely
exports.setPin = async (req, res) => {
  try {
    const { pin, oldPin } = req.body;
    const user = await User.findById(req.user.id);

    if (user.pinHash && !oldPin)
      return res.status(400).json({ message: 'Old PIN required' });

    if (user.pinHash && !(await bcrypt.compare(oldPin, user.pinHash)))
      return res.status(403).json({ message: 'Incorrect old PIN' });

    const hashed = await bcrypt.hash(pin, 10);
    user.pinHash = hashed;
    await user.save();

    res.json({ message: 'PIN updated' });
  } catch (err) {
    console.error('Set PIN Error:', err);
    res.status(500).json({ message: 'Failed to update PIN' });
  }
};

// 👛 Update Wallet with PIN verification
exports.updateWallet = async (req, res) => {
  try {
    const { pin, wallet } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.pinHash)
      return res.status(400).json({ message: 'Set PIN first' });

    const isMatch = await bcrypt.compare(pin, user.pinHash);
    if (!isMatch) return res.status(403).json({ message: 'Invalid PIN' });

    user.wallet = wallet;
    await user.save();

    res.json({ wallet: user.wallet });
  } catch (err) {
    console.error('Update Wallet Error:', err);
    res.status(500).json({ message: 'Failed to update wallet' });
  }
};
