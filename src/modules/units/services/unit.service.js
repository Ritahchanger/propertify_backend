const { Unit } = require("../../../database-config/index");


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
}

module.exports = new UnitService();