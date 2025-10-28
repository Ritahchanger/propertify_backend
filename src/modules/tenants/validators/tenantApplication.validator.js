const Joi = require("joi");


const tenantApplicationSchema = Joi.object({
    unitId: Joi.string().uuid().required(),
    applicantId: Joi.string().uuid().required(),
    preferredMoveInDate: Joi.date().required(),
    rentDurationMonths: Joi.number().integer().min(1).required(),
    employmentLetterUrl: Joi.string().uri().optional(),
    idCopyUrl: Joi.string().uri().optional(),
    kraPin: Joi.string().max(20).optional(),
    emergencyContactName: Joi.string().max(100).optional(),
    emergencyContactPhone: Joi.string().max(20).optional(),
    email: Joi.string().email().required(),
});


module.exports = { tenantApplicationSchema };