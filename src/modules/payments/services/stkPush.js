const axios = require("axios");
const generateToken = require("../utils/generateToken");

class STKPushService {
    constructor() {
        this.baseUrl = process.env.MPESA_BASE_URL; // e.g., https://sandbox.safaricom.co.ke
        this.shortCode = process.env.MPESA_SHORT_CODE; // Paybill or Till number
        this.passKey = process.env.MPESA_PASSKEY; // M-Pesa API passkey
        this.callbackUrl = process.env.MPESA_CALLBACK_URL; // Your callback URL for payment confirmation
    }

    // Generate timestamp in format YYYYMMDDHHMMSS
    getTimestamp() {
        const date = new Date();
        return date
            .toISOString()
            .replace(/[-T:Z.]/g, "")
            .slice(0, 14);
    }

    // Generate password for STK push (Base64 encoded)
    generatePassword() {
        const timestamp = this.getTimestamp();
        return Buffer.from(`${this.shortCode}${this.passKey}${timestamp}`).toString(
            "base64"
        );
    }

    // Initiate STK push
    async push({ amount, phoneNumber, accountReference, transactionDesc }) {
        try {
            const token = await generateToken();
            const timestamp = this.getTimestamp();
            const password = this.generatePassword();

            const payload = {
                BusinessShortCode: this.shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: this.shortCode,
                PhoneNumber: phoneNumber,
                CallBackURL: this.callbackUrl,
                AccountReference: accountReference || "CompanyXYZ",
                TransactionDesc: transactionDesc || "Payment of goods",
            };

            const { data } = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return data;
        } catch (err) {
            console.error("STK Push failed:", err.response?.data || err.message);
            throw new Error("STK Push request failed");
        }
    }
}

module.exports = new STKPushService();
