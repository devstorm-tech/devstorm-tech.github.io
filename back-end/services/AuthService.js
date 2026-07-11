const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
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
  // Register a new user in a pending state
  static async register(userData) {
    const { name, email, password, password_confirmation } = userData;

    if (password !== password_confirmation) {
      throw Object.assign(new Error('Passwords do not match'), { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw Object.assign(new Error('Email already registered'), { status: 409 });
    }

    const existingPending = await PendingUser.findOne({ email });
    if (existingPending) {
      await PendingUser.deleteOne({ _id: existingPending._id });
    }

    const verificationOtp = OtpService.generateOtpCode();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    const passwordHash = await bcrypt.hash(password, 10);

    const pendingUser = new PendingUser({
      name,
      email,
      passwordHash,
      verificationOtp,
      verificationOtpExpires: otpExpires,
    });

    await pendingUser.save();
    await EmailService.sendVerificationEmail(email, name, verificationOtp).catch(console.error);

    return {
      pending: true,
      message: 'Verification code sent. Complete verification to finish registration.',
      expiresAt: otpExpires.toISOString(),
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

  static async verifyOtp(email, code) {
    try {
      const pendingUser = await PendingUser.findOne({ email });
      if (!pendingUser) {
        throw Object.assign(new Error('Pending registration not found'), { status: 404 });
      }

      if (OtpService.isOtpExpired(pendingUser.verificationOtpExpires)) {
        await PendingUser.deleteOne({ _id: pendingUser._id });
        throw Object.assign(new Error('Invalid or expired verification code. Please try again.'), { status: 400 });
      }

      if (String(pendingUser.verificationOtp) !== String(code).trim()) {
        throw Object.assign(new Error('Invalid or expired verification code. Please try again.'), { status: 400 });
      }

      const session = await PendingUser.startSession();
      let permanentUser;

      try {
        session.startTransaction();

        permanentUser = new User({
          name: pendingUser.name,
          email: pendingUser.email,
          password: pendingUser.passwordHash,
          emailVerified: true,
        });

        await permanentUser.save({ session });
        await PendingUser.deleteOne({ _id: pendingUser._id }, { session });
        await session.commitTransaction();
      } catch (transactionError) {
        await session.abortTransaction();
        throw transactionError;
      } finally {
        session.endSession();
      }

      const jwtToken = TokenService.generateToken(permanentUser._id);
      return {
        user: normalizeUserPayload(permanentUser),
        token: jwtToken,
        token_type: 'Bearer',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } catch (error) {
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        throw Object.assign(new Error('Verification service temporarily unavailable'), { status: 503 });
      }

      throw error;
    }
  }

  static async sendVerificationOtp(email) {
    try {
      let pendingUser = await PendingUser.findOne({ email });
      if (!pendingUser) {
        const user = await User.findOne({ email });
        if (!user) {
          throw Object.assign(new Error('User not found'), { status: 404 });
        }

        pendingUser = new PendingUser({
          name: user.name,
          email: user.email,
          passwordHash: user.password,
          verificationOtp: OtpService.generateOtpCode(),
          verificationOtpExpires: new Date(Date.now() + 15 * 60 * 1000),
        });
      }

      const verificationOtp = OtpService.generateOtpCode();
      pendingUser.verificationOtp = verificationOtp;
      pendingUser.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
      await pendingUser.save();

      await EmailService.sendVerificationEmail(pendingUser.email, pendingUser.name, verificationOtp);
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