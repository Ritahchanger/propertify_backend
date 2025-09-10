const tenantService = require("../service/tenantService");

const { tenantApplicationSchema } = require("../validators/tenantApplication.validator")

class TenantController {
    // ✅ Create a new tenant application
    createApplication = async (req, res) => {
        const { error, value } = tenantApplicationSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map((err) => err.message),
            });
        }
        const newApp = await tenantService.createApplication(value);

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: newApp,
        });

    };



    // ✅ Get all applications
    getApplications = async (req, res) => {
        const apps = await tenantService.getApplications();
        res.status(200).json({
            success: true,
            count: apps.length,
            data: apps,
        });
    };



    // ✅ Get single application by ID
    getApplicationById = async (req, res) => {
        const app = await tenantService.getApplicationById(req.params.id);
        res.status(200).json({
            success: true,
            data: app,
        });
    };



    // ✅ Update application status (approve/reject/withdraw)
    updateApplicationStatus = async (req, res) => {
        const { status, rejectionReason } = req.body;

        const app = await tenantService.updateApplicationStatus(
            req.params.id,
            status,
            req.user?.id || null, // reviewer ID from auth middleware
            rejectionReason
        );

        res.status(200).json({
            success: true,
            message: `Application status updated to '${status}'`,
            data: app,
        });
    };
}

module.exports = new TenantController();
