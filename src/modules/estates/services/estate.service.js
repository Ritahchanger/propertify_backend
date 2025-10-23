const {
  Estate,
  Unit,
  User,
  TenantApplication,
} = require("../../../database-config/index");

class EstateService {
  static async getEstateWithUnits(estateId) {
    const estate = await Estate.findByPk(estateId, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "firstName", "lastName", "email", "phone", "role"],
        },
        {
          model: Unit,
          as: "units",
          include: [
            {
              model: TenantApplication,
              as: "applications",
              where: { applicationStatus: "approved" },
              required: false,
              separate: true,
              limit: 1,
              order: [["appliedAt", "DESC"]],
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
                    "role",
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!estate) {
      throw new Error("Estate not found");
    }

    let estateData = estate.toJSON();

    estateData.units = estateData.units.map((unit) => {
      const approvedApplication = unit.applications?.[0];
      return {
        ...unit,
        tenant: approvedApplication ? approvedApplication.applicant : null,
        applications: undefined,
      };
    });

    estateData.totalUnits = estateData.units.length;

    return estateData;
  }

  // ✅ Get all applications for a specific owner
  static async getApplicationsByOwner(ownerId, page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    
    const applicationWhere = {};
    if (status) {
      applicationWhere.applicationStatus = status;
    }

    const { count, rows } = await TenantApplication.findAndCountAll({
      attributes: [
        ['id', 'applicationId'], // Rename id to applicationId
        'unitId', 
        'applicantId', 
        'preferredMoveInDate', 
        'rentDurationMonths', 
        'applicationStatus',
        'employmentLetterUrl',
        'idCopyUrl',
        'kraPin',
        'emergencyContactName',
        'emergencyContactPhone',
        'rejectionReason',
        'appliedAt',
        'reviewedAt',
        'reviewedBy'
      ],
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "firstName", "lastName", "email", "phone", "role"],
        },
        {
          model: Unit,
          as: "unit",
          attributes: ["id", "unitNumber", "monthlyRent", "bedrooms", "bathrooms"],
          include: [
            {
              model: Estate,
              as: "estate",
              where: { ownerId: ownerId },
              attributes: ["id", "name", "location"],
              include: [
                {
                  model: User,
                  as: "owner",
                  attributes: ["id", "firstName", "lastName", "email"],
                }
              ]
            }
          ]
        }
      ],
      where: applicationWhere,
      order: [['applied_at', 'DESC']],
      limit: limit,
      offset: offset
    });

    const filteredApplications = rows.filter(app => app.unit && app.unit.estate);
    const filteredCount = filteredApplications.length;

    return {
      applications: filteredApplications,
      totalCount: filteredCount,
      totalPages: Math.ceil(filteredCount / limit),
      currentPage: page,
      hasNext: page < Math.ceil(filteredCount / limit),
      hasPrevious: page > 1
    };
  }

  // ✅ Get applications statistics for owner dashboard
  static async getApplicationsStatsByOwner(ownerId) {
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
              attributes: ["id"]
            }
          ]
        }
      ]
    });

    // Filter applications that belong to owner's estates
    const ownerApplications = applications.filter(app => app.unit && app.unit.estate);

    const stats = {
      total: ownerApplications.length,
      pending: ownerApplications.filter(app => app.applicationStatus === 'pending').length,
      approved: ownerApplications.filter(app => app.applicationStatus === 'approved').length,
      rejected: ownerApplications.filter(app => app.applicationStatus === 'rejected').length,
      withdrawn: ownerApplications.filter(app => app.applicationStatus === 'withdrawn').length,
    };

    return stats;
  }

  // ✅ Get applications for a specific estate owned by the owner
  static async getApplicationsByEstate(ownerId, estateId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    // First verify the estate belongs to the owner
    const estate = await Estate.findOne({
      where: { 
        id: estateId, 
        ownerId: ownerId 
      }
    });

    if (!estate) {
      throw new Error("Estate not found or you don't have permission to access it");
    }

    const { count, rows } = await TenantApplication.findAndCountAll({
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "firstName", "lastName", "email", "phone", "role"],
        },
        {
          model: Unit,
          as: "unit",
          where: { estateId: estateId },
          attributes: ["id", "unitNumber", "monthlyRent", "bedrooms", "bathrooms"],
          include: [
            {
              model: Estate,
              as: "estate",
              attributes: ["id", "name", "location"]
            }
          ]
        }
      ],
      order: [['applied_at', 'DESC']],
      limit: limit,
      offset: offset
    });

    return {
      applications: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      hasNext: page < Math.ceil(count / limit),
      hasPrevious: page > 1,
      estate: {
        id: estate.id,
        name: estate.name,
        location: estate.location
      }
    };
  }

  static async createEstate(data) {
    return await Estate.create(data);
  }

  static async getAllEstates() {
    return await Estate.findAll();
  }

  static async getEstateById(id) {
    return await Estate.findByPk(id);
  }

  static async getEstatesByOwnerPaginated(ownerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Estate.findAndCountAll({
        where: {
            ownerId: ownerId
        },
        include: [
            {
                model: User,
                as: "owner",
                attributes: ["id", "firstName", "lastName", "email", "phone", "role"],
            },
            {
                model: Unit,
                as: "units",
                attributes: ["id", "unitNumber", "status", "monthlyRent", "bedrooms", "bathrooms"],
                required: false
            }
        ],
        order: [['created_at', 'DESC']],
        limit: limit,
        offset: offset
    });

    return {
        estates: rows,
        totalCount: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        hasNext: page < Math.ceil(count / limit),
        hasPrevious: page > 1
    };
  }



  static async getApplicationById(applicationId) {
    const application = await TenantApplication.findByPk(applicationId, {
        include: [
            {
                model: User,
                as: "applicant",
                attributes: ["id", "firstName", "lastName", "email", "phone", "role"],
            },
            {
                model: Unit,
                as: "unit",
                attributes: ["id", "unitNumber", "monthlyRent", "bedrooms", "bathrooms"],
                include: [
                    {
                        model: Estate,
                        as: "estate",
                        attributes: ["id", "name", "location"],
                        include: [
                            {
                                model: User,
                                as: "owner",
                                attributes: ["id", "firstName", "lastName", "email"],
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (!application) {
        throw new Error("Application not found");
    }

    return application;
}


static async verifyApplicationOwnership(applicationId, ownerId) {
  const application = await TenantApplication.findByPk(applicationId, {
      include: [
          {
              model: Unit,
              as: "unit",
              attributes: ["estateId"],
              include: [
                  {
                      model: Estate,
                      as: "estate",
                      attributes: ["ownerId"]
                  }
              ]
          }
      ]
  });

  if (!application || !application.unit || !application.unit.estate) {
      return false;
  }

  return application.unit.estate.ownerId === ownerId;
}

static async updateApplicationStatus(applicationId, status, reviewedBy, rejectionReason = null) {
      const application = await TenantApplication.findByPk(applicationId);
      
      if (!application) {
          throw new Error("Application not found");
      }

      const validStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
      if (!validStatuses.includes(status)) {
          throw new Error("Invalid application status");
      }

      application.applicationStatus = status;
      application.reviewedBy = reviewedBy;
      application.reviewedAt = new Date();
      
      if (status === "rejected" && rejectionReason) {
          application.rejectionReason = rejectionReason;
      }

      await application.save();

      return application;
}



}

module.exports = EstateService;