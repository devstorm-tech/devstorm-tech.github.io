const User = require('../models/User');

const normalizeUserPayload = (payload = {}) => ({
  name: payload.name?.trim(),
  email: payload.email?.trim().toLowerCase(),
  password: payload.password, // Mongoose pre-save hook will handle hashing if modified
  emailVerified: Boolean(payload.emailVerified ?? false),
  verificationToken: payload.verificationToken || undefined,
  verificationTokenExpires: payload.verificationTokenExpires || undefined,
  verificationOtp: payload.verificationOtp || undefined,
  verificationOtpExpires: payload.verificationOtpExpires || undefined,
  passwordResetToken: payload.passwordResetToken || undefined,
  passwordResetExpires: payload.passwordResetExpires || undefined,
});

class UserService {
  static async listUsers(query = {}) {
    const filters = {};

    if (query.search) {
      filters.$or = [
        { name: new RegExp(query.search, 'i') },
        { email: new RegExp(query.search, 'i') }
      ];
    }

    if (query.verified === 'true') {
      filters.emailVerified = true;
    }

    const sort = query.sort === 'newest' ? { createdAt: -1 } : { name: 1 };
    return User.find(filters).sort(sort); // Password field is auto-excluded by schema select: false
  }

  static async getUserById(id) {
    return User.findById(id);
  }

  static async getUserByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }

  static async createUser(payload) {
    const data = normalizeUserPayload(payload);
    const user = new User(data);
    return user.save();
  }

  static async updateUser(id, payload) {
    // Crucial adjustment for models using pre('save') hooks:
    // Mongoose update queries like findByIdAndUpdate do NOT trigger pre('save') hooks normally.
    // To update passwords securely or run validations properly, we find the document first.
    const user = await User.findById(id);
    if (!user) return null;

    if (payload.name !== undefined) user.name = payload.name.trim();
    if (payload.role !== undefined) user.role = payload.role.trim();
    if (payload.email !== undefined) user.email = payload.email.trim().toLowerCase();
    if (payload.emailVerified !== undefined) user.emailVerified = Boolean(payload.emailVerified);
    
    // If the dashboard allows password changes, this correctly flags it for re-hashing
    if (payload.password) {
      user.password = payload.password;
    }

    return user.save();
  }

  static async deleteUser(id) {
    return User.findByIdAndDelete(id);
  }
}

module.exports = { UserService, normalizeUserPayload };