const Model = require("../models/model");
const Brand = require("../models/brand");
const { uploadFile } = require("/packages/utils/s3Helper");
const { sendSuccess, sendError } = require("/packages/utils/responseHandler");
const logger = require("/packages/utils/logger");
const axios = require("axios");
const {
  createUnicastOrMulticastNotificationUtilityFunction,
} = require("../../../../packages/utils/notificationService");
const XLSX = require("xlsx");
const stream = require("stream");
const path = require("path");
const unzipper = require("unzipper");


// ✅ Create Model
exports.createModel = async (req, res) => {
  try {
    const {
      model_name,
      model_code,
      brand_ref,
      created_by,
      updated_by,
      status,
    } = req.body;

    let model_image;
    if (req.file) {
      const uploaded = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "models"
      );
      model_image = uploaded.Location;
    } else {
      return sendError(res, "Model image is required", 400);
    }

    const newModel = await Model.create({
      model_name,
      model_code,
      brand_ref,
      model_image,
      created_by,
      updated_by,
      status,
    });

    const userData = await axios.get(`http://user-service:5001/api/users/`, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    let filteredUsers = userData.data.data.filter(
      (user) =>
        user.role === "Super-admin" ||
        user.role === "Inventory-Admin" ||
        user.role === "Inventory-Staff"
    );
    let users = filteredUsers.map((user) => user._id);
    const successData =
      await createUnicastOrMulticastNotificationUtilityFunction(
        users,
        ["INAPP", "PUSH"],
        "Model Create ALERT",
        `New Model has been created by ${created_by} - ${model_name}`,
        "",
        "",
        "Model",
        {
          model_id: newModel._id,
        },
        req.headers.authorization
      );
    if (!successData.success) {
      logger.error("❌ Create notification error:", successData.message);
    } else {
      logger.info("✅ Notification created successfully");
    }

    logger.info("✅ Model created successfully");
    return sendSuccess(res, newModel, "Model created successfully");
  } catch (err) {
    logger.error(`❌ Create model error: ${err.message}`);
    return sendError(res, err);
  }
};

// ✅ Get All Models
exports.getAllModel = async (req, res) => {
  try {
    const models = await Model.find()
      .populate("brand_ref")
      .sort({ created_at: -1 });
    logger.info("✅ Fetched all models");
    return sendSuccess(res, models, "Models fetched successfully");
  } catch (err) {
    logger.error(`❌ Get all models error: ${err.message}`);
    return sendError(res, err);
  }
};

// ✅ Update Model
exports.updateModel = async (req, res) => {
  try {
    const { modelId } = req.params;
    const { model_name, model_code, brand_ref, updated_by, status } = req.body;

    const updateData = {
      model_name,
      model_code,
      brand_ref,
      updated_by,
      status,
      updated_at: new Date(),
    };

    if (req.file) {
      const uploaded = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "models"
      );
      updateData.model_image = uploaded.Location;
    }

    const updatedModel = await Model.findByIdAndUpdate(modelId, updateData, {
      new: true,
    });

    if (!updatedModel) return sendErrorResponse(res, "Model not found", 404);

    const userData = await axios.get(`http://user-service:5001/api/users/`, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    let filteredUsers = userData.data.data.filter(
      (user) =>
        user.role === "Super-admin" ||
        user.role === "Inventory-Admin" ||
        user.role === "Inventory-Staff"
    );
    let users = filteredUsers.map((user) => user._id);
    const successData =
      await createUnicastOrMulticastNotificationUtilityFunction(
        users,
        ["INAPP", "PUSH"],
        "Model Update ALERT",
        ` Model has been updated by ${updated_by} - ${model_name}`,
        "",
        "",
        "Model",
        {
          model_id: updatedModel._id,
        },
        req.headers.authorization
      );
    if (!successData.success) {
      logger.error("❌ Create notification error:", successData.message);
    } else {
      logger.info("✅ Notification created successfully");
    }

    logger.info(`✅ Model updated: ${modelId}`);
    return sendSuccess(res, updatedModel, "Model updated successfully");
  } catch (err) {
    logger.error(`❌ Update model error: ${err.message}`);
    return sendError(res, err);
  }
};

