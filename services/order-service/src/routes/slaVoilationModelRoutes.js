const express = require("express");
const router = express.Router();

const  slaController = require("../controllers/slaVoilationModelController");

router.post("/", slaController.createSLAViolation);


router.get("/", slaController.getAllSLAViolations);


router.get("/dealer/:dealerId", slaController.getSLAViolationsByDealerId);

router.get("/:id", slaController.getSLAViolationById);

router.patch("/:id/remark", slaController.addSLARemark);


router.patch("/:id/resolve", slaController.resolveSLAViolation);

router.patch("/:id/close", slaController.closeSLAViolation);

router.post("/checkVoilation", slaController.checkAndCreateSLAVoilation);
module.exports = router;
