const { Unit, Estate } = require("../../../database-config/index");

class UnitService {
  async createUnit(data) {
    return await Unit.create(data);
  }

  async getAllUnits() {
    return await Unit.findAll();
  }

  async getUnitById(id) {
    return await Unit.findByPk(id);
  }

  async updateUnit(id, data) {
    const unit = await Unit.findByPk(id);
    if (!unit) return null;
    await unit.update(data);
    return unit;
  }

  async deleteUnit(id) {
    const unit = await Unit.findByPk(id);
    if (!unit) return null;
    await unit.destroy();
    return unit;
  }

  async getOwnerVacantUnits(ownerId) {
    return await Unit.findAll({
      where: {
        status: "vacant",
      },
      include: [
        {
          model: Estate,
          as: "estate",
          where: { ownerId },
          attributes: ["id", "name", "location", "status", "totalUnits"],
        },
      ],
      attributes: [
        "id",
        "unitNumber",
        "bedrooms",
        "bathrooms",
        "monthlyRent",
        "depositAmount",
        "unitType",
        "floorArea",
        "status",
        "description",
        "created_at",
        "updated_at",
      ],
      order: [
        ["estate", "name", "ASC"],
        ["unitNumber", "ASC"],
      ],
    });
  }

  async getTenantUnitsWithDetails(tenantId) {
    try {
      const tenant = await User.findByPk(tenantId, {
        attributes: ["id", "firstName", "lastName", "email", "phone"],
      });

      if (!tenant) {
        throw new Error("Tenant not found");
      }

      const units = await Unit.findAll({
        include: [
          {
            model: Estate,
            as: "estate",
            attributes: ["id", "name", "location", "description"],
            include: [
              {
                model: User,
                as: "owner",
                attributes: ["id", "firstName", "lastName", "email", "phone"],
              },
            ],
          },
          {
            model: Lease,
            as: "leases",
            where: { tenantId },
            required: true,
            attributes: [
              "id",
              "startDate",
              "endDate",
              "rentAmount",
              "status",
              "securityDeposit",
              "created_at",
            ],
          },
        ],
        attributes: [
          "id",
          "unitNumber",
          "bedrooms",
          "bathrooms",
          "monthlyRent",
          "depositAmount",
          "unitType",
          "floorArea",
          "status",
          "description",
        ],
        order: [
          ["estate", "name", "ASC"],
          ["unitNumber", "ASC"],
        ],
      });

      // Transform the data for better client response
      const transformedUnits = units.map((unit) => {
        const activeLease = unit.leases.find(
          (lease) => lease.status === "active"
        );
        const leaseHistory = unit.leases.filter(
          (lease) => lease.status !== "active"
        );

        return {
          unit: {
            id: unit.id,
            unitNumber: unit.unitNumber,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            monthlyRent: unit.monthlyRent,
            depositAmount: unit.depositAmount,
            unitType: unit.unitType,
            floorArea: unit.floorArea,
            status: unit.status,
            description: unit.description,
          },
          estate: unit.estate,
          activeLease: activeLease || null,
          leaseHistory: leaseHistory,
        };
      });

      return {
        tenant: {
          id: tenant.id,
          name: `${tenant.firstName} ${tenant.lastName}`,
          email: tenant.email,
          phone: tenant.phone,
        },
        units: transformedUnits,
        totalCount: transformedUnits.length,
      };
    } catch (error) {
      console.error("Error in getTenantUnitsWithDetails:", error);
      throw error;
    }
  }
}

module.exports = new UnitService();
