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
}

module.exports = EstateService;
