const EstateService = require('../services/estate.service');
const EstateValidation = require('../validators/estate.validation');

class EstateController {
    static async createEstate(req, res, next) {
        try {
            const { error, value } = EstateValidation.createEstateSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const estate = await EstateService.createEstate(value);
            return res.status(201).json({ message: 'Estate created successfully', estate });
        } catch (err) {
            next(err);
        }
    }

    static async getEstates(req, res, next) {
        try {
            const estates = await EstateService.getAllEstates();
            return res.status(200).json(estates);
        } catch (err) {
            next(err);
        }
    }

    static async getEstateById(req, res, next) {
        try {
            const { id } = req.params;
            const estate = await EstateService.getEstateById(id);
            if (!estate) {
                return res.status(404).json({ message: 'Estate not found' });
            }
            return res.status(200).json(estate);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = EstateController;
