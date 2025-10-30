const {
  TenantApplication,
  User,
  Estate,
  Unit,
  Lease,
} = require("../../../database-config/index");

const { transporter } = require("../../../shared/utils/transporter");

const { Op } = require("sequelize");

const leaseService = require("../../leases/services/lease.service");

const tenantUtil = require("../../../shared/utils/formatTenantData");

class TenantService {
  async createApplication(data) {
    const applicantId = data.applicantId;

    const user = await User.findByPk(applicantId);

    if (!user) {
      throw new Error("Tenant not found");
    }

    if (user.role !== "tenant") {
      throw new Error("Only users with tenant role can submit applications");
    }

    const existingApplication = await TenantApplication.findOne({
      where: {
        applicantId: applicantId,

        unitId: data.unitId,

        applicationStatus: {
          [Op.in]: ["pending", "approved"],
        },
      },
    });

    if (existingApplication) {
      throw new Error(
        `You already have a${existingApplication.applicationStatus} application for this unit`
      );
    }

    const application = await TenantApplication.create(data);

    await this.sendEmail(
      data.email,
      "Application Received",
      `Hello, your application for unit ${data.unitId} has been received. Our team will review and get back to you soon.`
    );

    return application;
  }

  async getApplications() {
    return await TenantApplication.findAll();
  }

  async getApplicationById(id) {
    const application = await TenantApplication.findByPk(id);
    if (!application) {
      const error = new Error("Application not found");
      error.statusCode = 404;
      throw error;
    }
    return application;
  }

  async updateApplicationStatus(
    id,
    status,
    reviewedBy,
    rejectionReason = null
  ) {
    const application = await this.getApplicationById(id);

    application.applicationStatus = status;
    application.reviewedBy = reviewedBy;
    application.reviewedAt = new Date();

    if (status === "rejected" && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    let subject, text;
    if (status === "approved") {
      subject = "Application Approved 🎉";
      text = `Congratulations! Your application for unit ${application.unitId} has been approved. Our office will contact you for the next steps.`;
    } else if (status === "rejected") {
      subject = "Application Rejected ❌";
      text = `Unfortunately, your application was rejected. Reason: ${application.rejectionReason || "Not specified."}`;
    } else if (status === "withdrawn") {
      subject = "Application Withdrawn";
      text = "Your application has been withdrawn as per your request.";
    } else {
      subject = "Application Update";
      text = `Your application status is now: ${status}`;
    }

    await this.sendEmail(application.email, subject, text);

    await this.sendEmail(application.email, subject, text);
    return application;
  }

  async sendEmail(to, subject, text) {
    try {
      await transporter.sendMail({
        from: `"CYBER GUARD" <${process.env.COMPANY_EMAIL}>`,
        to,
        subject,
        text,
      });
    } catch (err) {
      console.error("Email sending failed:", err);
    }
  }

  async getTenantsByOwner(ownerId, page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows: applications } =
        await TenantApplication.findAndCountAll({
          where: {
            ...(filters.status && { applicationStatus: filters.status }),
            ...(filters.search && {
              [Op.or]: [
                {
                  "$applicant.firstName$": {
                    [Op.iLike]: `%${filters.search}%`,
                  },
                },
                {
                  "$applicant.lastName$": { [Op.iLike]: `%${filters.search}%` },
                },
                { "$applicant.email$": { [Op.iLike]: `%${filters.search}%` } },
                { "$unit.unitNumber$": { [Op.iLike]: `%${filters.search}%` } },
              ],
            }),
          },
          include: [
            {
              model: User,
              as: "applicant",
              attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "phone",
                "idNumber",
                "role",
                "status",
                "created_at",
                "updated_at",
              ],
              where: {
                role: "tenant",
              },
              required: true,
            },
            {
              model: Unit,
              as: "unit",
              attributes: [
                "id",
                "unitNumber",
                "bedrooms",
                "bathrooms",
                "monthlyRent",
                "unitType",
                "status",
                "floorArea",
              ],
              include: [
                {
                  model: Estate,
                  as: "estate",
                  attributes: [
                    "id",
                    "name",
                    "location",
                    "description",
                    "status",
                  ],
                  where: {
                    ownerId,
                    ...(filters.estateId && { id: filters.estateId }),
                  },
                  required: true,
                  include: [
                    {
                      model: User,
                      as: "owner",
                      attributes: [
                        "id",
                        "firstName",
                        "lastName",
                        "email",
                        "phone",
                      ],
                    },
                  ],
                },
              ],
              required: true,
            },
          ],
          order: [
            ["applicationStatus", "ASC"],
            ["appliedAt", "DESC"],
          ],
          limit: limit,
          offset: offset,
          distinct: true,
        });

      const tenants = applications.map((application) =>
        tenantUtil.formatTenantData(application)
      );

