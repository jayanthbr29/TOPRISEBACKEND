const express = require("express");
const router = express.Router();
const SLATypesController = require("../controllers/slaController");
const { authenticate, authorizeRoles } = require("/packages/utils/authMiddleware");
const AuditLogger = require("../utils/auditLogger");


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



module.exports = router;