const User = require('../models/User');
const EmployeeRole = require('../models/EmployeeRole');

const normalizeUserPayload = (payload = {}) => ({
  name: payload.name?.trim(),
  email: payload.email?.trim().toLowerCase(),
  password: payload.password, // Mongoose pre-save hook will handle hashing if modified
  emailVerified: Boolean(payload.emailVerified ?? false),
  
  // FIXED: Allow employeeRole to pass through during user creation
  employeeRole: payload.employeeRole || undefined,

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
    
    // FIXED: Added .populate('employeeRole') to pull the full role details
    return User.find(filters).sort(sort).populate('employeeRole');
  }

  static async getUserById(id) {
    // FIXED: Added .populate('employeeRole') to ensure single fetches include the role details
    return User.findById(id).populate('employeeRole');
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
    if (payload.email !== undefined) user.email = payload.email.trim().toLowerCase();
    if (payload.emailVerified !== undefined) user.emailVerified = Boolean(payload.emailVerified);
    
    // If the dashboard allows password changes, this correctly flags it for re-hashing
    if (payload.password) {
      user.password = payload.password;
    }

    // --- EMPLOYEE ROLE UPDATE LOGIC ---
    if (payload.employeeRole !== undefined) {
      const roleId = payload.employeeRole;

      if (!roleId || roleId === 'null') {
        // Clear the employee role association
        user.employeeRole = null;
        
        // Revert system role to 'user' if they were previously an 'employee' 
        // (We don't demote 'admin' accounts automatically)
        if (user.role === 'employee') {
          user.role = 'user';
        }
      } else {
        // Verify that the EmployeeRole exists in the database before assigning
        const roleExists = await EmployeeRole.findById(roleId);
        if (!roleExists) {
          throw new Error('The specified employee role does not exist.');
        }

        user.employeeRole = roleExists._id;

        // Auto-upgrade system role to 'employee' if they are a regular 'user'
        if (user.role === 'user') {
          user.role = 'employee';
        }
      }
    }

    // Allow manual role overrides (e.g. manually promoting to 'admin') if explicitly passed
    if (payload.role !== undefined) {
      user.role = payload.role.trim();
    }

    return user.save();
  }

  static async deleteUser(id) {
    return User.findByIdAndDelete(id);
  }
}

module.exports = { UserService, normalizeUserPayload };