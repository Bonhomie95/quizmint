const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ Verify and decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded should contain uuid (we’ll issue it during registration)
    const user = await User.findOne({ uuid: decoded.uuid });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      uuid: user.uuid,
    };

    next();
  } catch (err) {
    console.error('❌ Auth error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
