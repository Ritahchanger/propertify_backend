const { Estate, Unit, User, TenantApplication } = require('../../../database-config/index');

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
                                    attributes: ["id", "firstName", "lastName", "email", "phone", "role"],
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


        estateData.units = estateData.units.map(unit => {
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
}

module.exports = EstateService;
