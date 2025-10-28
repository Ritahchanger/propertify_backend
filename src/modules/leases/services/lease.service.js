const { Lease } = require("../../../database-config/index");

class LeaseService {
  async createLeaseFromApplication(application) {
    const unit = await Unit.findByPk(application.unitId);
    if (!unit) {
      throw new Error("Unit not found");
    }

    // Calculate lease end date based on preferred duration
    const startDate = new Date(application.preferredMoveInDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + application.rentDurationMonths);

    // Check if there's already an active lease for this unit
    const existingActiveLease = await Lease.findOne({
      where: {
        unitId: application.unitId,
        leaseStatus: "active",
        leaseStartDate: { [Op.lte]: new Date() },
        leaseEndDate: { [Op.gte]: new Date() },
      },
    });

    if (existingActiveLease) {
      throw new Error(
        "This unit already has an active lease. Please terminate the existing lease first."
      );
    }

    // Create the lease
    const leaseData = {
      unitId: application.unitId,
      tenantId: application.applicantId,
      applicationId: application.id,
      leaseStartDate: application.preferredMoveInDate,
      leaseEndDate: endDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      monthlyRent: unit.monthlyRent,
      depositPaid: unit.depositAmount,
      leaseStatus: "draft", // Start as draft, can be changed to active when signed
      leaseDocumentUrl: null, // Can be updated later when document is uploaded
      signedAt: null,
    };

    const lease = await Lease.create(leaseData);

    // Update unit status to "occupied"
    await unit.update({ status: "occupied" });

    console.log(`Lease created successfully for application ${application.id}`);
    return lease;
  }

  // ✅ Create new lease (generic method)
  async createLease(data) {
    const lease = await Lease.create(data);
    return lease;
  }

  // ✅ Get all leases
  async getAllLeases() {
    return await Lease.findAll();
  }

  // ✅ Get lease by ID
  async getLeaseById(id) {
    const lease = await Lease.findByPk(id);
    if (!lease) {
      const error = new Error("Lease not found");
      error.status = 404;
      throw error;
    }
    return lease;
  }

  // ✅ Update lease
  async updateLease(id, updates) {
    const lease = await this.getLeaseById(id);
    return await lease.update(updates);
  }

  // ✅ Delete lease
  async deleteLease(id) {
    const lease = await this.getLeaseById(id);
    await lease.destroy();
    return { message: "Lease deleted successfully" };
  }

  async getCurrentTenant(unitId) {
    const currentLease = await Lease.findOne({
      where: {
        unitId: unitId,
        leaseStatus: "active",
        leaseStartDate: { [sequelize.Sequelize.Op.lte]: new Date() },
        leaseEndDate: { [sequelize.Sequelize.Op.gte]: new Date() },
      },
      include: [
        {
          model: User,
          as: "tenant",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ],
    });

    return {
      tenant: currentLease?.tenant || null,
      lease: currentLease,
    };
  }
}

module.exports = new LeaseService();
