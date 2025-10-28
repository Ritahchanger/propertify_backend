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

    const result = await tenantService.getTenantsByOwner(
      ownerId,
      parseInt(page),
      parseInt(limit),
      status
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenants retrieved successfully",
      data: result,
    });
  }

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
  }

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
  }

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
  }

  /**
   * Search tenants by name, email, or unit number
   */
  searchTenants  = async (req, res) => {
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
  }


  /**
   * Get all tenants (for managers with broader access)
   */
  getAllTenants = async (req, res) => {
    const { page = 1, limit = 10, status, estateId } = req.query;
    const { id: userId, role } = req.user;

    let result;

    if (role === "owner") {
      result = await tenantService.getTenantsByOwner(
        userId,
        parseInt(page),
        parseInt(limit),
        status
      );
    } else if (role === "manager") {
      // Manager might have access to multiple owners' tenants
      // You can implement a different service method for managers
      result = await tenantService.getTenantsForManager(
        userId,
        parseInt(page),
        parseInt(limit),
        status,
        estateId
      );
    } else {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Insufficient permissions to access tenants",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenants retrieved successfully",
      data: result,
    });
  }
}

module.exports = new TenantController();
