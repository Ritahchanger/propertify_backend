const Joi = require("joi");

class PaymentValidator {
  // Base payment schema
  static get baseSchema() {
    return Joi.object({
      invoiceId: Joi.string().uuid().allow(null).optional().messages({
        "string.guid": "Invoice ID must be a valid UUID",
      }),
      tenantId: Joi.string().uuid().required().messages({
        "string.guid": "Tenant ID must be a valid UUID",
        "any.required": "Tenant ID is required",
      }),
      unitId: Joi.string().uuid().required().messages({
        "string.guid": "Unit ID must be a valid UUID",
        "any.required": "Unit ID is required",
      }),
      amount: Joi.number()
        .positive()
        .precision(2)
        .max(9999999999.99)
        .required()
        .messages({
          "number.positive": "Amount must be a positive number",
          "number.precision": "Amount can have maximum 2 decimal places",
          "number.max": "Amount cannot exceed 9,999,999,999.99",
          "any.required": "Amount is required",
        }),
      paymentMethod: Joi.string().max(50).required().messages({
        "string.max": "Payment method cannot exceed 50 characters",
        "any.required": "Payment method is required",
      }),
      transactionId: Joi.string().max(100).allow("", null).optional().messages({
        "string.max": "Transaction ID cannot exceed 100 characters",
      }),
      phoneNumber: Joi.string()
        .max(20)
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .allow("", null)
        .optional()
        .messages({
          "string.max": "Phone number cannot exceed 20 characters",
          "string.pattern.base": "Phone number must be a valid format",
        }),
      paymentStatus: Joi.string()
        .valid("pending", "completed", "failed", "cancelled")
        .default("pending")
        .messages({
          "any.only":
            "Payment status must be one of: pending, completed, failed, cancelled",
        }),
      mpesaReceiptNumber: Joi.string()
        .max(100)
        .allow("", null)
        .optional()
        .messages({
          "string.max": "Mpesa receipt number cannot exceed 100 characters",
        }),
      paymentDate: Joi.date()
        .iso()
        .max("now")
        .default(() => new Date())
        .messages({
          "date.format": "Payment date must be a valid ISO date",
          "date.max": "Payment date cannot be in the future",
        }),
      processedAt: Joi.date().iso().max("now").allow(null).optional().messages({
        "date.format": "Processed at must be a valid ISO date",
        "date.max": "Processed at cannot be in the future",
      }),
      notes: Joi.string().max(1000).allow("", null).optional().messages({
        "string.max": "Notes cannot exceed 1000 characters",
      }),
    });
  }

  // Create payment validation
  static validateCreate(paymentData) {
    const schema = this.baseSchema.keys({
      id: Joi.string().uuid().optional().messages({
        "string.guid": "ID must be a valid UUID",
      }),
    });

    return schema.validate(paymentData, {
      abortEarly: false,
      stripUnknown: true,
    });
  }

  // Update payment validation
  static validateUpdate(paymentData) {
    const schema = Joi.object({
      invoiceId: Joi.string().uuid().optional().messages({
        "string.guid": "Invoice ID must be a valid UUID",
      }),
      tenantId: Joi.string().uuid().optional().messages({
        "string.guid": "Tenant ID must be a valid UUID",
      }),
      unitId: Joi.string().uuid().optional().messages({
        "string.guid": "Unit ID must be a valid UUID",
      }),
      amount: Joi.number()
        .positive()
        .precision(2)
        .max(9999999999.99)
        .optional()
        .messages({
          "number.positive": "Amount must be a positive number",
          "number.precision": "Amount can have maximum 2 decimal places",
          "number.max": "Amount cannot exceed 9,999,999,999.99",
        }),
      paymentMethod: Joi.string().max(50).optional().messages({
        "string.max": "Payment method cannot exceed 50 characters",
      }),
      transactionId: Joi.string().max(100).allow("", null).optional().messages({
        "string.max": "Transaction ID cannot exceed 100 characters",
      }),
      phoneNumber: Joi.string()
        .max(20)
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .allow("", null)
        .optional()
        .messages({
          "string.max": "Phone number cannot exceed 20 characters",
          "string.pattern.base": "Phone number must be a valid format",
        }),
      paymentStatus: Joi.string()
        .valid("pending", "completed", "failed", "cancelled")
        .optional()
        .messages({
          "any.only":
            "Payment status must be one of: pending, completed, failed, cancelled",
        }),
      mpesaReceiptNumber: Joi.string()
        .max(100)
        .allow("", null)
        .optional()
        .messages({
          "string.max": "Mpesa receipt number cannot exceed 100 characters",
        }),
      paymentDate: Joi.date().iso().max("now").optional().messages({
        "date.format": "Payment date must be a valid ISO date",
        "date.max": "Payment date cannot be in the future",
      }),
      processedAt: Joi.date().iso().max("now").allow(null).optional().messages({
        "date.format": "Processed at must be a valid ISO date",
        "date.max": "Processed at cannot be in the future",
      }),
      notes: Joi.string().max(1000).allow("", null).optional().messages({
        "string.max": "Notes cannot exceed 1000 characters",
      }),
    })
      .min(1)
      .messages({
        "object.min": "At least one field must be provided for update",
      });

    return schema.validate(paymentData, {
      abortEarly: false,
      stripUnknown: true,
    });
  }

