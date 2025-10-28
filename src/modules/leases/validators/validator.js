const Joi = require("joi");

const leaseSchema = Joi.object({
    unitId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "Unit ID must be a valid UUID",
            "any.required": "Unit ID is required",
        }),

    tenantId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "Tenant ID must be a valid UUID",
            "any.required": "Tenant ID is required",
        }),

    applicationId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .optional()
        .allow(null),

    leaseStartDate: Joi.date()
        .iso()
        .required()
        .messages({
            "date.format": "Lease start date must be a valid ISO date",
            "any.required": "Lease start date is required",
        }),

    leaseEndDate: Joi.date()
        .iso()
        .min(Joi.ref("leaseStartDate"))
        .required()
        .messages({
            "date.min": "Lease end date must be greater than or equal to start date",
            "any.required": "Lease end date is required",
        }),

    monthlyRent: Joi.number()
        .precision(2)
        .positive()
        .required()
        .messages({
            "number.base": "Monthly rent must be a number",
            "number.positive": "Monthly rent must be positive",
            "any.required": "Monthly rent is required",
        }),

    depositPaid: Joi.number()
        .precision(2)
        .positive()
        .required()
        .messages({
            "number.base": "Deposit must be a number",
            "number.positive": "Deposit must be positive",
            "any.required": "Deposit is required",
        }),

    leaseStatus: Joi.string()
        .valid("draft", "active", "expired", "terminated", "renewed")
        .default("active"),

    leaseDocumentUrl: Joi.string()
        .uri()
        .optional()
        .messages({
            "string.uri": "Lease document must be a valid URL",
        }),

    signedAt: Joi.date().iso().optional(),
});

module.exports = {
    leaseSchema,
};