const User = require('../models/User');
const TokenService = require('./TokenService');
const EmailService = require('./EmailService');
const OtpService = require('./OtpService');
const crypto = require('crypto');

const normalizeUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || 'user',
  emailVerified: Boolean(user.emailVerified),
  isVerified: Boolean(user.emailVerified),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

class AuthService {
  // Register a new user
  static async register(userData) {
    const { name, email, password, password_confirmation } = userData;

    // Password confirmation (already validated in controller)
    if (password !== password_confirmation) {
      throw new Error('Passwords do not match');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const verificationOtp = OtpService.generateOtpCode();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const user = new User({
      name,
      email,
      password,
      verificationOtp,
      verificationOtpExpires: otpExpires,
    });
    await user.save();

    EmailService.sendVerificationEmail(email, name, verificationOtp).catch(console.error);

    // Generate JWT token
    const jwtToken = TokenService.generateToken(user._id);

    return {
      user: normalizeUserPayload(user),
      token: jwtToken,
      token_type: 'Bearer',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  // Login user
  static async login(email, password, rememberMe = false) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Check if email is verified (optional – you can skip this)
    // if (!user.emailVerified) {
    //   throw new Error('Please verify your email first');
    // }

    // Generate token
    const expiresIn = rememberMe ? '7d' : '1d';
    const jwtToken = TokenService.generateToken(user._id, expiresIn);

    return {
      user: normalizeUserPayload(user),
      token: jwtToken,
      token_type: 'Bearer',
      expires_at: new Date(Date.now() + (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  // Logout – just clear cookie (controller handles it)

  // Verify email
  static async verifyEmail(token) {
    try {
      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw Object.assign(new Error('Invalid or expired verification token'), { status: 400 });
      }

      user.emailVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
      return user;
    } catch (error) {
      if (error.name === 'CastError') {
        throw Object.assign(new Error('Malformed verification token'), { status: 400 });
      }

      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        throw Object.assign(new Error('Verification service temporarily unavailable'), { status: 503 });
      }

      throw error;
    }
  }

  static async sendVerificationOtp(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw Object.assign(new Error('User not found'), { status: 404 });
      }

      const verificationOtp = OtpService.generateOtpCode();
      user.verificationOtp = verificationOtp;
      user.verificationOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();

      await EmailService.sendVerificationEmail(user.email, user.name, verificationOtp);
      return true;
    } catch (error) {
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        throw Object.assign(new Error('Verification email service temporarily unavailable'), { status: 503 });
      }

      throw error;
    }
  }

  static async confirmEmailOtp(email, code) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw Object.assign(new Error('User not found'), { status: 404 });
      }

      if (!user.verificationOtp || OtpService.isOtpExpired(user.verificationOtpExpires)) {
        throw Object.assign(new Error('Verification code expired'), { status: 410 });
      }

      if (String(user.verificationOtp) !== String(code).trim()) {
        throw Object.assign(new Error('Invalid verification code'), { status: 401 });
      }

      user.emailVerified = true;
      user.verificationOtp = undefined;
      user.verificationOtpExpires = undefined;
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        throw Object.assign(new Error('Verification service temporarily unavailable'), { status: 503 });
      }

      throw error;
    }
  }

  // Forgot password – send reset email
  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await EmailService.sendPasswordResetEmail(email, resetToken);
    return true;
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return user;
  }

  // Get current user from token (used by middleware)
  static async getUserById(userId) {
    return User.findById(userId).select('-password -verificationToken -passwordResetToken');
  }

  static async refreshUserState(userId) {
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }

    return normalizeUserPayload(user);
  }
}

module.exports = AuthService;