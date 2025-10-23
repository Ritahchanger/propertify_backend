const UserService = require("../services/userService");

class UserController {
  /**
   * Get admin dashboard statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAdminStats(req, res) {
    try {
      const stats = await UserService.getAdminStats();

      res.status(200).json({
        success: true,
        message: "Admin statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve admin statistics",
        error: error.message,
      });
    }
  }

  /**
   * Get user statistics by role (admin, owner, tenant)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      const userRole = req.user?.role; // Assuming you have authentication middleware

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // For now, we'll use the admin stats since that's what's implemented
      // You can extend this later to handle different user roles
      const stats = await UserService.getAdminStats();

      res.status(200).json({
        success: true,
        message: "User statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user statistics",
        error: error.message,
      });
    }
  }

  /**
   * Get dashboard statistics for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getDashboardStats(req, res) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // For now, return admin stats
      // You can modify this based on user role later
      const stats = await UserService.getAdminStats();

      res.status(200).json({
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve dashboard statistics",
        error: error.message,
      });
    }
  }
}

module.exports = UserController;
