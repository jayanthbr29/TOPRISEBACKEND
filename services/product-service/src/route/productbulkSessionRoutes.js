const express = require("express");
const router = express.Router();
const productBulkSessionController = require("../controller/productBulkSessionController");
const {
    authenticate,
    authorizeRoles,
} = require("/packages/utils/authMiddleware");


router.get("/", productBulkSessionController.getProductBulkSession);
router.get("/:id", productBulkSessionController.getProductBulkSessionById);
router.delete("/:id", productBulkSessionController.deleteProductBulkSessionLogById);    
router.delete("/bulk/delete", productBulkSessionController.bulkDeleteProductBulkSessionLogsByIds);
module.exports = router;