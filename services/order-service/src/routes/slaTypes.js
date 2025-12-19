const express = require("express");
const router = express.Router();
const SLATypesController = require("../controllers/slaController");
const { authenticate, authorizeRoles } = require("/packages/utils/authMiddleware");
const AuditLogger = require("../utils/auditLogger");

const auditLogger = require("../.././../../packages/utils/auditLoggerMiddleware");
router.get(
    "/",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Customer-Support"
    ),
    SLATypesController.getSLATypes
);
router.post(
    "/",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Customer-Support"
    ),
    auditLogger("SLA_Created", "SETTING"),
    SLATypesController.createSLAType
);
router.put(
    "/:id",
    // authenticate,
    // authorizeRoles(
    //     "Super-admin",
    //     "Fulfillment-Admin",
    //     "Fulfillment-Staff",
    //     "Inventory-Admin",
    //     "Inventory-Staff",
    //     "Customer-Support"
    // ),
     auditLogger("SLA_Edited", "SETTING"),
    SLATypesController.updateSlaTypes
);

router.get(
    "/:id",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Customer-Support"
    ),
    SLATypesController.getSLATypeById
);

router.get(
    "/all/pagination",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Customer-Support"
    ),
    SLATypesController.getSLATypesWithPagination
);
router.delete(
    "/:id",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Customer-Support"
    ),
    auditLogger("SLA_Deleted", "SETTING"),
    SLATypesController.deleteSlaType
);



module.exports = router;