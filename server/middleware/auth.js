const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const user = await User.findOne({ uuid: token });

  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = {
    id: user._id,
    uuid: user.uuid,
  };

  next();
};

module.exports = authMiddleware;
