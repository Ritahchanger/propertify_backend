const Joi = require('joi');

class EstateValidation {
    static createEstateSchema = Joi.object({
        ownerId: Joi.string().uuid().required(),
        name: Joi.string().max(255).required(),
        location: Joi.string().required(),
        description: Joi.string().allow(null, ''),
        totalUnits: Joi.number().integer().min(0).default(0),
        status: Joi.string().valid('active', 'inactive', 'maintenance').default('active'),
    });
}

module.exports = EstateValidation;
