const bcrypt = require("bcrypt");
const {
  User,
  Estate,
  Unit,
  Payment,
  Notification,
  Tenant,
  sequelize,
} = require("../../../database-config/index");
require("dotenv").config();

const SALT_ROUNDS = 12;

class UserService {
  static async createUser(data) {
    try {
      if (!data.password) throw new Error("Password is required");

      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

      const user = await User.create({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        idNumber: data.idNumber,
        role: data.role || "owner",
        status: data.status || "active",
      });

      user.passwordHash = undefined;
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(id) {
    return User.findByPk(id, { attributes: { exclude: ["passwordHash"] } });
  }

  static async getUserByEmail(email) {
    return User.findOne({
      where: { email },
    });
  }

  static async getAllUsers() {
    return User.findAll({ attributes: { exclude: ["password_hash"] } });
  }

  static async updateUser(id, data) {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");

    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
      data.passwordHash = passwordHash;
      delete data.password;
    }

    await user.update(data);
    user.passwordHash = undefined;
    return user;
  }

  static async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User not found");
    await user.destroy();
    return { message: "User deleted successfully" };
  }

  /**
   * Get comprehensive admin statistics and dashboard metrics
   * @returns {Object} Admin statistics and dashboard metrics
   */
  static async getAdminStats() {
    try {
      const [
        totalUsers,
        totalEstates,
        totalUnits,
        totalTenants,
        totalRevenue,
        recentPayments,
        unitStatusBreakdown,
      ] = await Promise.all([
        // Total Users
        User.count(),

        // Total Estates
        Estate.count(),

        // Total Units
        Unit.count(),

        // Total Tenants (count users with tenant role or from Tenant model)
        this.getTotalTenants(),

        // Total Revenue (last 30 days)
        this.getTotalRevenue(),

        // Recent Payments (last 5)
        this.getRecentPayments(),

        // Unit status breakdown
        this.getUnitStatusBreakdown(),
      ]);

      // Calculate occupancy rate
      const totalOccupied = unitStatusBreakdown.occupied || 0;
      const occupancyRate =
        totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;

      // Get recent notifications
      const recentNotifications = await this.getRecentNotifications();

      return {
        totalUsers,
        totalEstates,
        totalUnits,
        totalTenants,
        totalRevenue: totalRevenue || 0,
        occupancyRate,
        vacantUnits: unitStatusBreakdown.vacant || 0,
        occupiedUnits: unitStatusBreakdown.occupied || 0,
        maintenanceUnits: unitStatusBreakdown.maintenance || 0,
        unitStatusBreakdown,
        recentPayments,
        recentNotifications,
      };
    } catch (error) {
      throw new Error(`Failed to get admin stats: ${error.message}`);
    }
  }

  /**
   * Get total tenants count
   */
  static async getTotalTenants() {
    try {
      // Count users with tenant role
      return User.count({
        where: { role: "tenant" },
      });
    } catch (error) {
      // Fallback: count occupied units
      return Unit.count({
        where: { status: "occupied" },
      });
    }
  }

  /**
   * Get total revenue (last 30 days)
   */
  static async getTotalRevenue() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Payment.sum("amount", {
      where: {
        paymentStatus: "completed",
        paymentDate: {
          [sequelize.Op.gte]: thirtyDaysAgo,
        },
      },
    });

    return result || 0;
  }

  /**
   * Get recent payments
   */
  static async getRecentPayments() {
    return Payment.findAll({
      where: { paymentStatus: "completed" },
      order: [["paymentDate", "DESC"]],
      limit: 5,
      include: [
        {
          model: Unit,
          as: "unit",
          attributes: ["unitNumber"],
        },
        {
          model: Tenant,
          as: "tenant",
          attributes: ["firstName", "lastName"],
        },
      ],
    });
  }

  /**
   * Get unit status breakdown
   */
  static async getUnitStatusBreakdown() {
    const result = await Unit.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    const breakdown = {
      vacant: 0,
      occupied: 0,
      maintenance: 0,
      reserved: 0,
    };

    result.forEach((item) => {
      breakdown[item.status] = parseInt(item.get("count"));
    });

    return breakdown;
  }

  /**
   * Get recent notifications
   */
  static async getRecentNotifications() {
    return Notification.findAll({
      order: [["created_at", "DESC"]],
      limit: 10,
    });
  }
}

module.exports = UserService;
