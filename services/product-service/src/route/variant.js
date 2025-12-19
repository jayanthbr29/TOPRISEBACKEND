const express = require("express");
const router = express.Router();
const variantController = require("../controller/variant");
const {
  authenticate,
  authorizeRoles,
} = require("/packages/utils/authMiddleware");
const multer = require("multer");
const auditLogger = require("../.././../../packages/utils/auditLoggerMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin"),
  upload.single("file"),
    auditLogger("Variant_Created", "CONTENT_MANAGEMENT"),
  variantController.createVariant
);

router.get(
  "/",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin", "User", "Dealer"),
  variantController.getAllVariants
);

router.get(
  "/model/:modelId",
  // authenticate,
  // authorizeRoles("Super-admin", "Fulfillment-Admin", "User"),
  variantController.getVariantsByModel
);

// GET Variant Count
router.get(
  "/count",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin", "Inventory-Admin", "Analytics-Admin"),
  variantController.getVariantCount
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin", "User"),
  variantController.getVariantById
);

router.put(
  "/:id",
  authenticate,
    auditLogger("Variant_Edited", "CONTENT_MANAGEMENT"),
  authorizeRoles("Super-admin", "Fulfillment-Admin"),
  upload.single("file"),
  variantController.updateVariant
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin"),
   auditLogger("Variant_Deleted", "CONTENT_MANAGEMENT"),
  variantController.deleteVariant
);

router.post(
  "/bulk-upload/variants",
  authenticate,
   auditLogger("Variant_Bulk_Upload", "CONTENT_MANAGEMENT"),
  authorizeRoles("Super-admin", "Inventory-Admin"),
  upload.fields([
    { name: "dataFile", maxCount: 1 },
    { name: "imageZip", maxCount: 1 },
  ]),
  variantController.bulkUploadVariants
);
router.post("/get/variants/byModelIds", variantController.getVarientsBymodelIds);

module.exports = router;
