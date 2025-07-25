const Variant = require("../models/variantModel");
const redisClient = require("/packages/utils/redisClient");
const logger = require("/packages/utils/logger");
const { sendSuccess, sendError } = require("/packages/utils/responseHandler");
const { uploadFile } = require("/packages/utils/s3Helper");
const { cacheGet, cacheSet } = require("/packages/utils/cache"); // ⬅️ NEW
const axios = require("axios");
const { createUnicastOrMulticastNotificationUtilityFunction } = require("../../../../packages/utils/notificationService");

// Helper function to clear relevant Redis cache
const clearVariantCache = async (keys = []) => {
  try {
    const cacheKeys = keys.length ? keys : await redisClient.keys("variant:*");
    if (cacheKeys.length) {
      await redisClient.del(cacheKeys);
    }
    await redisClient.del("variants:all");
  } catch (cacheError) {
    logger.error(`Cache clearance error: ${cacheError.message}`);
  }
};

// Create a new variant
exports.createVariant = async (req, res) => {
  try {
    const {
      variant_name,
      variant_code,
      variant_Description,
      model,
      Year,
      variant_status = "active",
      created_by,
    } = req.body;

    // Validate required fields
    if (!variant_name || !variant_code || !variant_Description || !model) {
      return sendError(res, "Missing required fields", 400);
    }

    // Handle image upload

    // Create new variant
    const newVariant = await Variant.create({
      variant_name,
      variant_code,
      variant_Description,
      variant_status,
      model,
      Year: Array.isArray(Year) ? Year : [Year],
      created_by,
      updated_by: [
        {
          updated_by: created_by,
          change_logs: "Initial creation",
        },
      ],
    });

    // Clear relevant cache
    await clearVariantCache();
    const userData = await axios.get(`http://user-service:5001/api/users/`, {
      headers: {
        Authorization: req.headers.authorization
      }
    })

    let filteredUsers = userData.data.data.filter(user => user.role === "Super-admin" || user.role === "Inventory-Admin" || user.role === "Inventory-Staff");
    let users = filteredUsers.map(user => user._id);
    const successData = await createUnicastOrMulticastNotificationUtilityFunction(
      users,
      ["INAPP", "PUSH"],
      "Varaint Create ALERT",
      `New Variant has been created by ${created_by} - ${variant_name}`,
      "",
      "",
      "Variant",
      {
        variant_id: newVariant._id
      },
      req.headers.authorization
    )
    if (!successData.success) {
      logger.error("❌ Create notification error:", successData.message);
    } else {
      logger.info("✅ Notification created successfully");
    }

    logger.info(`✅ Variant ${newVariant._id} created successfully`);
    return sendSuccess(res, newVariant, "Variant created successfully", 201);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      logger.error(`❌ Duplicate ${field}: ${err.keyValue[field]}`);
      return sendError(res, `${field} already exists`, 409);
    }
    logger.error(`❌ Create variant error: ${err.message}`);
    return sendError(res, "Failed to create variant", 500);
  }
};

// Get all variants with optional filtering
exports.getAllVariants = async (req, res) => {
  try {
    const { model, status, search } = req.query;
    const cacheKey = `variants:${model || "all"}:${status || "all"}:${search || "all"
      }`;

    // Try cache first
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   logger.info("🔁 Served variants from cache");
    //   return sendSuccess(res, JSON.parse(cached));
    // }

    // Build query
    const query = {};
    if (model) query.model = model;
    if (status) query.variant_status = status;
    if (search) {
      query.$or = [
        { variant_name: { $regex: search, $options: "i" } },
        { variant_code: { $regex: search, $options: "i" } },
        { variant_Description: { $regex: search, $options: "i" } },
      ];
    }

    const variants = await Variant.find(query)
      .populate("model", "model_name model_code")
      .populate("Year", "year_name year_code")
      .sort({ created_at: -1 });

    // Cache results
    // await redisClient.setEx(cacheKey, 3600, JSON.stringify(variants));

    logger.info("✅ Fetched all variants from database");
    return sendSuccess(res, variants, "Variants fetched successfully");
  } catch (err) {
    logger.error(`❌ Get all variants error: ${err.message}`);
    return sendError(res, "Failed to fetch variants", 500);
  }
};

// Get variants by model ID
exports.getVariantsByModel = async (req, res) => {
  try {
    const { modelId } = req.params;
    const cacheKey = `variants:model:${modelId}`;

    /* 1️⃣  Try cache (uses read-only Redis client) */
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.info(`🔁 variants:model:${modelId}  – served from cache`);
      return sendSuccess(res, cached);
    }

    /* 2️⃣  Hit MongoDB */
    const variants = await Variant.find({ model: modelId })
      .populate("model", "model_name model_code")
      // .populate("year_range", "year_name year_code") // adjust field → schema
      .sort({ variant_name: 1 })
      .lean(); // lean ⇒ smaller doc

    /* 3️⃣  Nothing?  Return empty list, still 200 OK */
    if (!variants.length) {
      logger.info(`ℹ️ No variants for model ${modelId}`);
      return sendSuccess(res, [], "No variants found for this model");
    }

    /* 4️⃣  Cache the fresh list (writer client) – 1 h TTL */
    await cacheSet(cacheKey, variants, 60 * 60);

    logger.info(`✅ variants:model:${modelId}  – fetched from Mongo`);
    return sendSuccess(res, variants, "Variants fetched successfully");
  } catch (err) {
    logger.error(`❌ getVariantsByModel: ${err.message}`);
    return sendError(res, err); // sendError already sets 500
  }
};

