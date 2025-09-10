const { Estate } = require('../../../database-config/index');

class EstateService {
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
