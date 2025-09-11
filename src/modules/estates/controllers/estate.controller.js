const EstateService = require('../services/estate.service');
const EstateValidation = require('../validators/estate.validation');

class EstateController {

    static async getEstateWithUnits(req, res) {

        const { estateId } = req.params;
        const estate = await EstateService.getEstateWithUnits(estateId);

        return res.status(200).json({
            success: true,
            data: estate,
        });

    }
    static async createEstate(req, res) {
        const { error, value } = EstateValidation.createEstateSchema.validate(req.body);
        if (error) {
            const errObj = new Error(error.details[0].message);
            errObj.statusCode = 400;
            throw errObj;
        }

        const estate = await EstateService.createEstate(value);
        return res.status(201).json({ message: 'Estate created successfully', estate });
    }

    static async getEstates(req, res) {
        const estates = await EstateService.getAllEstates();
        return res.status(200).json(estates);
    }

    static async getEstateById(req, res) {
        const { id } = req.params;
        const estate = await EstateService.getEstateById(id);
        if (!estate) {
            const errObj = new Error("Estate not found");
            errObj.statusCode = 404;
            throw errObj;
        }
        return res.status(200).json(estate);
    }

}

module.exports = EstateController;
