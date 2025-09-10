const express = require("express");

const tenantController = require("../controllers/tenantController");

const asyncWrapper = require("../../../shared/middlewares/async-thunk/asyncWrapper");

const Router = express.Router();

Router.post("/applications", asyncWrapper(tenantController.createApplication));

Router.get("/applications", asyncWrapper(tenantController.getApplications));

Router.get("/applications/:id", asyncWrapper(tenantController.getApplicationById));

Router.patch("/applications/:id/status", asyncWrapper(tenantController.updateApplicationStatus));

module.exports = Router;
