const { Unit  }  = require("../../../database-config/index");

const MpesaService = require("../services/mpesa.service");

class MpesaController {
  constructor() {
    this.mpesaService = new MpesaService();
  }

  /**
   * @desc    Generate M-Pesa access token
   * @route   GET /api/v1/mpesa/token
   * @access  Private
   */
  async generateToken(req, res) {
    try {
      console.log("🔐 Generating M-Pesa token...");

      const token = await this.mpesaService.generateToken();

      return res.status(200).json({
        success: true,
        message: "M-Pesa token generated successfully",
        data: {
          accessToken: token,
          expiresIn: "3600 seconds",
        },
      });
    } catch (error) {
      console.error("❌ Token generation error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to generate M-Pesa token",
        error: error.response?.data || error.message,
      });
    }
  }

  /**
   * @desc    Initiate STK Push for rent payment
   * @route   POST /api/v1/mpesa/stk-push/rent
   * @access  Private
   */
  async initiateRentPayment(req, res) {
    try {
      const { phone, amount, unitId, tenantId, invoiceId } = req.body;

      const performedBy = req.user?.id || "system";


      console.log("🏠 Initiating rent payment STK Push...", {
        phone,
        amount,
        unitId,
        tenantId,
        invoiceId,
      });

      // Validate required fields
      if (!phone || !amount || !unitId || !tenantId || !invoiceId) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["phone", "amount", "unitId", "tenantId", "invoiceId"],
        });
      }

      // Validate amount
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      // Validate phone format
      const phoneRegex = /^(?:254|\+254|0)?[17]\d{8}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        });
      }

      // Initiate STK Push
      const result = await this.mpesaService.sendStkPush(
        phone,
        amount,
        unitId,
        tenantId,
        invoiceId
      );

      return res.status(200).json({
        success: true,
        message: "STK Push initiated successfully",
        data: {
          paymentId: result.paymentId,
          accountReference: result.accountReference,
          merchantRequestId: result.stkResponse.MerchantRequestID,
          checkoutRequestId: result.stkResponse.CheckoutRequestID,
          responseDescription: result.stkResponse.ResponseDescription,
          customerMessage: result.stkResponse.CustomerMessage,
        },
      });
    } catch (error) {
      console.error("❌ STK Push initiation error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to initiate STK Push",
        error: error.message,
      });
    }
  }

  /**
   * @desc    Process M-Pesa callback
   * @route   POST /api/v1/mpesa/callback/:paymentId
   * @access  Public (MPesa calls this)
   */
  async processCallback(req, res) {
    try {
      const { paymentId } = req.params;
      const callbackData = req.body;

      console.log("🔄 Processing MPesa callback for payment:", paymentId);

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
      }

      if (!callbackData || !callbackData.Body) {
        return res.status(400).json({
          success: false,
          message: "Invalid callback data",
        });
      }

      // Process the callback
      const result = await this.mpesaService.processMpesaCallback(
        callbackData,
        paymentId
      );

      if (result.success) {
        console.log("✅ Callback processed successfully:", paymentId);
        return res.status(200).json({
          success: true,
          message: "Callback processed successfully",
          data: result,
        });
      } else {
        console.log("❌ Callback processing failed:", paymentId);
        return res.status(400).json({
          success: false,
          message: "Payment failed",
          data: result,
        });
      }
    } catch (error) {
      console.error("❌ Callback processing error:", error.message);

      // Always return success to MPesa to avoid retries
      return res.status(200).json({
        success: false,
        message: "Error processing callback",
        error: error.message,
      });
    }
  }

  /**
   * @desc    Get payment status
   * @route   GET /api/v1/mpesa/payments/:paymentId
   * @access  Private
   */
  async getPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;

      console.log("📊 Getting payment status:", paymentId);

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
      }

      const payment = await this.mpesaService.getPaymentStatus(paymentId);

      return res.status(200).json({
        success: true,
        message: "Payment status retrieved successfully",
        data: payment,
      });
    } catch (error) {
      console.error("❌ Get payment status error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to get payment status",
        error: error.message,
      });
    }
  }

  /**
   * @desc    Get payments by tenant
   * @route   GET /api/v1/mpesa/payments/tenant/:tenantId
   * @access  Private
   */
  async getPaymentsByTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      console.log("📋 Getting payments for tenant:", tenantId);

      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: "Tenant ID is required",
        });
      }

      // Build query options
      const options = {
        where: { tenantId },
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [["paymentDate", "DESC"]],
      };

      // Add status filter if provided
      if (
        status &&
        ["pending", "completed", "failed", "cancelled"].includes(status)
      ) {
        options.where.paymentStatus = status;
      }

      const { count, rows: payments } = await Payment.findAndCountAll(options);

      return res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: {
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("❌ Get payments by tenant error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to get payments",
        error: error.message,
      });
    }
  }

  /**
   * @desc    Get payments by unit
   * @route   GET /api/v1/mpesa/payments/unit/:unitId
   * @access  Private
   */
  async getPaymentsByUnit(req, res) {
    try {
      const { unitId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      console.log("📋 Getting payments for unit:", unitId);

      if (!unitId) {
        return res.status(400).json({
          success: false,
          message: "Unit ID is required",
        });
      }

      // Get unit to verify existence
      const unit = await Unit.findByPk(unitId);
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found",
        });
      }

      // Build query options (you might need to join with invoices to get unit-related payments)
      const options = {
        include: [
          {
            model: Invoice,
            where: { unitId }, // Assuming Invoice model has unitId field
            attributes: ["id", "unitId"],
          },
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [["paymentDate", "DESC"]],
      };

      // Add status filter if provided
      if (
        status &&
        ["pending", "completed", "failed", "cancelled"].includes(status)
      ) {
        options.where = { paymentStatus: status };
      }

      const { count, rows: payments } = await Payment.findAndCountAll(options);

      return res.status(200).json({
        success: true,
        message: "Payments retrieved successfully",
        data: {
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("❌ Get payments by unit error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to get payments",
        error: error.message,
      });
    }
  }

  /**
   * @desc    Cancel pending payment
   * @route   PATCH /api/v1/mpesa/payments/:paymentId/cancel
   * @access  Private
   */
  async cancelPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      const performedBy = req.user?.id || "system";

      console.log("❌ Cancelling payment:", paymentId);

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
      }

      // Get payment first to check status
      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Check if payment can be cancelled
      if (payment.paymentStatus !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel payment with status: ${payment.paymentStatus}`,
        });
      }

      // Update payment status
      await this.mpesaService.handleFailedPayment(
        paymentId,
        reason || `Cancelled by user: ${performedBy}`
      );

      return res.status(200).json({
        success: true,
        message: "Payment cancelled successfully",
        data: {
          paymentId,
          status: "cancelled",
        },
      });
    } catch (error) {
      console.error("❌ Cancel payment error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to cancel payment",
        error: error.message,
      });
    }
  }

  /**
   * @desc    Get payment statistics
   * @route   GET /api/v1/mpesa/statistics
   * @access  Private
   */
  async getPaymentStatistics(req, res) {
    try {
      const { startDate, endDate, unitId, tenantId } = req.query;

      console.log("📈 Getting payment statistics");

      // Build where clause
      const whereClause = { paymentStatus: "completed" };

      if (startDate && endDate) {
        whereClause.paymentDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      if (unitId) {
        // You might need to join with invoices
        whereClause["$Invoice.unitId$"] = unitId;
      }

      if (tenantId) {
        whereClause.tenantId = tenantId;
      }

      const statistics = await Payment.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "totalPayments"],
          [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
          [sequelize.fn("AVG", sequelize.col("amount")), "averageAmount"],
          [sequelize.fn("MAX", sequelize.col("amount")), "maxAmount"],
          [sequelize.fn("MIN", sequelize.col("amount")), "minAmount"],
        ],
        include: unitId ? [{ model: Invoice }] : [],
      });

      return res.status(200).json({
        success: true,
        message: "Payment statistics retrieved successfully",
        data: statistics[0] || {
          totalPayments: 0,
          totalAmount: 0,
          averageAmount: 0,
          maxAmount: 0,
          minAmount: 0,
        },
      });
    } catch (error) {
      console.error("❌ Get payment statistics error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to get payment statistics",
        error: error.message,
      });
    }
  }
}

module.exports = MpesaController;
