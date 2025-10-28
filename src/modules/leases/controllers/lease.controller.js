const leaseService = require("../services/lease.service");


const { leaseSchema } = require("../validators/validator");


class LeaseController {
    // ✅ Create lease
    createLease = async (req, res) => {

        const { error, value } = leaseSchema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map((err) => err.message)
            })
        }

        const lease = await leaseService.createLease(value);

        res.status(201).json({
            success: true,
            message: "Lease created successfully",
            data: lease,
        });
    };

    // ✅ Get all leases
    getAllLeases = async (req, res) => {
        const leases = await leaseService.getAllLeases();
        res.status(200).json({
            success: true,
            count: leases.length,
            data: leases,
        });
    };

    // ✅ Get lease by ID
    getLeaseById = async (req, res) => {
        const lease = await leaseService.getLeaseById(req.params.id);
        res.status(200).json({
            success: true,
            data: lease,
        });
    };

    // ✅ Update lease
    updateLease = async (req, res) => {

        const lease = await leaseService.updateLease(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Lease updated successfully",
            data: lease,
        });

    };

    // ✅ Delete lease
    deleteLease = async (req, res) => {
        const result = await leaseService.deleteLease(req.params.id);
        res.status(200).json({
            success: true,
            ...result,
        });

    };
}

module.exports = new LeaseController();