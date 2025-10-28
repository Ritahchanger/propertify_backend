const Joi = require("joi")

class UnitValidator {
    static createUnitSchema = Joi.object({
        estateId: Joi.string().uuid().required(),
        unitNumber: Joi.string().max(50).required(),
        bedrooms: Joi.number().integer().min(0).required(),
        bathrooms: Joi.number().integer().min(0).required(),
        monthlyRent: Joi.number().precision(2).positive().required(),
        depositAmount: Joi.number().precision(2).positive().required(),
        unitType: Joi.string().max(50).optional(),
        floorArea: Joi.number().precision(2).positive().optional(),
        status: Joi.string().valid("vacant", "occupied", "maintenance", "reserved").optional(),
        description: Joi.string().optional(),
    });

    static updateUnitSchema = Joi.object({
        unitNumber: Joi.string().max(50).optional(),
        bedrooms: Joi.number().integer().min(0).optional(),
        bathrooms: Joi.number().integer().min(0).optional(),
        monthlyRent: Joi.number().precision(2).positive().optional(),
        depositAmount: Joi.number().precision(2).positive().optional(),
        unitType: Joi.string().max(50).optional(),
        floorArea: Joi.number().precision(2).positive().optional(),
        status: Joi.string().valid("vacant", "occupied", "maintenance", "reserved").optional(),
        description: Joi.string().optional(),
    });
}

module.exports = UnitValidator;