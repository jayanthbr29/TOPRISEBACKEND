const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/tickets');
const {
    authenticate,
    authorizeRoles,
} = require("/packages/utils/authMiddleware");

router.post(
    "/",
    ticketController.handleFileUpload, // Multer middleware
    authenticate,
    authorizeRoles("Super-admin", "Inventory-Admin", "User"),
    ticketController.createTicket
);

router.get(
    "/byId/:ticketId",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Dealer",
        "User",
        "Customer-Support",),
    ticketController.getTicketById
);

router.get(
    "/byUser/:userRef",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Dealer",
        "User",
        "Customer-Support",
    ),
    ticketController.getTicketByUserRef
);
router.get(
    "/byAssignedUser/:assignRef",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Dealer",
        "User",
        "Customer-Support",
    ),
    ticketController.getTicketByAssignedUserRef
);
router.get(
    "/byInvolvedUser/:involved_userId",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Dealer",
        "User",
        "Customer-Support",
    ),
    ticketController.getTicketByInvolvedUserRef
);
router.get(
    "/",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Dealer",
        "User",
        "Customer-Support",
    ),
    ticketController.getAllTickets
);
router.patch(
    "/updateStatus/:ticketId",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Dealer",
        "User",
        "Customer-Support",
    ),
    ticketController.updateTicketStatus
);
router.put(
    "/InvolveUser/:ticketId",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Dealer",
        "User",
        "Customer-Support",
    ),
    ticketController.addInvolvedUser
);
router.put(
    "/removeInvolvedUser/:ticketId",
    authenticate,
    authorizeRoles(
        "Super-admin",
        "Fulfillment-Admin",
        "Fulfillment-Staff",
        "Inventory-Admin",
        "Inventory-Staff",
        "Dealer",
        "User",
        "Customer-Support",
    ),
    ticketController.removeInvolvedUser
);

module.exports = router;