const User = require('../models/User');

async function attachCurrentUser(req, res, next) {
  try {
    const rawEmail = req.headers['x-user-email'];

    if (!rawEmail) {
      req.currentUser = null;
      return next();
    }

    req.currentUser = await User.findOne({ email: String(rawEmail).toLowerCase() });
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  if (req.currentUser.status === 'banned') {
    return res.status(403).json({ message: 'Your account is banned.' });
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.currentUser) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }

  if (req.currentUser.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  return next();
}

module.exports = {
  attachCurrentUser,
  requireAuth,
  requireAdmin,
};
