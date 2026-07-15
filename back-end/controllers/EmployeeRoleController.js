const EmployeeRoleService = require('../services/EmployeeRoleService');

class EmployeeRoleController {
  /**
   * Fetch all available employee roles from the database
   */
  static async getAllRoles(req, res, next) {
    try {
      const roles = await EmployeeRoleService.getAllRoles();
      
      res.status(200).json({
        success: true,
        count: roles.length,
        data: roles
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmployeeRoleController;