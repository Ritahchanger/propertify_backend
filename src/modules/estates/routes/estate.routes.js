const express = require("express");
const EstateController = require("../controllers/estate.controller");
const asyncHandler = require("../../../shared/middlewares/async-thunk/asyncWrapper");
const { requireRole } = require("../../../modules/auth/roles/roleAuth");

const Router = express.Router();

Router.post(
  "/",
  requireRole(["owner", "manager"]),
  asyncHandler(EstateController.createEstate)
);

Router.get(
  "/",
  requireRole(["owner", "manager", "tenant", "accountant"]),
  asyncHandler(EstateController.getEstates)
);

Router.get(
  "/:id",
  requireRole(["owner", "manager", "tenant", "accountant"]),
  asyncHandler(EstateController.getEstateById)
);

Router.get(
  "/:estateId/units",
  requireRole(["owner", "manager", "tenant", "accountant"]),
  asyncHandler(EstateController.getEstateWithUnits)
);

Router.get(
  "/owner/:ownerId",
  requireRole(["owner", "manager", "tenant", "accountant"]),
  asyncHandler(EstateController.getEstatesByOwnerPaginated)
);




// Application

Router.get('/applications/owner',requireRole(["owner","manager","accountant"]), asyncHandler(EstateController.getOwnerApplications));
Router.get('/applications/owner/stats',requireRole(["owner","manager","accountant"]), asyncHandler(EstateController.getOwnerApplicationsStats));
Router.get('/applications/owner/:applicationId',requireRole(["owner","manager","accountant"]), asyncHandler(EstateController.getOwnerApplicationById));
Router.put('/applications/owner/:applicationId/status',requireRole(["owner","manager","accountant"]), asyncHandler(EstateController.updateApplicationStatus));
Router.get('/:estateId/applications',requireRole(["owner","manager","accountant"]), asyncHandler(EstateController.getEstateApplications));
Router.patch('/applications/:applicationId',requireRole(["owner","manager","accountant"]), asyncHandler(EstateController.updateApplicationStatus));

<<<<<<< HEAD
Router.get('/names/:ownerId',requireRole(["owner","manager","accountant"]), asyncHandler(EstateController.getEstateNamesByOwner));

=======
>>>>>>> 67db1866807f543c0b2960787dadb7589b05a367

module.exports = Router;
