const TokenService = require('../services/TokenService');
const AuthService = require('../services/AuthService');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const token = bearerToken || req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - no token' });
    }

    const decoded = TokenService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await AuthService.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;