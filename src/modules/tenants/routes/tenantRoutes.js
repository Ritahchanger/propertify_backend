const express = require("express");
const tenantController = require("../controllers/tenant.controller");
const asyncWrapper = require("../../../shared/middlewares/async-thunk/asyncWrapper");
const { requireRole } = require("../../../modules/auth/roles/roleAuth");

const Router = express.Router();

Router.post(
  "/applications",
  requireRole(["tenant", "owner", "manager"]),
  asyncWrapper(tenantController.createApplication)
);

Router.get(
  "/applications",
  requireRole(["owner", "manager"]),
  asyncWrapper(tenantController.getApplications)
);

Router.get(
  "/applications/:id",
  requireRole(["owner", "manager", "tenant"]),
  asyncWrapper(tenantController.getApplicationById)
);

Router.patch(
  "/applications/:id/status",
  requireRole(["owner", "manager"]),
  asyncWrapper(tenantController.updateApplicationStatus)
);

Router.get(
  "/",
  requireRole(["owner", "manager"]),
  asyncWrapper(tenantController.getAllTenants)
);

/**
 * @route   GET /api/tenants/stats
 * @desc    Get tenant statistics for dashboard
 * @access  Private (Owner, Manager)
 */
Router.get(
  "/stats",
  requireRole(["owner", "manager"]),
  asyncWrapper(tenantController.getTenantStats)
);

/**
 * @route   GET /api/tenants/search
 * @desc    Search tenants by name, email, or unit number
 * @access  Private (Owner, Manager)
 */
Router.get(
  "/search",
  requireRole(["owner", "manager"]),
  asyncWrapper(tenantController.searchTenants)
);

/**
 * @route   GET /api/tenants/upcoming-expirations
 * @desc    Get upcoming lease expirations
 * @access  Private (Owner, Manager)
 */
Router.get(
  "/upcoming-expirations",
  requireRole(["owner", "manager"]),
  asyncWrapper(tenantController.getUpcomingLeaseExpirations)
);

/**
 * @route   GET /api/tenants/owner
 * @desc    Get all tenants for the authenticated owner
 * @access  Private (Owner only)
 */
Router.get(
  "/owner",
  requireRole(["owner"]),
  asyncWrapper(tenantController.getTenantsByOwner)
);

/**
 * @route   GET /api/tenants/:tenantId
 * @desc    Get detailed information for a specific tenant
 * @access  Private (Owner, Manager)
 */
Router.get(
  "/:tenantId",
  requireRole(["owner", "manager"]),
  asyncWrapper(tenantController.getTenantDetails)
);

/**
 * @route   GET /api/tenants/estate/:estateId
 * @desc    Get tenants by estate for a specific owner
 * @access  Private (Owner, Manager)
 */
Router.get(
  "/estate/:estateId",
  requireRole(["owner", "manager"]),
  asyncWrapper(tenantController.getTenantsByEstate)
);

module.exports = Router;