  // ID validation
  static validateId(id) {
    const schema = Joi.string().uuid().required().messages({
      "string.guid": "Payment ID must be a valid UUID",
      "any.required": "Payment ID is required",
    });

    return schema.validate(id);
  }

  // Bulk ID validation
  static validateIds(ids) {
    const schema = Joi.array()
      .items(
        Joi.string().uuid().messages({
          "string.guid": "Each ID must be a valid UUID",
        })
      )
      .min(1)
      .messages({
        "array.min": "At least one ID must be provided",
      });

    return schema.validate(ids, {
      abortEarly: false,
    });
  }

  // Payment status validation
  static validateStatus(status) {
    const schema = Joi.string()
      .valid("pending", "completed", "failed", "cancelled")
      .required()
      .messages({
        "any.only":
          "Status must be one of: pending, completed, failed, cancelled",
        "any.required": "Status is required",
      });

    return schema.validate(status);
  }

  // Payment query validation (for filtering)
  static validateQuery(query) {
    const schema = Joi.object({
      tenantId: Joi.string().uuid().optional().messages({
        "string.guid": "Tenant ID must be a valid UUID",
      }),
      unitId: Joi.string().uuid().optional().messages({
        "string.guid": "Unit ID must be a valid UUID",
      }),
      invoiceId: Joi.string().uuid().optional().messages({
        "string.guid": "Invoice ID must be a valid UUID",
      }),
      paymentStatus: Joi.string()
        .valid("pending", "completed", "failed", "cancelled")
        .optional()
        .messages({
          "any.only":
            "Payment status must be one of: pending, completed, failed, cancelled",
        }),
      paymentMethod: Joi.string().max(50).optional().messages({
        "string.max": "Payment method cannot exceed 50 characters",
      }),
      startDate: Joi.date().iso().optional().messages({
        "date.format": "Start date must be a valid ISO date",
      }),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).optional().messages({
        "date.format": "End date must be a valid ISO date",
        "date.min": "End date must be after start date",
      }),
      minAmount: Joi.number().positive().precision(2).optional().messages({
        "number.positive": "Minimum amount must be positive",
        "number.precision": "Amount can have maximum 2 decimal places",
      }),
      maxAmount: Joi.number()
        .positive()
        .precision(2)
        .min(Joi.ref("minAmount"))
        .optional()
        .messages({
          "number.positive": "Maximum amount must be positive",
          "number.precision": "Amount can have maximum 2 decimal places",
          "number.min": "Maximum amount must be greater than minimum amount",
        }),
      page: Joi.number().integer().positive().default(1).optional().messages({
        "number.integer": "Page must be an integer",
        "number.positive": "Page must be positive",
      }),
      limit: Joi.number()
        .integer()
        .positive()
        .max(100)
        .default(10)
        .optional()
        .messages({
          "number.integer": "Limit must be an integer",
          "number.positive": "Limit must be positive",
          "number.max": "Limit cannot exceed 100",
        }),
      sortBy: Joi.string()
        .valid(
          "paymentDate",
          "amount",
          "paymentStatus",
          "createdAt",
          "updatedAt"
        )
        .default("paymentDate")
        .optional()
        .messages({
          "any.only": "Sort by must be a valid field",
        }),
      sortOrder: Joi.string()
        .valid("asc", "desc")
        .default("desc")
        .optional()
        .messages({
          "any.only": "Sort order must be asc or desc",
        }),
    });

