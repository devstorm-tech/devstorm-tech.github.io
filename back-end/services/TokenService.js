const jwt = require('jsonwebtoken');
const { COOKIE_OPTIONS } = require('../config/constants');

class TokenService {
  // Generate JWT token
  static generateToken(userId, expiresIn = process.env.JWT_EXPIRES_IN) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
  }

  // Verify token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Set auth cookie with token
  static setAuthCookie(res, token, rememberMe = false) {
    const expiresIn = rememberMe ? 7 : 1; // days
    const cookieOptions = {
      ...COOKIE_OPTIONS,
      maxAge: expiresIn * 24 * 60 * 60 * 1000,
    };
    res.cookie('auth_token', token, cookieOptions);
  }

  // Clear auth cookie
  static clearAuthCookie(res) {
    res.clearCookie('auth_token', COOKIE_OPTIONS);
  }
}

module.exports = TokenService;