// Get single variant by ID
exports.getVariantById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `variant:${id}`;

    // Try cache first
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   logger.info(`🔁 Served variant ${id} from cache`);
    //   return sendSuccess(res, JSON.parse(cached));
    // }

    const variant = await Variant.findById(id)
      .populate("model", "model_name model_code")
      .populate("Year", "year_name year_code");

    if (!variant) {
      logger.error(`❌ Variant not found with ID: ${id}`);
      return sendError(res, "Variant not found", 404);
    }

    // Cache result
    // await redisClient.setEx(cacheKey, 1800, JSON.stringify(variant));

    logger.info(`✅ Fetched variant ${id}`);
    return sendSuccess(res, variant, "Variant fetched successfully");
  } catch (err) {
    logger.error(`❌ Get variant error: ${err.message}`);
    return sendError(res, "Failed to fetch variant", 500);
  }
};

// Update variant
exports.updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { updated_by, change_logs, ...updateData } = req.body;

    // Find existing variant first
    const existingVariant = await Variant.findById(id);
    if (!existingVariant) {
      logger.error(`❌ Variant not found with ID: ${id}`);
      return sendError(res, "Variant not found", 404);
    }

    // Handle image update if provided
    if (req.file) {
      const uploaded = await uploadFile(
        req.file.buffer,
        `variant-${Date.now()}-${req.file.originalname}`,
        req.file.mimetype,
        "variants"
      );
      updateData.variant_image = uploaded.Location;
    }

    // Prepare update object
    const update = {
      ...updateData,
      $push: {
        updated_by: {
          updated_by,
          change_logs: change_logs || "Fields updated",
        },
      },
    };

    const updatedVariant = await Variant.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("model", "model_name model_code")
      .populate("Year", "year_name year_code");

    // Clear relevant cache
    await clearVariantCache([
      `variant:${id}`,
      `variants:model:${updatedVariant.model}`,
    ]);
    const userData = await axios.get(`http://user-service:5001/api/users/`, {
      headers: {
        Authorization: req.headers.authorization
      }
    })

    let filteredUsers = userData.data.data.filter(user => user.role === "Super-admin" || user.role === "Inventory-Admin" || user.role === "Inventory-Staff");
    let users = filteredUsers.map(user => user._id);
    const successData = await createUnicastOrMulticastNotificationUtilityFunction(
      users,
      ["INAPP", "PUSH"],
      "Varaint Update ALERT",
      `Variat has been updaed by ${updated_by} - ${updatedVariant.variant_name}`,
      "",
      "",
      "Variant",
      {
        variant_id: updatedVariant._id
      },
      req.headers.authorization
    )
    if (!successData.success) {
      logger.error("❌ Create notification error:", successData.message);
    } else {
      logger.info("✅ Notification created successfully");
    }

    logger.info(`✅ Variant ${id} updated successfully`);
    return sendSuccess(res, updatedVariant, "Variant updated successfully");
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      logger.error(`❌ Duplicate ${field}: ${err.keyValue[field]}`);
      return sendError(res, `${field} already exists`, 409);
    }
    logger.error(`❌ Update variant error: ${err.message}`);
    return sendError(res, "Failed to update variant", 500);
  }
};

// Delete variant
exports.deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await Variant.findByIdAndDelete(id);
    if (!variant) {
      logger.error(`❌ Variant not found with ID: ${id}`);
      return sendError(res, "Variant not found", 404);
    }

    // Clear relevant cache
    await clearVariantCache([
      `variant:${id}`,
      `variants:model:${variant.model}`,
    ]);

    const userData = await axios.get(`http://user-service:5001/api/users/`, {
      headers: {
        Authorization: req.headers.authorization
      }
    })

    let filteredUsers = userData.data.data.filter(user => user.role === "Super-admin" || user.role === "Inventory-Admin" || user.role === "Inventory-Staff");
    let users = filteredUsers.map(user => user._id);
    const successData = await createUnicastOrMulticastNotificationUtilityFunction(
      users,
      ["INAPP", "PUSH"],
      "Varaint Delete ALERT",
      `Variat has been Deleted`,
      "",
      "",
      "Variant",
      {
        variant_id: variant._id
      },
      req.headers.authorization
    )
    if (!successData.success) {
      logger.error("❌ Create notification error:", successData.message);
    } else {
      logger.info("✅ Notification created successfully");
    }

    logger.info(`✅ Variant ${id} deleted successfully`);
    return sendSuccess(res, null, "Variant deleted successfully");
  } catch (err) {
    logger.error(`❌ Delete variant error: ${err.message}`);
    return sendError(res, "Failed to delete variant", 500);
  }
};
