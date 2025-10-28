<<<<<<< HEAD
const { TenantApplication, User, Estate, Unit,Lease } = require("../../../database-config/index");
=======
const { TenantApplication, User, Estate, Unit } = require("../../../database-config/index");
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367

const { transporter } = require("../../../shared/utils/transporter");

const { Op } = require("sequelize");

<<<<<<< HEAD
const leaseService = require("../../leases/services/lease.service");


class TenantService {

  async createApplication(data) {

=======
class TenantService {

  async createApplication(data) {
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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

<<<<<<< HEAD
  async updateApplicationStatus(id, status, reviewedBy, rejectionReason = null) {
    const application = await this.getApplicationById(id);
  
    // Store the previous status before updating
    const previousStatus = application.applicationStatus;
  
    application.applicationStatus = status;
    application.reviewedBy = reviewedBy;
    application.reviewedAt = new Date();
  
    if (status === "rejected" && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }
  
    await application.save();
  
    let subject, text;
  
    // Create lease only when status changes to "approved"
    if (status === "approved" && previousStatus !== "approved") {
      // Import or access your leaseService
      const LeaseService = require('./leaseService'); // Adjust path as needed
      const leaseService = new LeaseService();
      
      await leaseService.createLeaseFromApplication(application);
    }
  
    if (status === "approved") {
      subject = "Application Approved 🎉";
      text = `Congratulations! Your application for unit ${application.unitId} has been approved. A lease has been created and our office will contact you for the next steps.`;
=======
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
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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
<<<<<<< HEAD
  
    await this.sendEmail(application.email, subject, text);
  
=======

    await this.sendEmail(application.email, subject, text);

>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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

<<<<<<< HEAD
  async getTenantsByOwner(ownerId, page = 1, limit = 10, status = null) {
    
    const offset = (page - 1) * limit;
  
    const applicationWhere = {
      applicationStatus: "approved", // Only get approved applications (active tenants)
    };
  
=======
  static async getTenantsByOwner(ownerId, page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;

    const applicationWhere = {
      applicationStatus: "approved", // Only get approved applications (active tenants)
    };

>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
    // If status filter is provided, adjust the query
    if (status === "pending") {
      applicationWhere.applicationStatus = "pending";
    } else if (status === "rejected") {
      applicationWhere.applicationStatus = "rejected";
    }
<<<<<<< HEAD
  
=======

>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
    const { count, rows } = await TenantApplication.findAndCountAll({
      attributes: [
        "id",
        "preferredMoveInDate",
        "rentDurationMonths",
        "applicationStatus",
        "employmentLetterUrl",
        "idCopyUrl",
        "kraPin",
        "emergencyContactName",
        "emergencyContactPhone",
        "appliedAt",
        "reviewedAt",
      ],
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
<<<<<<< HEAD
            // Remove "createdAt" - it's automatically included by Sequelize
            // or use the actual field name if you need it
=======
            "createdAt",
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
          ],
          where: {
            role: "tenant", // Ensure we're only getting tenant users
          },
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
<<<<<<< HEAD
            // Remove fields that don't exist in your Unit model
            // "squareFootage", 
            // "amenities",
=======
            "squareFootage",
            "amenities",
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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
      where: applicationWhere,
      order: [
        ["applicationStatus", "ASC"],
        ["appliedAt", "DESC"],
      ],
      limit: limit,
      offset: offset,
<<<<<<< HEAD
      distinct: true,
    });
  
=======
      distinct: true, // Important for count with multiple includes
    });

>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
    // Transform the data to a more tenant-focused structure
    const tenants = rows.map((application) =>
      this.transformToTenantStructure(application)
    );
<<<<<<< HEAD
  
=======

>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
    return {
      tenants: tenants,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      hasNext: page < Math.ceil(count / limit),
      hasPrevious: page > 1,
    };
  }

  /**
   * Get tenant statistics for owner dashboard
   * @param {string} ownerId - The owner's UUID
   * @returns {Promise<Object>} Tenant statistics
   */
<<<<<<< HEAD
  async getTenantStatsByOwner(ownerId) {
=======
  static async getTenantStatsByOwner(ownerId) {
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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
<<<<<<< HEAD
  async getTenantDetails(tenantId, ownerId) {
=======
  static async getTenantDetails(tenantId, ownerId) {
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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
<<<<<<< HEAD
  async getTenantsByEstate(ownerId, estateId, page = 1, limit = 10) {
=======
  static async getTenantsByEstate(ownerId, estateId, page = 1, limit = 10) {
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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
<<<<<<< HEAD
  async searchTenants(ownerId, searchTerm, page = 1, limit = 10) {
=======
  static async searchTenants(ownerId, searchTerm, page = 1, limit = 10) {
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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
<<<<<<< HEAD
  transformToTenantStructure(application) {
=======
  static transformToTenantStructure(application) {
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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
<<<<<<< HEAD
  async getUpcomingLeaseExpirations(ownerId, daysThreshold = 30) {
=======
  static async getUpcomingLeaseExpirations(ownerId, daysThreshold = 30) {
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
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
