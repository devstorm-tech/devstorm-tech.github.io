const User = require('../models/User');
const TokenService = require('./TokenService');
const EmailService = require('./EmailService');
const OtpService = require('./OtpService');
const crypto = require('crypto');

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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      token: jwtToken,
      token_type: 'Bearer',
      expires_at: new Date(Date.now() + (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  // Logout – just clear cookie (controller handles it)

  // Verify email
  static async verifyEmail(token) {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    return user;
  }

  static async sendVerificationOtp(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const verificationOtp = OtpService.generateOtpCode();
    user.verificationOtp = verificationOtp;
    user.verificationOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await EmailService.sendVerificationEmail(user.email, user.name, verificationOtp);
    return true;
  }

  static async confirmEmailOtp(email, code) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.verificationOtp || OtpService.isOtpExpired(user.verificationOtpExpires)) {
      throw new Error('Verification code expired');
    }

    if (String(user.verificationOtp) !== String(code).trim()) {
      throw new Error('Invalid verification code');
    }

    user.emailVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();
    return user;
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
}

module.exports = AuthService;