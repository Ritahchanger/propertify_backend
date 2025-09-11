const { Estate, Unit, User } = require('../../../database-config/index');

class EstateService {

    static async getEstateWithUnits(estateId) {

        const estate = await Estate.findByPk(estateId, {
            include: [
                {
                    model: User,
                    as: "owner",
                    attributes: ["id", "firstName", "lastName", "email", "phone", "role"],
                    where: { role: "owner" },
                    required: true,
                },
                {
                    model: Unit,
                    as: "units"
                }
            ]
        });

        if (!estate) {
            const error = new Error("Estate not found");
            error.statusCode = 404;
            throw error;
        }

        const totalUnits = estate.units.length;

        return {
            ...estate.toJSON(),
            totalUnits,
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
}

module.exports = EstateService;
