const express = require("express");
const router = express.Router();
const MpesaController = require("../controllers/mpesa.controller");
const { authMiddleware } = require("../../auth/middleware/authMiddleware"); // assuming an authMiddleware middleware

const mpesaController = new MpesaController();

// Private routes (require authentication)
router.get(
  "/token",
  authMiddleware,
  mpesaController.generateToken.bind(mpesaController)
);
router.post(
  "/stk-push/rent",
  authMiddleware,
  mpesaController.initiateRentPayment.bind(mpesaController)
);
router.get(
  "/:paymentId",
  authMiddleware,
  mpesaController.getPaymentStatus.bind(mpesaController)
);
router.get(
  "/tenant/:tenantId",
  authMiddleware,
  mpesaController.getPaymentsByTenant.bind(mpesaController)
);
router.get(
  "/unit/:unitId",
  authMiddleware,
  mpesaController.getPaymentsByUnit.bind(mpesaController)
);
router.patch(
  "/:paymentId/cancel",
  authMiddleware,
  mpesaController.cancelPayment.bind(mpesaController)
);
router.get(
  "/statistics",
  authMiddleware,
  mpesaController.getPaymentStatistics.bind(mpesaController)
);

// Public route (MPesa callback does not require authentication)
router.post(
  "/callback/:paymentId",
  mpesaController.processCallback.bind(mpesaController)
);

module.exports = router;
