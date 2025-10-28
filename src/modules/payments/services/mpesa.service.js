const axios = require("axios");
require("dotenv").config();
const Decimal = require("decimal.js");
const { v4: uuidv4 } = require("uuid");

const PaymentValidator = require("../validators/payment.validator");
const Payment = require("../../../database-config/index");
const Unit = require("../../../database-config/index");

class MpesaTokenService {
  constructor() {
    this.consumerKey = process.env.SAFARICOM_CONSUMER_KEY_TEST;
    this.consumerSecret = process.env.SAFARICOM_CONSUMER_SECRET_TEST;
    this.tokenUrl = process.env.STK_TOKEN_URL_TEST;
  }

  async generateToken() {
    try {
      const encoded = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`
      ).toString("base64");

      const response = await axios.get(this.tokenUrl, {
        headers: {
          Authorization: `Basic ${encoded}`,
        },
      });

      return response.data.access_token;
    } catch (error) {
      console.error(
        "❌ Error generating MPESA token:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

class MpesaStkPushService {
  constructor() {
    this.shortCode = process.env.DARAJA_SHORT_CODE_TEST;
    this.passKey = process.env.SAFARICOM_STK_PUSH_PASS_KEY;
    this.mpesaUrl = process.env.LIPA_NA_MPESA_URL_TEST;
    this.callbackBaseUrl = process.env.CallBackURL;
    this.tokenService = new MpesaTokenService();
  }

  generateTimestamp() {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      String(now.getHours()).padStart(2, "0") +
      String(now.getMinutes()).padStart(2, "0") +
      String(now.getSeconds()).padStart(2, "0")
    );
  }

  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("254")
      ? cleaned
      : `254${cleaned.replace(/^0/, "")}`;
  }

  generatePassword(timestamp) {
    return Buffer.from(this.shortCode + this.passKey + timestamp).toString(
      "base64"
    );
  }

  async sendStkPush(phone, amount, accountRef, callbackUrl) {
    try {
      const token = await this.tokenService.generateToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);
      const phoneFormatted = this.formatPhoneNumber(phone);

      const payload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneFormatted,
        PartyB: this.shortCode,
        PhoneNumber: phoneFormatted,
        CallBackURL: callbackUrl,
        AccountReference: accountRef,
        TransactionDesc: "Rent Payment",
      };

      const response = await axios.post(this.mpesaUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "❌ Error sending STK Push:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

class PaymentService {
  constructor() {
    // You'll need to import and initialize these services
    // this.invoiceService = new InvoiceService();
    // this.tenantService = new TenantService();
  }

  async createPaymentRecord(paymentData) {
    try {
      // Validate payment data
      const validation = await PaymentValidator.validate(paymentData, "create");
      if (!validation.isValid) {
        throw new Error(
          `Payment validation failed: ${JSON.stringify(validation.errors)}`
        );
      }

      // Create payment record
      const payment = await Payment.create(validation.value);

      console.log("✅ Payment record created:", payment.id);
      return payment;
    } catch (error) {
      console.error("❌ Error creating payment record:", error.message);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId, updateData) {
    try {
      const validation = await PaymentValidator.validate(
        updateData,
        "statusUpdate"
      );
      if (!validation.isValid) {
        throw new Error(
          `Status update validation failed: ${JSON.stringify(validation.errors)}`
        );
      }

      const payment = await Payment.update(validation.value, {
        where: { id: paymentId },
        returning: true,
      });

      console.log("✅ Payment status updated:", paymentId);
      return payment;
    } catch (error) {
      console.error("❌ Error updating payment status:", error.message);
      throw error;
    }
  }

  // Helper method to generate account reference
  generateAccountReference(unitNumber, tenantName = "") {
    // Format: UNIT{unitNumber}_{tenantInitials}_{timestamp}
    const timestamp = Date.now().toString().slice(-6);
    const tenantInitials =
      tenantName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase() || "TNT";

    return `UNIT${unitNumber}_${tenantInitials}_${timestamp}`;
  }
}

class MpesaService {
  constructor() {
    this.stkPushService = new MpesaStkPushService();
    this.paymentService = new PaymentService();
    // this.walletService = new WalletService(); // Remove if not using wallet
  }

  async sendStkPush(phone, amount, unitId, tenantId, invoiceId) {
    try {
      // Validate input parameters
      if (!unitId || !tenantId || !invoiceId) {
        throw new Error("Unit ID, Tenant ID, and Invoice ID are required");
      }

      // Get unit details for account reference
      const unit = await Unit.findByPk(unitId);
      if (!unit) {
        throw new Error("Unit not found");
      }

      // You might want to get tenant details here
      // const tenant = await Tenant.findByPk(tenantId);

      // Generate account reference using unit number
      const accountRef = this.paymentService.generateAccountReference(
        unit.unitNumber
      );

      // Create initial payment record
      const initialPayment = await this.paymentService.createPaymentRecord({
        invoiceId: invoiceId,
        tenantId: tenantId,
        amount: amount,
        unitId: unitId,
        paymentMethod: "mpesa",
        phoneNumber: phone,
        paymentStatus: "pending",
        transactionId: `STK_${uuidv4()}`,
        paymentDate: new Date(),
        notes: `STK Push initiated for Unit ${unit.unitNumber}`,
      });

      console.log(initialPayment);

      // Generate callback URL with payment ID
      const callbackUrl = `${this.stkPushService.callbackBaseUrl}/staging/api/v1/stk/push/callback/${initialPayment.id}`;

      // Send STK Push
      const stkResponse = await this.stkPushService.sendStkPush(
        phone,
        amount,
        accountRef,
        callbackUrl
      );

      // Update payment with transaction details from STK response
      if (stkResponse.CheckoutRequestID) {
        await this.paymentService.updatePaymentStatus(initialPayment.id, {
          transactionId: stkResponse.CheckoutRequestID,
          notes: `STK Push sent. Merchant Request: ${stkResponse.MerchantRequestID || "N/A"}`,
        });
      }

      return {
        paymentId: initialPayment.id,
        stkResponse: stkResponse,
        accountReference: accountRef,
      };
    } catch (error) {
      console.error("❌ Error in sendStkPush:", error.message);
      throw error;
    }
  }

  async processMpesaCallback(callbackData, paymentId) {
    try {
      console.log("🔄 Processing MPesa callback for payment:", paymentId);

      const resultCode = callbackData.Body.stkCallback.ResultCode;
      const resultDesc = callbackData.Body.stkCallback.ResultDesc;
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata;

      if (resultCode === 0) {
        // Successful payment
        const metadataItems = callbackMetadata.Item;
        let mpesaReceiptNumber = "";
        let phoneNumber = "";
        let amount = "";

        // Extract metadata
        for (const item of metadataItems) {
          if (item.Name === "MpesaReceiptNumber") {
            mpesaReceiptNumber = item.Value;
          } else if (item.Name === "PhoneNumber") {
            phoneNumber = item.Value;
          } else if (item.Name === "Amount") {
            amount = item.Value;
          }
        }

        // Update payment as completed
        await this.paymentService.updatePaymentStatus(paymentId, {
          paymentStatus: "completed",
          mpesaReceiptNumber: mpesaReceiptNumber,
          phoneNumber: phoneNumber,
          amount: amount, // You might want to keep the original amount instead
          processedAt: new Date(),
          notes: `MPesa payment completed. Receipt: ${mpesaReceiptNumber}`,
        });

        console.log("✅ Payment completed successfully:", {
          paymentId,
          receipt: mpesaReceiptNumber,
          amount,
        });

        // Here you can trigger additional actions:
        // - Update invoice status
        // - Send confirmation email/SMS
        // - Update tenant balance
        // etc.

        return {
          success: true,
          paymentId: paymentId,
          receiptNumber: mpesaReceiptNumber,
          message: "Payment processed successfully",
        };
      } else {
        // Failed payment
        await this.paymentService.updatePaymentStatus(paymentId, {
          paymentStatus: "failed",
          processedAt: new Date(),
          notes: `Payment failed. Reason: ${resultDesc} (Code: ${resultCode})`,
        });

        console.log("❌ Payment failed:", {
          paymentId,
          errorCode: resultCode,
          errorDesc: resultDesc,
        });

        return {
          success: false,
          paymentId: paymentId,
          errorCode: resultCode,
          errorDesc: resultDesc,
          message: "Payment failed",
        };
      }
    } catch (error) {
      console.error("❌ Error processing MPesa callback:", error.message);

      // Mark payment as failed in case of processing error
      try {
        await this.paymentService.updatePaymentStatus(paymentId, {
          paymentStatus: "failed",
          processedAt: new Date(),
          notes: `Callback processing error: ${error.message}`,
        });
      } catch (updateError) {
        console.error(
          "❌ Error updating payment status after callback error:",
          updateError.message
        );
      }

      throw error;
    }
  }

  async handleFailedPayment(paymentId, reason) {
    try {
      await this.paymentService.updatePaymentStatus(paymentId, {
        paymentStatus: "failed",
        processedAt: new Date(),
        notes: `Payment failed: ${reason}`,
      });

      console.log("✅ Payment marked as failed:", paymentId);
    } catch (error) {
      console.error("❌ Error handling failed payment:", error.message);
      throw error;
    }
  }

  async generateToken() {
    const tokenService = new MpesaTokenService();
    return await tokenService.generateToken();
  }

  // Utility method to get payment status
  async getPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }
      return payment;
    } catch (error) {
      console.error("❌ Error getting payment status:", error.message);
      throw error;
    }
  }
}

module.exports = MpesaService;
