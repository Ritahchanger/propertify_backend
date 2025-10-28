<<<<<<< HEAD
const { Unit,Estate } = require("../../../database-config/index");
=======
const { Unit } = require("../../../database-config/index");
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367


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
<<<<<<< HEAD


    async getOwnerVacantUnits(ownerId) {
        return await Unit.findAll({
          where: {
            status: 'vacant'
          },
          include: [{
            model: Estate,
            as: 'estate',
            where: { ownerId },
            attributes: ['id', 'name', 'location', 'status', 'totalUnits']
          }],
          attributes: [
            'id', 
            'unitNumber', 
            'bedrooms', 
            'bathrooms', 
            'monthlyRent', 
            'depositAmount',
            'unitType',
            'floorArea',
            'status',
            'description',
            'created_at',
            'updated_at'
          ],
          order: [
            ['estate', 'name', 'ASC'],
            ['unitNumber', 'ASC']
          ]
        });
      }
    
=======
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367
}

module.exports = new UnitService();