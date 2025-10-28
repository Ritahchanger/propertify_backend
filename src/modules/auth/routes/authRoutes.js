const AuthController = require("../controllers/authController");

const { authMiddleware } = require("../middleware/authMiddleware");

const AuthAttemptController = require("../controllers/authAttemptController");

const asyncWrapper = require("../../../shared/middlewares/async-thunk/asyncWrapper");

const Router = require("express").Router();

Router.post("/register", asyncWrapper(AuthController.register));

Router.post("/login", asyncWrapper(AuthController.login));

Router.post("/refresh-token", asyncWrapper(AuthController.refreshToken));

Router.post("/logout", asyncWrapper(AuthController.logout));

Router.post(
  "/request-password-reset",
  asyncWrapper(AuthController.requestPasswordReset)
);

Router.get("/attempts", asyncWrapper(AuthAttemptController.getAll));

Router.get("/me", authMiddleware, asyncWrapper(AuthController.me));

module.exports = Router;
