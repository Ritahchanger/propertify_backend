const express = require("express");

const leaseController = require("../controllers/lease.controller");

const asyncWrapper = require("../../../shared/middlewares/async-thunk/asyncWrapper");

const { requireRole } = require("../../../modules/auth/roles/roleAuth");

const Router = express.Router();



// ✅ Create new lease
Router.post(
    "/",
    requireRole(["manager", "owner"]),
    asyncWrapper(leaseController.createLease)
);



// ✅ Get all leases
Router.get(
    "/",
    requireRole(["manager", "owner"]),
    asyncWrapper(leaseController.getAllLeases)
);


// ✅ Get lease by ID
Router.get(
    "/:id",
    requireRole(["manager", "owner", "tenant"]),
    asyncWrapper(leaseController.getLeaseById)
);



// ✅ Update lease
Router.patch(
    "/:id",
    requireRole(["manager", "owner"]),
    asyncWrapper(leaseController.updateLease)
);



// ✅ Delete lease
Router.delete(
    "/:id",
    requireRole(["manager", "owner"]),
    asyncWrapper(leaseController.deleteLease)
);

module.exports = Router;
