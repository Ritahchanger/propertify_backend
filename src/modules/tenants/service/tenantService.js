const { TenantApplication } = require("../../../database-config/index");
const { transporter } = require("../../../shared/utils/transporter");

class TenantService {
    async createApplication(data) {
        const application = await TenantApplication.create(data);


        await this.sendEmail(
            data.email, 
            "Application Received",
            `Hello, your application for unit ${data.unitId} has been received. Our team will review and get back to you soon.`
        );

        return application;
    }

    async getApplications() {
        return await TenantApplication.findAll();
    }

    async getApplicationById(id) {
        const application = await TenantApplication.findByPk(id);
        if (!application) {
            const error = new Error("Application not found");
            error.statusCode = 404;
            throw error;
        }
        return application;
    }

    async updateApplicationStatus(id, status, reviewedBy, rejectionReason = null) {
        const application = await this.getApplicationById(id);

        application.applicationStatus = status;
        application.reviewedBy = reviewedBy;
        application.reviewedAt = new Date();

        if (status === "rejected" && rejectionReason) {
            application.rejectionReason = rejectionReason;
        }

        await application.save();

        let subject, text;
        if (status === "approved") {
            subject = "Application Approved 🎉";
            text = `Congratulations! Your application for unit ${application.unitId} has been approved. Our office will contact you for the next steps.`;
        } else if (status === "rejected") {
            subject = "Application Rejected ❌";
            text = `Unfortunately, your application was rejected. Reason: ${application.rejectionReason || "Not specified."}`;
        } else if (status === "withdrawn") {
            subject = "Application Withdrawn";
            text = "Your application has been withdrawn as per your request.";
        } else {
            subject = "Application Update";
            text = `Your application status is now: ${status}`;
        }

        await this.sendEmail(application.email, subject, text);

        return application;
    }

    async sendEmail(to, subject, text) {
        try {
            await transporter.sendMail({
                from: `"CYBER GUARD" <${process.env.COMPANY_EMAIL}>`,
                to,
                subject,
                text,
            });
        } catch (err) {
            console.error("Email sending failed:", err);
        }
    }
}

module.exports = new TenantService();
