const express = require("express");
const Router = express.Router();
const UserController = require("../controllers/user.controller");



const asyncWrapper = require("../../../shared/middlewares/async-thunk/asyncWrapper");

// Apply auth middleware to all routes


// Stats routes
Router.get("/stats/admin", asyncWrapper(UserController.getAdminStats));
Router.get("/stats/dashboard", asyncWrapper(UserController.getDashboardStats));
Router.get("/stats/user/:userId", asyncWrapper(UserController.getUserStats));

// User management routes
Router.post("/", asyncWrapper(UserController.createUser));
Router.get("/", asyncWrapper(UserController.getAllUsers));
Router.get("/:id", asyncWrapper(UserController.getUserById));
Router.put("/:id", asyncWrapper(UserController.updateUser));
Router.delete("/:id", asyncWrapper(UserController.deleteUser));

module.exports = Router;
