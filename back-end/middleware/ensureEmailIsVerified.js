const isVerifiedUser = (user) => {
  if (!user) {
    return false;
  }

  if (typeof user.isVerified === 'boolean') {
    return user.isVerified;
  }

  if (typeof user.emailVerified === 'boolean') {
    return user.emailVerified;
  }

  return Boolean(user.email_verified_at);
};

const ensureEmailIsVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!isVerifiedUser(req.user)) {
    return res.status(403).json({
      verified: false,
      message: 'Email verification required.',
    });
  }

  return next();
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  return next();
};

module.exports = {
  ensureEmailIsVerified,
  isAdmin,
};
