const Banner = require("../models/banner");
const { sendSuccess, sendError } = require("/packages/utils/responseHandler");
const logger = require("/packages/utils/logger");
const { uploadFile } = require("/packages/utils/s3Helper");
const mongoose = require("mongoose");

const XLSX = require("xlsx");
const stream = require("stream");
const path = require("path");
const unzipper = require("unzipper");
exports.createBanner = async (req, res, next) => {
  try {
    const { title, brand_id, vehicle_type, is_active } = req.body;

    if (!title || !brand_id || !vehicle_type) {
      logger.error("Title, brand_id and vehicle_type are required");
      return sendError(
        res,
        "Title, brand_id and vehicle_type are required",
        400
      );
    }

    // Check if files are uploaded
    if (
      !req.files ||
      !req.files["web"] ||
      !req.files["mobile"] ||
      !req.files["tablet"]
    ) {
      logger.error("Web, mobile and tablet images are required");
      return sendError(res, "Web, mobile and tablet images are required", 400);
    }

    // Upload images to S3
    const webImage = req.files["web"][0];
    const mobileImage = req.files["mobile"][0];
    const tabletImage = req.files["tablet"][0];

    const [webUpload, mobileUpload, tabletUpload] = await Promise.all([
      uploadFile(
        webImage.buffer,
        webImage.originalname,
        webImage.mimetype,
        "banners"
      ),
      uploadFile(
        mobileImage.buffer,
        mobileImage.originalname,
        mobileImage.mimetype,
        "banners"
      ),
      uploadFile(
        tabletImage.buffer,
        tabletImage.originalname,
        tabletImage.mimetype,
        "banners"
      ),
    ]);

    // Create banner with image URLs
    const banner = new Banner({
      title,
      image: {
        web: webUpload.Location,
        mobile: mobileUpload.Location,
        tablet: tabletUpload.Location,
      },
      brand_id,
      vehicle_type,
      is_active: is_active || false,
    });

    await banner.save();
    logger.info("Banner created successfully");
    return sendSuccess(res, banner, "Banner created successfully");
  } catch (error) {
    logger.error("Error creating banner:", error);
    return sendError(res, error);
  }
};
const Brand = require("../models/brand");
const Type = require("../models/type");

// Get all banners
exports.getAllBanners = async (req, res, next) => {
  try {
    const { vehicle_type, is_active } = req.query;
    const filter = {};

    if (vehicle_type) {
      filter.vehicle_type = vehicle_type;
    }

    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    const banners = await Banner.find(filter).populate("brand_id");

    logger.info("Banners fetched successfully");
    return sendSuccess(res, banners, "Banners fetched successfully");
  } catch (error) {
    logger.error("Error fetching banners:", error);
    return sendError(res, error);
  }
};

// Get banner by ID
exports.getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id).populate("brand_id");

    if (!banner) {
      logger.error("Banner not found");
      return sendError(res, "Banner not found", 404);
    }

    logger.info("Banner fetched successfully");
    return sendSuccess(res, banner, "Banner fetched successfully");
  } catch (error) {
    logger.error("Error fetching banner:", error);
    return sendError(res, error);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, brand_id, vehicle_type, is_active } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      logger.error("Banner not found");
      return sendError(res, "Banner not found", 404);
    }

    const updates = {
      title: title || banner.title,
      brand_id: brand_id || banner.brand_id,
      vehicle_type: vehicle_type || banner.vehicle_type,
      is_active: is_active !== undefined ? is_active : banner.is_active,
    };

    if (req.files) {
      const imageUpdates = { ...banner.image };
      if (req.files["web"] && req.files["web"][0].buffer) {
        const webImage = req.files["web"][0];
        const webUpload = await uploadFile(
          webImage.buffer,
          webImage.originalname,
          webImage.mimetype,
          "banners"
        );
        imageUpdates.web = webUpload.Location;
      }

      if (req.files["mobile"] && req.files["mobile"][0].buffer) {
        const mobileImage = req.files["mobile"][0];
        const mobileUpload = await uploadFile(
          mobileImage.buffer,
          mobileImage.originalname,
          mobileImage.mimetype,
          "banners"
        );
        imageUpdates.mobile = mobileUpload.Location;
      }

      if (req.files["tablet"] && req.files["tablet"][0].buffer) {
        const tabletImage = req.files["tablet"][0];
        const tabletUpload = await uploadFile(
          tabletImage.buffer,
          tabletImage.originalname,
          tabletImage.mimetype,
          "banners"
        );
        imageUpdates.tablet = tabletUpload.Location;
      }

      updates.image = imageUpdates;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("brand_id");
    logger.info("Banner updated successfully");

    return sendSuccess(res, updatedBanner), "Banner updated successfully";
  } catch (error) {
    logger.error("Error updating banner:", error);
    return sendError(res, error);
  }
};

// Delete banner
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      logger.error("Banner not found");
      return sendError(res, "Banner not found", 404);
    }

    logger.info("Banner deleted successfully");
    return sendSuccess(res, banner, "Banner deleted successfully");
  } catch (error) {
    logger.error("Error deleting banner:", error);
    return sendError(res, error);
  }
};

// Update is_active status
exports.updateBannerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      logger.error("is_active must be a boolean");
      return sendError(res, "is_active must be a boolean", 400);
    }

    const banner = await Banner.findByIdAndUpdate(
      id,
      { is_active },
      { new: true }
    ).populate("brand_id");

    if (!banner) {
      logger.error("Banner not found");
      return sendError(res, "Banner not found", 404);
    }

    logger.info("Banner status updated successfully");
    return sendSuccess(res, banner, "Banner status updated successfully");
  } catch (error) {
    logger.error("Error updating banner status:", error);
    return sendError(res, error);
  }
};

