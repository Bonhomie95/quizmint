import MysteryBox from '../models/MysteryBox.js';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';

function getFastTrackCost(unlockAt) {
  const hoursLeft = Math.max((unlockAt - Date.now()) / (1000 * 60 * 60), 0);
  return Math.ceil(hoursLeft * 50);
}

export const openMysteryBox = async (req, res) => {
  try {
    const box = await MysteryBox.findById(req.params.id);
    if (!box || box.opened)
      return res
        .status(404)
        .json({ message: 'Box not found or already opened' });

    const user = await User.findById(req.user.id);
    const canOpen = new Date() >= box.unlockAt;

    if (!canOpen) {
      const cost = getFastTrackCost(box.unlockAt);
      if (user.coins < cost)
        return res
          .status(400)
          .json({ message: 'Not enough coins to fast-track' });
      user.coins -= cost;
    }

    box.opened = true;
    box.reward = '50 coins'; // Replace with randomized logic if needed
    user.coins += 50;

    await box.save();
    await user.save();

    res.json({
      message: 'Box opened',
      reward: box.reward,
      userCoins: user.coins,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unlockBox = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const box = await MysteryBox.findById(req.body.boxId);

    if (!box || box.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ message: 'Box not found' });
    }

    if (box.status !== 'locked') {
      return res.status(400).json({ message: 'Box is not locked' });
    }

    const now = new Date();
    const hoursLeft = Math.ceil((box.unlockAt - now) / 3600000);
    if (hoursLeft <= 0) {
      box.status = 'unlocked';
      await box.save();
      return res.json({ message: 'Box already unlocked', box });
    }

    const cost = hoursLeft * 50;
    if (user.coins < cost) {
      return res.status(403).json({ message: `Need ${cost} coins to unlock` });
    }

    // Deduct coins
    user.coins -= cost;
    await user.save();

    // Update box
    box.status = 'unlocked';
    box.unlockAt = now;
    await box.save();

    // Log coin usage
    await CoinTransaction.create({
      userId: user._id,
      type: 'spend',
      source: 'fast-unlock',
      coins: cost,
      note: `Fast unlock for ${box.boxType} box (${hoursLeft}h)`,
    });

    res.json({ message: 'Box unlocked successfully', box, coins: user.coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const openBox = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const box = await MysteryBox.findById(req.body.boxId);

    if (!box || box.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ message: 'Box not found' });
    }

    if (box.status === 'opened') {
      return res.status(400).json({ message: 'Box already opened' });
    }

    const now = new Date();
    if (box.unlockAt > now) {
      return res.status(400).json({ message: 'Box is still locked' });
    }

    // Reward logic
    let reward = 0;
    if (box.boxType === 'small') reward = 200;
    if (box.boxType === 'medium') reward = 500;
    if (box.boxType === 'big') reward = 1000;

    // Update user coins
    user.coins += reward;
    await user.save();

    // Update box
    box.status = 'opened';
    await box.save();

    // Log coin earn
    await CoinTransaction.create({
      userId: user._id,
      type: 'earn',
      source: 'mystery-box',
      coins: reward,
      note: `Opened ${box.boxType} box`,
    });

    res.json({ message: 'Box opened', reward, coins: user.coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
