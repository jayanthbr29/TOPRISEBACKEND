const express = require("express");
const router = express.Router();
const actionAuditLogController = require("../controllers/actionAuditLogsController");



router.post("/create", actionAuditLogController.createActionAuditLog);
router.get("/",  actionAuditLogController.getActionAuditLogs);

module.exports = router;
