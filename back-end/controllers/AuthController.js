const AuthService = require('../services/AuthService');
const TokenService = require('../services/TokenService');

class AuthController {
  // GET /sanctum/csrf-cookie – handled by middleware, no controller needed

  // POST /api/signup
  static async signup(req, res, next) {
    try {
      const authData = await AuthService.register(req.body);
      // Set JWT in HTTP-only cookie
      TokenService.setAuthCookie(res, authData.token, req.body.rememberMe || false);
      res.status(201).json({
        success: true,
        data: {
          user: authData.user,
          auth: {
            token: authData.token,
            token_type: authData.token_type,
            expires_at: authData.expires_at,
          },
        },
      });
    } catch (error) {
      // Custom error handling: 409 for duplicate email
      if (error.message.includes('Email already registered')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  // POST /api/login
  static async login(req, res, next) {
    try {
      const { email, password, rememberMe } = req.body;
      const authData = await AuthService.login(email, password, rememberMe);
      TokenService.setAuthCookie(res, authData.token, rememberMe);
      res.status(200).json({
        success: true,
        data: {
          user: authData.user,
          auth: {
            token: authData.token,
            token_type: authData.token_type,
            expires_at: authData.expires_at,
          },
        },
      });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  // POST /api/logout
  static async logout(req, res) {
    TokenService.clearAuthCookie(res);
    res.status(200).json({ success: true, message: 'Logged out' });
  }

  // GET /api/user – get current authenticated user
  static async getCurrentUser(req, res) {
    res.status(200).json({ success: true, data: { user: req.user } });
  }

  // POST /api/verify-email
  static async verifyEmail(req, res, next) {
    try {
      const { email, token, type } = req.body;

      if (type === 'signup_verification') {
        await AuthService.sendVerificationOtp(email);
        return res.status(200).json({ success: true, message: 'Verification code sent to your email' });
      }

      await AuthService.verifyEmail(token);
      res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  // POST /api/verify-email/confirm
  static async confirmEmail(req, res, next) {
    try {
      const { email, code } = req.body;
      await AuthService.confirmEmailOtp(email, code);
      res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      if (error.message === 'Invalid verification code') {
        return res.status(401).json({ success: false, message: error.message });
      }
      if (error.message === 'Verification code expired') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  // POST /api/forgot-password
  static async forgotPassword(req, res, next) {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  // POST /api/reset-password
  static async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);
      res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;