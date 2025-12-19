const express = require("express");

const multer = require("multer");
const upload = multer();
const router = express.Router();
const yearController = require("../controller/year");
const {
  authenticate,
  authorizeRoles,
} = require("/packages/utils/authMiddleware");
const auditLogger = require("../.././../../packages/utils/auditLoggerMiddleware");



router.post(
  "/",
   auditLogger("Year_Created", "CONTENT_MANAGEMENT"),
  authenticate,
  authorizeRoles("Super-admin", "Fulfillment-Admin"),
  yearController.createYear
);
router.get("/", yearController.getAllYears);
router.get("/:yearId", yearController.getYearById);
router.put(
  "/:yearId",
  authenticate,
   auditLogger("Year_Edited", "CONTENT_MANAGEMENT"),
  authorizeRoles("Super-admin", "Fulfillment-Admin"),
  yearController.updateYear
);
router.delete("/:yearId",
  auditLogger("Year_Deleted", "CONTENT_MANAGEMENT"),
  yearController.deleteYear);

router.post("/bulk-upload", 
  auditLogger("Year_Bulk_Upload", "CONTENT_MANAGEMENT"),
  upload.single("dataFile"), yearController.bulkUploadYears);
module.exports = router;
