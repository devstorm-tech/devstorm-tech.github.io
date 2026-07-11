const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    verificationOtp: {
      type: String,
      required: true,
    },
    verificationOtpExpires: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000),
      index: { expires: '0s' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PendingUser', pendingUserSchema);
