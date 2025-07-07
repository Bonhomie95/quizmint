const User = require('../models/User');
const { hashMnemonic, verifyMnemonic } = require('../utils/crypto');

const bip39 = require('bip39');

exports.generateBackup = async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.user.uuid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.backupMnemonicHash) {
      return res.status(409).json({ message: 'Backup already exists' });
    }

    const mnemonic = bip39.generateMnemonic(256); // 24-word
    const hashed = await hashMnemonic(mnemonic);

    user.backupMnemonicHash = hashed;
    await user.save();

    res.json({ mnemonic }); // frontend shows this only once
  } catch (err) {
    console.error('Backup Generation Error:', err);
    res.status(500).json({ message: 'Failed to generate backup phrase' });
  }
};

exports.backupMnemonic = async (req, res) => {
  const { mnemonic } = req.body || {};
  const user = await User.findOne({ uuid: req.user?.uuid });

  if (!mnemonic || !user) {
    return res.status(400).json({ message: 'Invalid backup request.' });
  }

  const hashed = await hashMnemonic(mnemonic);
  user.backupMnemonicHash = hashed;
  await user.save();

  res.json({ message: 'Backup successful' });
};

exports.restoreFromMnemonic = async (req, res) => {
  const { mnemonic } = req.body;

  if (!mnemonic) {
    return res.status(400).json({ message: 'Mnemonic required.' });
  }

  const users = await User.find({ backupMnemonicHash: { $ne: null } });

  for (const user of users) {
    const isMatch = await verifyMnemonic(mnemonic, user.backupMnemonicHash);
    if (isMatch) {
      return res.json({ token: user.uuid, user });
    }
  }

  res.status(404).json({ message: 'No matching user found for this backup.' });
};
