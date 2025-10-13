const Joi = require("joi");

/**
 * M-Pesa payment validation schema
 */
const mpesaPaymentSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^(?:254|\+254|0)?[17]\d{8}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid Kenyan phone number format. Use: 07XXXXXXXX or 2547XXXXXXXX",
      "any.required": "Phone number is required",
    }),

  amount: Joi.number().positive().max(150000).precision(2).required().messages({
    "number.positive": "Amount must be greater than 0",
    "number.max": "Amount cannot exceed 150,000 KES",
    "number.precision": "Amount can have maximum 2 decimal places",
    "any.required": "Amount is required",
  }),

  unitId: Joi.string().uuid().required().messages({
    "string.guid": "Unit ID must be a valid UUID",
    "any.required": "Unit ID is required",
  }),

  tenantId: Joi.string().uuid().required().messages({
    "string.guid": "Tenant ID must be a valid UUID",
    "any.required": "Tenant ID is required",
  }),

  invoiceId: Joi.string().uuid().required().messages({
    "string.guid": "Invoice ID must be a valid UUID",
    "any.required": "Invoice ID is required",
  }),

  paymentMethod: Joi.string()
    .valid("mpesa", "card", "bank")
    .default("mpesa")
    .optional()
    .messages({
      "any.only": "Payment method must be one of: mpesa, card, bank",
    }),
});

/**
 * Payment ID parameter validation schema
 */
const paymentIdSchema = Joi.object({
  paymentId: Joi.string().uuid().required().messages({
    "string.guid": "Payment ID must be a valid UUID",
    "any.required": "Payment ID is required",
  }),
});

/**
 * Payment query parameters validation schema
 */
const paymentQuerySchema = Joi.object({
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

  status: Joi.string()
    .valid("pending", "completed", "failed", "cancelled")
    .optional()
    .messages({
      "any.only":
        "Status must be one of: pending, completed, failed, cancelled",
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

  unitId: Joi.string().uuid().optional().messages({
    "string.guid": "Unit ID must be a valid UUID",
  }),

  tenantId: Joi.string().uuid().optional().messages({
    "string.guid": "Tenant ID must be a valid UUID",
  }),
});

/**
 * Bulk payments validation schema
 */
const bulkPaymentsSchema = Joi.array()
  .items(
    Joi.object({
      phone: Joi.string()
        .pattern(/^(?:254|\+254|0)?[17]\d{8}$/)
        .required()
        .messages({
          "string.pattern.base": "Invalid Kenyan phone number format",
          "any.required": "Phone number is required for each payment",
        }),

      amount: Joi.number()
        .positive()
        .max(150000)
        .precision(2)
        .required()
        .messages({
          "number.positive": "Amount must be greater than 0",
          "number.max": "Amount cannot exceed 150,000 KES",
          "number.precision": "Amount can have maximum 2 decimal places",
          "any.required": "Amount is required for each payment",
        }),

      unitId: Joi.string().uuid().required().messages({
        "string.guid": "Unit ID must be a valid UUID",
        "any.required": "Unit ID is required for each payment",
      }),

      tenantId: Joi.string().uuid().required().messages({
        "string.guid": "Tenant ID must be a valid UUID",
        "any.required": "Tenant ID is required for each payment",
      }),

      invoiceId: Joi.string().uuid().required().messages({
        "string.guid": "Invoice ID must be a valid UUID",
        "any.required": "Invoice ID is required for each payment",
      }),
    })
  )
  .min(1)
  .max(10)
  .messages({
    "array.min": "At least one payment must be provided",
    "array.max": "Cannot process more than 10 payments at once",
  });

/**
 * Payment status update validation schema
 */
const paymentStatusUpdateSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid("pending", "completed", "failed", "cancelled")
    .required()
    .messages({
      "any.only":
        "Payment status must be one of: pending, completed, failed, cancelled",
      "any.required": "Payment status is required",
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

  processedAt: Joi.date().iso().max("now").optional().messages({
    "date.format": "Processed at must be a valid ISO date",
    "date.max": "Processed at cannot be in the future",
  }),

  notes: Joi.string().max(1000).allow("", null).optional().messages({
    "string.max": "Notes cannot exceed 1000 characters",
  }),
});

/**
 * Account reference validation schema
 */
const accountReferenceSchema = Joi.object({
  unitId: Joi.string().uuid().required().messages({
    "string.guid": "Unit ID must be a valid UUID",
    "any.required": "Unit ID is required",
  }),

  tenantId: Joi.string().uuid().required().messages({
    "string.guid": "Tenant ID must be a valid UUID",
    "any.required": "Tenant ID is required",
  }),
});

/**
 * Payment retry validation schema
 */
const paymentRetrySchema = Joi.object({
  phone: Joi.string()
    .pattern(/^(?:254|\+254|0)?[17]\d{8}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid Kenyan phone number format",
    }),
});

/**
 * M-Pesa callback validation schema
 */
const mpesaCallbackSchema = Joi.object({
  Body: Joi.object({
    stkCallback: Joi.object({
      ResultCode: Joi.number().required().messages({
        "any.required": "ResultCode is required in callback",
      }),

      ResultDesc: Joi.string().required().messages({
        "any.required": "ResultDesc is required in callback",
      }),

      CallbackMetadata: Joi.object({
        Item: Joi.array()
          .items(
            Joi.object({
              Name: Joi.string().required(),
              Value: Joi.any().required(),
            })
          )
          .optional(),
      }).optional(),
    }).required(),
  }).required(),
});

/**
 * Transaction ID validation schema
 */
const transactionIdSchema = Joi.object({
  transactionId: Joi.string().required().messages({
    "any.required": "Transaction ID is required",
  }),
});

/**
 * Middleware to validate request body against schema
 */
const validateRequest = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorDetails,
      });
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Middleware to validate request parameters
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(400).json({
        success: false,
        message: "Invalid parameters",
        errors: errorDetails,
      });
    }

    req.params = value;
    next();
  };
};

/**
 * Middleware to validate query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        type: detail.type,
      }));

      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: errorDetails,
      });
    }

    req.query = value;
    next();
  };
};

// Export validation middleware functions
module.exports = {
  // Schemas
  mpesaPaymentSchema,
  paymentIdSchema,
  paymentQuerySchema,
  bulkPaymentsSchema,
  paymentStatusUpdateSchema,
  accountReferenceSchema,
  paymentRetrySchema,
  mpesaCallbackSchema,
  transactionIdSchema,

  // Middleware functions
  validateMpesaPayment: validateRequest(mpesaPaymentSchema),
  validateBulkPayments: validateRequest(bulkPaymentsSchema),
  validatePaymentStatusUpdate: validateRequest(paymentStatusUpdateSchema),
  validateAccountReference: validateRequest(accountReferenceSchema),
  validatePaymentRetry: validateRequest(paymentRetrySchema),
  validateMpesaCallback: validateRequest(mpesaCallbackSchema),

  // Parameter validation
  validatePaymentId: validateParams(paymentIdSchema),
  validateTransactionId: validateParams(transactionIdSchema),

  // Query validation
  validatePaymentQuery: validateQuery(paymentQuerySchema),
};
