
const express = require("express");
const multer = require("multer");
const router = express.Router();
const brandController = require("../controller/brand");
const auditLogger = require("../.././../../packages/utils/auditLoggerMiddleware");
const {
  authenticate,
  authorizeRoles,
} = require("/packages/utils/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  upload.single("file"), // Image file should be sent with key: 'file'
  authenticate,
  auditLogger("Brand_Created", "CONTENT_MANAGEMENT"),
  authorizeRoles("Super-admin", "Fulfillment-Admin"),
  brandController.createBrand
);

router.get(
  "/",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin", "User", "Dealer"),
  brandController.getAllBrands
);
router.get("/brandByType/:type", brandController.getBrandsByType);

// GET Brand Count
router.get(
  "/count",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin", "Inventory-Admin", "Analytics-Admin"),
  brandController.getBrandCount
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin", "User"),
  brandController.getBrandById
);

router.put(
  "/:id",
  authenticate,
  auditLogger("Brand_Edited", "CONTENT_MANAGEMENT"),
  authorizeRoles("Super-admin", "Fulfillment-Admin"),
  upload.single("file"), // Optional updated image
  brandController.updateBrand
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin"),
   auditLogger("Brand_Deleted", "CONTENT_MANAGEMENT"),
  brandController.deleteBrand
);

router.post(
  "/bulk-upload/brands",
  authenticate,
   auditLogger("Brand_Bulk_Upload", "CONTENT_MANAGEMENT"),
  authorizeRoles("Super-admin", "Inventory-Admin"),
  upload.fields([
    { name: "dataFile", maxCount: 1 },
    { name: "imageZip", maxCount: 1 },
  ]),
  brandController.bulkUploadBrands
);

router.patch(
  "/active/deactive/brand/:id",
  authenticate,
  brandController.activateOrDeactivateBrand
);
router.get(
  "/get/brand/byName/:name",
  authenticate,
  brandController.getBrandByName
);
router.get("/get/brands/by/delaer/:dealerId/:type", authenticate, brandController.getBrandsByDealerID);

module.exports = router;