// Get random banners
exports.getRandomBanners = async (req, res, next) => {
  try {
    const { count, vehicle_type } = req.query;
    const limit = parseInt(count) || 3;
    let filter = {
      is_active: true,
    };
    if (limit <= 0) {
      logger.error("Count must be greater than 0");
      return sendError(res, "Count must be greater than 0", 400);
    }

    if (vehicle_type) {
      if (!mongoose.Types.ObjectId.isValid(vehicle_type)) {
        return sendError(res, "Invalid vehicle_type ObjectId", 400);
      }
      filter.vehicle_type = new mongoose.Types.ObjectId(vehicle_type);
    }

    const banners = await Banner.aggregate([
      { $match: filter },
      { $sample: { size: limit } },

      // populate brand
      {
        $lookup: {
          from: "brands",
          localField: "brand_id",
          foreignField: "_id",
          as: "brand_id",
        },
      },
      { $unwind: { path: "$brand_id", preserveNullAndEmptyArrays: true } },

      // populate vehicle_type (collection name is pluralized: "types")
      {
        $lookup: {
          from: "types",
          localField: "vehicle_type",
          foreignField: "_id",
          as: "vehicle_type",
        },
      },
      { $unwind: { path: "$vehicle_type", preserveNullAndEmptyArrays: true } },
    ]);

    logger.info("Random banners fetched successfully");
    return sendSuccess(res, banners, "Random banners fetched successfully");
  } catch (error) {
    logger.error("Error fetching random banners:", error);
    return sendError(res, error);
  }
};
const streamToBuffer = async (entry) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    entry.on("data", (chunk) => chunks.push(chunk));
    entry.on("end", () => resolve(Buffer.concat(chunks)));
    entry.on("error", reject);
  });
};

exports.bulkUploadBanners = async (req, res) => {
  try {
    const excelBuf = req.files?.dataFile?.[0]?.buffer;
    const zipBuf = req.files?.imageZip?.[0]?.buffer;

    if (!excelBuf || !zipBuf) {
      return sendError(res, "Both dataFile and imageZip are required", 400);
    }

    // 1️⃣ Parse CSV
    const wb = XLSX.read(excelBuf, { type: "buffer" });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    if (!rows.length) return sendError(res, "Empty CSV file", 400);

    // 2️⃣ Load Brand + Type lookup
    const brandDocs = await Brand.find({});
    const typeDocs = await Type.find({});

    const brandMap = new Map(
      brandDocs.map(b => [String(b.brand_code).toLowerCase(), b._id])
    );

    const typeMap = new Map(
      typeDocs.map(t => [String(t.type_name).toLowerCase(), t._id])
    );

    // 3️⃣ Extract images from ZIP
    const imageMap = {}; // banner_key → { web, mobile, tablet }

    const zipStream = stream.Readable.from(zipBuf).pipe(
      unzipper.Parse({ forceStream: true })
    );

    for await (const entry of zipStream) {
      // const filename = entry.path;
      const filename = path.basename(entry.path);

      console.log("Processing file:", filename);

      // Expected: key_device.ext  → example: home_banner_web.jpg
      const match = filename.match(/^(.+?)_(web|mobile|tablet)\.(jpg|jpeg|png|webp)$/i);
      if (!match) {
        entry.autodrain();
        continue;
      }

      const key = match[1].toLowerCase();      // home_banner
      const device = match[2].toLowerCase();   // web/mobile/tablet
      const ext = match[3].toLowerCase();
      const mime = `image/${ext === "jpg" ? "jpeg" : ext}`;

      const buffer = await streamToBuffer(entry);

      const { Location } = await uploadFile(buffer, filename, mime, "banners");

      if (!imageMap[key]) imageMap[key] = {};
      imageMap[key][device] = Location;
    }
    console.log("Extracted images:", imageMap);

    // 4️⃣ Prepare docs
    const docs = [];
    const errors = [];

    for (const row of rows) {
      const bannerKey = String(row.image_key || "").trim().toLowerCase();
      const brandKey = String(row.brand_code || "").trim().toLowerCase();
      const typeKey = String(row.vehicle_type_name || "").trim().toLowerCase();

      // Validate required image files
      if (
        !imageMap[bannerKey] ||
        !imageMap[bannerKey].web ||
        !imageMap[bannerKey].mobile ||
        !imageMap[bannerKey].tablet
      ) {
        errors.push({
          row,
          error: `Missing images for key '${bannerKey}'. Required: ${bannerKey}_web.jpg, _mobile.jpg, _tablet.jpg`
        });
        continue;
      }

      // Validate brand
      const brandId = brandMap.get(brandKey);
      if (!brandId) {
        errors.push({
          row,
          error: `Unknown brand_code '${row.brand_code}'`
        });
        continue;
      }

      // Validate vehicle type
      const typeId = typeMap.get(typeKey);
      if (!typeId) {
        errors.push({
          row,
          error: `Unknown vehicle_type_name '${row.vehicle_type_name}'`
        });
        continue;
      }

      docs.push({
        title: row.title,
        brand_id: brandId,
        vehicle_type: typeId,
        is_active: String(row.is_active).toLowerCase() === "true",
        image: {
          web: imageMap[bannerKey].web,
          mobile: imageMap[bannerKey].mobile,
          tablet: imageMap[bannerKey].tablet
        }
      });
    }

    if (!docs.length) {
      return sendError(res, "No valid banners to insert", 400);
    }

    await Banner.insertMany(docs, { ordered: false });

    return sendSuccess(
      res,
      {
        totalRows: rows.length,
        inserted: docs.length,
        errors
      },
      "Bulk banners uploaded successfully"
    );

  } catch (err) {
    console.error("Bulk upload banner error:", err);
    return sendError(res, err.message, 500);
  }
};