    return schema.validate(query, {
      abortEarly: false,
      stripUnknown: true,
    });
  }

  // M-Pesa specific validation
  static validateMpesaPayment(paymentData) {
    const schema = this.baseSchema.keys({
      paymentMethod: Joi.string().valid("mpesa").required().messages({
        "any.only": "Payment method must be mpesa for M-Pesa payments",
      }),
      phoneNumber: Joi.string()
        .pattern(/^254[17]\d{8}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Phone number must be a valid Kenyan format (254XXXXXXXXX)",
          "any.required": "Phone number is required for M-Pesa payments",
        }),
      mpesaReceiptNumber: Joi.string().max(100).allow("", null).optional(),
    });

    return schema.validate(paymentData, {
      abortEarly: false,
      stripUnknown: true,
    });
  }

  // Payment status update validation
  static validateStatusUpdate(updateData) {
    const schema = Joi.object({
      paymentStatus: Joi.string()
        .valid("pending", "completed", "failed", "cancelled")
        .required()
        .messages({
          "any.only":
            "Payment status must be one of: pending, completed, failed, cancelled",
          "any.required": "Payment status is required",
        }),
      processedAt: Joi.date()
        .iso()
        .max("now")
        .default(() => new Date())
        .messages({
          "date.format": "Processed at must be a valid ISO date",
          "date.max": "Processed at cannot be in the future",
        }),
      mpesaReceiptNumber: Joi.string()
        .max(100)
        .allow("", null)
        .optional()
        .messages({
          "string.max": "Mpesa receipt number cannot exceed 100 characters",
        }),
      transactionId: Joi.string().max(100).allow("", null).optional().messages({
        "string.max": "Transaction ID cannot exceed 100 characters",
      }),
      notes: Joi.string().max(1000).allow("", null).optional().messages({
        "string.max": "Notes cannot exceed 1000 characters",
      }),
    });

    return schema.validate(updateData, {
      abortEarly: false,
      stripUnknown: true,
    });
  }

  // Bulk payment validation
  static validateBulkPayments(paymentsData) {
    const schema = Joi.array().items(this.baseSchema).min(1).max(100).messages({
      "array.min": "At least one payment must be provided",
      "array.max": "Cannot process more than 100 payments at once",
    });

    return schema.validate(paymentsData, {
      abortEarly: false,
      stripUnknown: true,
    });
  }

  // Format validation errors for consistent response
  static formatError(validationError) {
    if (!validationError.error) {
      return null;
    }

    const errors = validationError.error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
      type: detail.type,
    }));

    return {
      success: false,
      message: "Validation failed",
      errors: errors,
    };
  }

  // Quick validation helper
  static async validate(paymentData, type = "create") {
    try {
      let result;

      switch (type) {
        case "create":
          result = this.validateCreate(paymentData);
          break;
        case "update":
          result = this.validateUpdate(paymentData);
          break;
        case "mpesa":
          result = this.validateMpesaPayment(paymentData);
          break;
        case "query":
          result = this.validateQuery(paymentData);
          break;
        case "statusUpdate":
          result = this.validateStatusUpdate(paymentData);
          break;
        case "bulk":
          result = this.validateBulkPayments(paymentData);
          break;
        case "id":
          result = this.validateId(paymentData);
          break;
        case "ids":
          result = this.validateIds(paymentData);
          break;
        default:
          throw new Error(`Unknown validation type: ${type}`);
      }

      if (result.error) {
        return {
          isValid: false,
          errors: this.formatError(result),
          value: null,
        };
      }

      return {
        isValid: true,
        errors: null,
        value: result.value,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: {
          success: false,
          message: "Validation error",
          errors: [{ field: "system", message: error.message }],
        },
        value: null,
      };
    }
  }
}

module.exports = PaymentValidator;