// ✅ Delete Model
exports.deleteModel = async (req, res) => {
  try {
    const { modelId } = req.params;
    const deleted = await Model.findByIdAndDelete(modelId);

    if (!deleted) return sendErrorResponse(res, "Model not found", 404);

    const userData = await axios.get(`http://user-service:5001/api/users/`, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    let filteredUsers = userData.data.data.filter(
      (user) =>
        user.role === "Super-admin" ||
        user.role === "Inventory-Admin" ||
        user.role === "Inventory-Staff"
    );
    let users = filteredUsers.map((user) => user._id);
    const successData =
      await createUnicastOrMulticastNotificationUtilityFunction(
        users,
        ["INAPP", "PUSH"],
        "Model Delete ALERT",
        ` Model has been deleted`,
        "",
        "",
        "Model",
        {
          model_id: deleted._id,
        },
        req.headers.authorization
      );
    if (!successData.success) {
      logger.error("❌ Create notification error:", successData.message);
    } else {
      logger.info("✅ Notification created successfully");
    }

    logger.info(`🗑️ Deleted model: ${modelId}`);
    return sendSuccess(res, null, "Model deleted successfully");
  } catch (err) {
    logger.error(`❌ Delete model error: ${err.message}`);
    return sendError(res, err);
  }
};

// ✅ Get Models By Brand
exports.getModelByBrands = async (req, res) => {
  try {
    const { brandId } = req.params;

    const models = await Model.find({ brand_ref: brandId }).populate(
      "brand_ref"
    );

    // Return empty array instead of error when no models found
    if (!models || models.length === 0) {
      logger.info(
        `ℹ️ No models found for brand ID: ${brandId} - returning empty list`
      );
      return sendSuccess(res, [], "No models found for this brand");
    }

    logger.info(`✅ Fetched models by brand ID: ${brandId}`);
    return sendSuccess(res, models, "Models fetched successfully");
  } catch (err) {
    logger.error(`❌ Get models by brand error: ${err.message}`);
    return sendError(res, err);
  }
};


async function streamToBuffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

exports.bulkUploadModels = async (req, res) => {
  try {
    const excelBuf = req.files?.dataFile?.[0]?.buffer;
    const zipBuf = req.files?.imageZip?.[0]?.buffer;
    if (!excelBuf || !zipBuf) {
      return sendError(res, "Both dataFile & imageZip are required", 400);
    }

    // 1️⃣ Parse CSV
    const wb = XLSX.read(excelBuf, { type: "buffer" });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    if (!rows.length) {
      return sendError(res, "No data found in CSV", 400);
    }

    // 2️⃣ Upload images from ZIP to S3
    const imageMap = {}; // model_code.toLowerCase() → S3 URL
    let totalZip = 0, imgOk = 0, imgSkip = 0, imgFail = 0;
    const zipStream = stream.Readable.from(zipBuf).pipe(
      unzipper.Parse({ forceStream: true })
    );

    for await (const entry of zipStream) {
      totalZip++;
      if (entry.type === "Directory") {
        imgSkip++;
        entry.autodrain();
        continue;
      }
      const base = path.basename(entry.path);
      const m = base.match(/^(.+?)\.(jpe?g|png|webp)$/i);
      if (!m) {
        imgSkip++;
        entry.autodrain();
        continue;
      }
      const key = m[1].toLowerCase();
      const mime = `image/${m[2].toLowerCase() === "jpg" ? "jpeg" : m[2].toLowerCase()}`;
      try {
        const buf = await streamToBuffer(entry);
        const { Location } = await uploadFile(buf, base, mime, "model-images");
        imageMap[key] = Location;
        imgOk++;
      } catch (e) {
        imgFail++;
        console.error(`Image upload failed for ${base}:`, e.message);
      }
    }

    // 3️⃣ Prepare brand name → _id map
    const uniqBrands = [...new Set(rows.map(r => String(r.brand_name || "").trim()).filter(Boolean))];
    const brandDocs = await Brand.find({ brand_name: { $in: uniqBrands } });
    const brandMap = new Map(brandDocs.map(b => [b.brand_name.trim().toLowerCase(), b._id]));

    // 4️⃣ Build docs
    const docs = [];
    const errors = [];
    for (const row of rows) {
      const brandId = brandMap.get(String(row.brand_name || "").trim().toLowerCase());
      if (!brandId) {
        errors.push({ model_code: row.model_code, error: `Unknown brand: ${row.brand_name}` });
        continue;
      }
      docs.push({
        model_name: row.model_name,
        model_code: row.model_code,
        brand_ref: brandId,
        model_image: imageMap[row.model_code.toLowerCase()] || "",
        created_by: row.created_by || "system",
        updated_by: row.updated_by || "system",
        status: row.status || "Created",
      });
    }

    if (!docs.length) {
      return sendError(res, "No valid models to insert", 400);
    }

    // 5️⃣ Insert
    const inserted = await Model.insertMany(docs, { ordered: false });
    return sendSuccess(res, {
      totalRows: rows.length,
      inserted: inserted.length,
      imgSummary: { total: totalZip, ok: imgOk, skip: imgSkip, fail: imgFail },
      errors
    }, "Models bulk uploaded successfully");
  } catch (err) {
    console.error("Bulk upload models error:", err);
    return sendError(res, err.message, 500);
  }
};
