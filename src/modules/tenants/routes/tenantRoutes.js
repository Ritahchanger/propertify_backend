const express = require("express");
const tenantController = require("../controllers/tenantController");
const asyncWrapper = require("../../../shared/middlewares/async-thunk/asyncWrapper");
const { requireRole, requirePermission } = require('../../../modules/auth/roles/roleAuth');

const Router = express.Router();


Router.post("/applications",
    requireRole(['tenant', 'owner', 'manager']),
    asyncWrapper(tenantController.createApplication)
);



Router.get("/applications",
    requireRole(['owner', 'manager']),
    asyncWrapper(tenantController.getApplications)
);


Router.get("/applications/:id",
    requireRole(['owner', 'manager', 'tenant']),
    asyncWrapper(tenantController.getApplicationById)
);



Router.patch("/applications/:id/status",
    requireRole(['owner', 'manager']),
    asyncWrapper(tenantController.updateApplicationStatus)
);

module.exports = Router;