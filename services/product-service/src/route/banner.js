const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
  authenticate,
  authorizeRoles,
} = require("/packages/utils/authMiddleware");
const storage = multer.memoryStorage();
// const upload = multer({ storage });

const bannerController = require("../controller/banner");
const bannerAdminController = require("../controllers/bannerAdmin");
// const upload = multer({
//   storage: multer.memoryStorage(), // Store files in memory as buffers
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
//   fileFilter: (req, file, cb) => {
//     // Validate file types
//     const allowedTypes = ["image/jpeg", "image/png", "image/webp","image/jpg"];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(
//         new Error("Only JPEG, PNG, and WebP images are allowed"),
//         false
//       );
//     }
//   },
// });
const upload = multer({ storage });

router.post(
  "/",
  upload.fields([
    { name: "web", maxCount: 1 },
    { name: "mobile", maxCount: 1 },
    { name: "tablet", maxCount: 1 },
  ]),
  authenticate,
  authorizeRoles("Super-admin"),
  bannerController.createBanner
);
router.put(
  "/:id",
  upload.fields([
    { name: "web", maxCount: 1 },
    { name: "mobile", maxCount: 1 },
    { name: "tablet", maxCount: 1 },
  ]),
  authenticate,
  authorizeRoles("Super-admin"),
  bannerController.updateBanner
);
/**
 * @route GET /api/banners/active
 * @desc Get active banners for frontend (Public)
 * @access Public
 */
router.get("/active", bannerAdminController.getActiveBanners);

router.get("/", bannerController.getAllBanners);
router.get("/:id", bannerController.getBannerById);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("Super-admin"),
  bannerController.deleteBanner
);
router.put(
  "/updateStatus/:id",
  authenticate,
  authorizeRoles("Super-admin"),
  bannerController.updateBannerStatus
);
router.get("/get/randomBanners", bannerController.getRandomBanners);
router.post(
  "/bulk-upload-banners",
  upload.fields([
    { name: "dataFile", maxCount: 1 },
    { name: "imageZip", maxCount: 1 }
  ]),
  bannerController.bulkUploadBanners
);
module.exports = router;
