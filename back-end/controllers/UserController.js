const { UserService } = require('../services/UserService');

class UserController {
  static async listUsers(req, res, next) {
    try {
      const users = await UserService.listUsers(req.query);
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req, res, next) {
    try {
      const user = await UserService.createUser(req.body);
      
      // Convert mongoose document to a plain object to ensure 
      // security tokens aren't sent back accidentally in the public response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.verificationToken;
      delete userResponse.verificationOtp;

      res.status(201).json({ success: true, data: userResponse });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const user = await UserService.deleteUser(req.params.id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
