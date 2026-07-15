const EmployeeRole = require('../models/EmployeeRole');

class EmployeeRoleService {
  /**
   * Fetch all available employee roles, sorted by hierarchy tier
   */
  static async getAllRoles() {
    // Finds all roles and sorts them by tier (0 = CEO first, 3 = Employee last)
    return await EmployeeRole.find({}).sort({ tier: 1 });
  }
}

module.exports = EmployeeRoleService;