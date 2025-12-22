const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  authenticate,
  authorizeRoles,
} = require("/packages/utils/authMiddleware");
const auditLogger = require("../.././../../packages/utils/auditLoggerMiddleware");
const modelController = require("../controller/model");

const storage = multer.memoryStorage();
const upload = multer({ storage });
// You can use multer S3 config here

router.post(
  "/",
  authenticate,
   auditLogger("Model_Created", "CONTENT_MANAGEMENT"),
  authorizeRoles("Super-admin", "Fulfillment-Admin","Inventory-Admin", "Inventory-Staff"),
  upload.single("model_image"),
  modelController.createModel
);
router.get("/", modelController.getAllModel);
router.get("/brand/:brandId", modelController.getModelByBrands);
router.put(
  "/:modelId",
  authenticate,
  auditLogger("Model_Edited", "CONTENT_MANAGEMENT"),
  authorizeRoles("Super-admin", "Fulfillment-Admin","Inventory-Admin", "Inventory-Staff"),
  upload.single("model_image"),
  modelController.updateModel
);
router.delete(
  "/:modelId",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin","Inventory-Admin", "Inventory-Staff"),
   auditLogger("Model_Deleted", "CONTENT_MANAGEMENT"),
  modelController.deleteModel
);
router.post(
  "/bulk-upload/models",
  authenticate,
  auditLogger("Model_Bulk_Upload", "CONTENT_MANAGEMENT"),
  authorizeRoles("Super-admin", "Inventory-Admin","Inventory-Admin", "Inventory-Staff"),
  upload.fields([
    { name: "dataFile", maxCount: 1 },
    { name: "imageZip", maxCount: 1 },
  ]),
  modelController.bulkUploadModels
);

router.patch(
  "/active/deactive/model/:id",
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin","Inventory-Admin", "Inventory-Staff"),
  modelController.activateOrDeactivateModel
);

module.exports = router;
