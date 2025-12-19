const express = require("express");
const router = express.Router();
const refundController = require("../controllers/refund");
const {
  authenticate,
  authorizeRoles,
} = require("/packages/utils/authMiddleware");
const auditLogger = require("../.././../../packages/utils/auditLoggerMiddleware");

router.post(
  "/createRefund-online",
  auditLogger("Refund_Initiated_Prepaid", "PAYMENTS"),
  // authenticate,
  // authorizeRoles("Super-admin", "Inventory-Admin", "User"),
  refundController.createPartialRefund
);
router.post(
  "/createRefund-cod",
  authenticate,
   auditLogger("Refund_Initiated_COD", "PAYMENTS"),
  authorizeRoles("Super-admin", "Inventory-Admin", "User"),
  refundController.createPayout
);

router.get(
  "/",
  authenticate,
  authorizeRoles("Super-admin", "Inventory-Admin", "User"),
  refundController.getAllRefunds
);

router.get(
  "/byId/:refundId",
  authenticate,
  authorizeRoles("Super-admin", "Inventory-Admin", "User"),
  refundController.getRefundById
);

router.post("/processRefund/manual",
  refundController.createManualRefund
);



module.exports = router;