      const totalPages = Math.ceil(count / limit);
      const hasNext = page < totalPages;
      const hasPrevious = page > 1;

      return {
        tenants,
        totalCount: count,
        totalPages,
        currentPage: page,
        hasNext,
        hasPrevious,
      };
    } catch (error) {
      console.error("Error in getTenantsByOwner:", error);
      throw new Error(`Failed to fetch tenants: ${error.message}`);
    }
  }

  /**
   * Get tenant statistics for owner dashboard
   * @param {string} ownerId - The owner's UUID
   * @returns {Promise<Object>} Tenant statistics
   */
  async getTenantStatsByOwner(ownerId) {
    const applications = await TenantApplication.findAll({
      include: [
        {
          model: Unit,
          as: "unit",
          attributes: ["id"],
          include: [
            {
              model: Estate,
              as: "estate",
              where: { ownerId: ownerId },
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    // Filter applications that belong to owner's estates
    const ownerApplications = applications.filter(
      (app) => app.unit && app.unit.estate
    );

    const stats = {
      totalTenants: ownerApplications.filter(
        (app) => app.applicationStatus === "approved"
      ).length,
      pendingApplications: ownerApplications.filter(
        (app) => app.applicationStatus === "pending"
      ).length,
      activeTenants: ownerApplications.filter(
        (app) => app.applicationStatus === "approved"
      ).length,
      rejectedApplications: ownerApplications.filter(
        (app) => app.applicationStatus === "rejected"
      ).length,
      withdrawnApplications: ownerApplications.filter(
        (app) => app.applicationStatus === "withdrawn"
      ).length,
      totalApplications: ownerApplications.length,
    };

    // Calculate occupancy rate if there are units
    const totalUnits = await Unit.count({
      include: [
        {
          model: Estate,
          as: "estate",
          where: { ownerId: ownerId },
          attributes: [],
        },
      ],
    });

    stats.occupancyRate =
      totalUnits > 0
        ? ((stats.activeTenants / totalUnits) * 100).toFixed(1)
        : 0;

    return stats;
  }

  /**
   * Get detailed information for a specific tenant
   * @param {string} tenantId - The tenant's UUID
   * @param {string} ownerId - The owner's UUID (for authorization)
   * @returns {Promise<Object>} Detailed tenant information
   */

  async getTenantDetails(tenantId, ownerId) {
    const application = await TenantApplication.findOne({
      where: {
        applicantId: tenantId,
        applicationStatus: "approved",
      },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "idNumber",
            "role",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
        {
          model: Unit,
          as: "unit",
          attributes: [
            "id",
            "unitNumber",
            "monthlyRent",
            "bedrooms",
            "bathrooms",
            "status",
            "squareFootage",
            "amenities",
            "description",
          ],
          include: [
            {
              model: Estate,
              as: "estate",
              where: { ownerId: ownerId },
              attributes: [
                "id",
                "name",
                "location",
                "description",
                "totalUnits",
                "status",
                "createdAt",
              ],
              include: [
                {
                  model: User,
                  as: "owner",
                  attributes: ["id", "firstName", "lastName", "email", "phone"],
                },
              ],
            },
          ],
        },
      ],
      order: [["appliedAt", "DESC"]],
    });

    if (!application) {
      throw new Error(
        "Tenant not found or you don't have permission to access this tenant"
      );
    }

    return this.transformToTenantStructure(application);
  }

  /**
   * Get tenants by estate for a specific owner
   * @param {string} ownerId - The owner's UUID
   * @param {string} estateId - The estate's UUID
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of records per page
   * @returns {Promise<Object>} Paginated tenants for the specific estate
   */

  async getTenantsByEstate(ownerId, estateId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // Verify the estate belongs to the owner
    const estate = await Estate.findOne({
      where: {
        id: estateId,
        ownerId: ownerId,
      },
    });

    if (!estate) {
      throw new Error(
        "Estate not found or you don't have permission to access it"
      );
    }

    const { count, rows } = await TenantApplication.findAndCountAll({
      where: {
        applicationStatus: "approved",
      },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "idNumber",
            "role",
            "status",
          ],
        },
        {
          model: Unit,
          as: "unit",
          where: { estateId: estateId },
          attributes: [
            "id",
            "unitNumber",
            "monthlyRent",
            "bedrooms",
            "bathrooms",
            "status",
          ],
          include: [
            {
              model: Estate,
              as: "estate",
              attributes: ["id", "name", "location"],
            },
          ],
        },
      ],
      order: [["appliedAt", "DESC"]],
      limit: limit,
      offset: offset,
      distinct: true,
    });

    const tenants = rows.map((application) =>
      this.transformToTenantStructure(application)
    );

    return {
      tenants: tenants,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      hasNext: page < Math.ceil(count / limit),
      hasPrevious: page > 1,
      estate: {
        id: estate.id,
        name: estate.name,
        location: estate.location,
      },
    };
  }

  /**
   * Search tenants by name, email, or unit number for a specific owner
   * @param {string} ownerId - The owner's UUID
   * @param {string} searchTerm - Search term
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of records per page
   * @returns {Promise<Object>} Paginated search results
   */

  async searchTenants(ownerId, searchTerm, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { Op } = require("sequelize");

    const { count, rows } = await TenantApplication.findAndCountAll({
      where: {
        applicationStatus: "approved",
        [Op.or]: [
          { "$applicant.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$applicant.lastName$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$applicant.email$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$unit.unitNumber$": { [Op.iLike]: `%${searchTerm}%` } },
        ],
      },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "idNumber",
            "role",
            "status",
          ],
        },
        {
          model: Unit,
          as: "unit",
          attributes: [
            "id",
            "unitNumber",
            "monthlyRent",
            "bedrooms",
            "bathrooms",
            "status",
          ],
          include: [
            {
              model: Estate,
              as: "estate",
              where: { ownerId: ownerId },
              attributes: ["id", "name", "location"],
            },
          ],
        },
      ],
      order: [["appliedAt", "DESC"]],
      limit: limit,
      offset: offset,
      distinct: true,
    });

    const tenants = rows.map((application) =>
      this.transformToTenantStructure(application)
    );

    return {
      tenants: tenants,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      hasNext: page < Math.ceil(count / limit),
      hasPrevious: page > 1,
      searchTerm: searchTerm,
    };
  }

  /**
   * Transform application data to tenant-focused structure
   * @param {Object} application - TenantApplication instance
   * @returns {Object} Transformed tenant data
   */

  transformToTenantStructure(application) {
    const appData = application.toJSON ? application.toJSON() : application;

    return {
      tenantId: appData.applicant.id,
      applicationId: appData.id,
      personalInfo: {
        firstName: appData.applicant.firstName,
        lastName: appData.applicant.lastName,
        fullName: `${appData.applicant.firstName} ${appData.applicant.lastName}`,
        email: appData.applicant.email,
        phone: appData.applicant.phone,
        idNumber: appData.applicant.idNumber,
        userStatus: appData.applicant.status,
        accountCreated: appData.applicant.createdAt,
      },
      applicationDetails: {
        preferredMoveInDate: appData.preferredMoveInDate,
        rentDurationMonths: appData.rentDurationMonths,
        applicationStatus: appData.applicationStatus,
        employmentLetterUrl: appData.employmentLetterUrl,
        idCopyUrl: appData.idCopyUrl,
        kraPin: appData.kraPin,
        appliedAt: appData.appliedAt,
        reviewedAt: appData.reviewedAt,
      },
      emergencyContact: {
        name: appData.emergencyContactName,
        phone: appData.emergencyContactPhone,
      },
      unitDetails: {
        unitId: appData.unit.id,
        unitNumber: appData.unit.unitNumber,
        monthlyRent: appData.unit.monthlyRent,
        bedrooms: appData.unit.bedrooms,
        bathrooms: appData.unit.bathrooms,
        unitStatus: appData.unit.status,
        squareFootage: appData.unit.squareFootage,
        amenities: appData.unit.amenities,
      },
      estateDetails: {
        estateId: appData.unit.estate.id,
        estateName: appData.unit.estate.name,
        location: appData.unit.estate.location,
        description: appData.unit.estate.description,
        totalUnits: appData.unit.estate.totalUnits,
        estateStatus: appData.unit.estate.status,
      },
      ownerDetails: appData.unit.estate.owner
        ? {
            ownerId: appData.unit.estate.owner.id,
            ownerName: `${appData.unit.estate.owner.firstName} ${appData.unit.estate.owner.lastName}`,
            ownerEmail: appData.unit.estate.owner.email,
            ownerPhone: appData.unit.estate.owner.phone,
          }
        : null,
    };
  }

  /**
   * Get upcoming lease expirations for an owner
   * @param {string} ownerId - The owner's UUID
   * @param {number} daysThreshold - Number of days to look ahead
   * @returns {Promise<Array>} Tenants with upcoming lease expirations
   */

  async getUpcomingLeaseExpirations(ownerId, daysThreshold = 30) {
    const { Op } = require("sequelize");
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    const applications = await TenantApplication.findAll({
      where: {
        applicationStatus: "approved",
        preferredMoveInDate: {
          [Op.lte]: thresholdDate,
          [Op.gte]: today,
        },
      },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
        {
          model: Unit,
          as: "unit",
          attributes: ["id", "unitNumber", "monthlyRent"],
          include: [
            {
              model: Estate,
              as: "estate",
              where: { ownerId: ownerId },
              attributes: ["id", "name", "location"],
            },
          ],
        },
      ],
      order: [["preferredMoveInDate", "ASC"]],
    });

    return applications.map((app) => this.transformToTenantStructure(app));
  }
}

module.exports = new TenantService();
