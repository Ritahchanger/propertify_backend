const tenantService = require("../service/tenantService");

const { StatusCodes } = require("http-status-codes");

const {
  tenantApplicationSchema,
} = require("../validators/tenantApplication.validator");

class TenantController {
  // ✅ Create a new tenant application
  createApplication = async (req, res) => {
    const { error, value } = tenantApplicationSchema.validate(req.body, {
      abortEarly: false,
    });
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

  getTenantsByOwner = async (req, res) => {
    const { id: ownerId } = req.user;
    const { page = 1, limit = 10, status } = req.query;

    const tenants = await tenantService.getTenantsByOwner(
      ownerId,
      parseInt(page),
      parseInt(limit),
      status
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenants retrieved successfully",
      data: tenants,
    });
  };

  /**
   * Get tenant statistics for owner dashboard
   */

  getTenantStats = async (req, res) => {
    const { id: ownerId } = req.user;

    const stats = await tenantService.getTenantStatsByOwner(ownerId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant statistics retrieved successfully",
      data: stats,
    });
  };

  /**
   * Get detailed information for a specific tenant
   */

  getTenantDetails = async (req, res) => {
    const { id: ownerId } = req.user;
    const { tenantId } = req.params;

    const tenantDetails = await tenantService.getTenantDetails(
      tenantId,
      ownerId
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant details retrieved successfully",
      data: tenantDetails,
    });
  };

  /**
   * Get tenants by estate for a specific owner
   */

  getTenantsByEstate = async (req, res) => {
    const { id: ownerId } = req.user;
    const { estateId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await tenantService.getTenantsByEstate(
      ownerId,
      estateId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Estate tenants retrieved successfully",
      data: result,
    });
  };

  /**
   * Search tenants by name, email, or unit number
   */
  searchTenants = async (req, res) => {
    const { id: ownerId } = req.user;
    const { q: searchTerm } = req.query;
    const { page = 1, limit = 10 } = req.query;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Search term is required",
      });
    }

    const result = await tenantService.searchTenants(
      ownerId,
      searchTerm.trim(),
      parseInt(page),
      parseInt(limit)
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant search completed successfully",
      data: result,
    });
  };

  /**
   * Get upcoming lease expirations
   */
  getUpcomingLeaseExpirations = async (req, res) => {
    const { id: ownerId } = req.user;
    const { days = 30 } = req.query;

    const expiringLeases = await tenantService.getUpcomingLeaseExpirations(
      ownerId,
      parseInt(days)
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Upcoming lease expirations retrieved successfully",
      data: expiringLeases,
    });
  };

  /**
   * Get all tenants (for managers with broader access)

  */

  // async getTenantsByOwner(req, res) {
  //   const { id: ownerId } = req.user.id;
  //   const { page = 1, limit = 10, estateId, status } = req.query;

  //   if (!ownerId) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Owner ID is required",
  //       data: null,
  //     });
  //   }

  //   const pageNum = parseInt(page);
  //   const limitNum = parseInt(limit);

  //   if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Invalid pagination parameters",
  //       data: null,
  //     });
  //   }

  //   const filters = {};
  //   if (estateId) filters.estateId = estateId;
  //   if (status) filters.status = status;

  //   const result = await tenantService.getTenantsByOwner(
  //     ownerId,
  //     pageNum,
  //     limitNum,
  //     filters
  //   );

  //   return res.status(200).json({
  //     success: true,
  //     message: "Tenants fetched successfully",
  //     result,
  //   });
  // }
}

module.exports = new TenantController();
