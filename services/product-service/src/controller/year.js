const Year = require("../models/year");
const {
  sendSuccess,
  sendError,
} = require("/packages/utils/responseHandler");
const logger = require("/packages/utils/logger");
const XLSX = require("xlsx");
// ✅ Create a Year
exports.createYear = async (req, res) => {
  try {
    const { year_name, created_by, updated_by } = req.body;

    const existingYear = await Year.findOne({ year_name });
    if (existingYear) return sendError(res, "Year already exists", 400);

    const year = await Year.create({
      year_name,
      created_by,
      updated_by,
    });

    logger.info(`✅ Year created: ${year_name}`);
    return sendSuccess(res, year, "Year created successfully");
  } catch (err) {
    logger.error(`❌ Create year error: ${err.message}`);
    return sendError(res, err);
  }
};

// ✅ Get All Years
exports.getAllYears = async (req, res) => {
  try {
    const years = await Year.find().sort({ created_at: -1 });
    logger.info("✅ Retrieved all years");
    return sendSuccess(res, years);
  } catch (err) {
    logger.error(`❌ Get all years error: ${err.message}`);
    return sendError(res, err);
  }
};

// ✅ Get Year by ID
exports.getYearById = async (req, res) => {
  try {
    const { yearId } = req.params;
    const year = await Year.findById(yearId);

    if (!year) return sendError(res, "Year not found", 404);

    logger.info(`✅ Retrieved year by ID: ${yearId}`);
    return sendSuccess(res, year);
  } catch (err) {
    logger.error(`❌ Get year by ID error: ${err.message}`);
    return sendError(res, err);
  }
};

// ✅ Update Year
exports.updateYear = async (req, res) => {
  try {
    const { yearId } = req.params;
    const { year_name, updated_by } = req.body;

    const existingYear = await Year.findOne({ year_name });
    if (existingYear) return sendError(res, "Year already exists", 400);

    const updatedYear = await Year.findByIdAndUpdate(
      yearId,
      {
        year_name,
        updated_by,
        updated_at: new Date(),
      },
      { new: true }
    );

    if (!updatedYear) return sendError(res, "Year not found", 404);

    logger.info(`✅ Updated year: ${yearId}`);
    return sendSuccess(res, updatedYear, "Year updated successfully");
  } catch (err) {
    logger.error(`❌ Update year error: ${err.message}`);
    return sendError(res, err);
  }
};

// ✅ Delete Year
exports.deleteYear = async (req, res) => {
  try {
    const { yearId } = req.params;

    const deleted = await Year.findByIdAndDelete(yearId);
    if (!deleted) return sendError(res, "Year not found", 404);

    logger.info(`🗑️ Deleted year: ${yearId}`);
    return sendSuccess(res, deleted, "Year deleted successfully");
  } catch (err) {
    logger.error(`❌ Delete year error: ${err.message}`);
    return sendError(res, err);
  }
};


exports.bulkUploadYears = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV/Excel file is required (field name: file)",
      });
    }

    // Read Excel/CSV buffer
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file is empty",
      });
    }

    let docs = [];
    let errors = [];
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // header is row 1

      let yearName = row.year_name;

      if (!yearName) {
        errors.push({
          row: rowNumber,
          error: "Missing year_name",
        });
        skipped++;
        continue;
      }

      // Convert number → string safely
      yearName = String(yearName).trim();

      docs.push({
        year_name: yearName,
      });
    }

    // Remove duplicates inside file itself
    const uniqueDocs = docs.filter(
      (v, i, a) => a.findIndex((t) => t.year_name === v.year_name) === i
    );

    // Fetch already existing years
    const existing = await Year.find({
      year_name: { $in: uniqueDocs.map((d) => d.year_name) },
    }).select("year_name");

    const existingSet = new Set(existing.map((e) => e.year_name));

    // Exclude years already present in DB
    const finalDocs = uniqueDocs.filter((d) => !existingSet.has(d.year_name));

    let inserted = 0;

    if (finalDocs.length > 0) {
      const result = await Year.insertMany(finalDocs, { ordered: false });
      inserted = result.length;
    }

    return res.status(200).json({
      success: true,
      message: "Bulk year upload completed",
      totalRows: rows.length,
      inserted,
      skipped: skipped + existingSet.size,
      errors,
    });
  } catch (err) {
    console.error("Bulk Upload Failed:", err);
    return res.status(500).json({
      success: false,
      message: "Bulk upload failed",
      error: err.message,
    });
  }
};
