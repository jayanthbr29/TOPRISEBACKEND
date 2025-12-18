const SLATypeModel = require("../models/slaViolationMdel");

exports.createSLAViolation = async (req, res) => {
  try {
    const violation = await SLAViolationModel.create({
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return sendSuccess(res, violation, "SLA violation created successfully");
  } catch (error) {
    logger.error("Create SLA violation failed:", error);
    return sendError(res, "Failed to create SLA violation");
  }
};

exports.getAllSLAViolations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      dealer_id,
      order_id,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const pageSize = Math.max(parseInt(limit), 1);
    const skip = (currentPage - 1) * pageSize;

    const filter = {};

    if (search) {
      filter.sku = { $regex: search, $options: "i" };
    }

    if (status) filter.status = status;
    if (dealer_id) filter.dealer_id = dealer_id;
    if (order_id) filter.order_id = order_id;

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [data, totalItems] = await Promise.all([
      SLAViolationModel.find(filter)
        .populate("dealer_id", "name")
        .populate("order_id", "order_number")
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      SLAViolationModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return sendSuccess(
      res,
      {
        data,
        pagination: {
          totalItems,
          totalPages,
          currentPage,
          pageSize,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
          nextPage: currentPage < totalPages ? currentPage + 1 : null,
          previousPage: currentPage > 1 ? currentPage - 1 : null,
        },
      },
      "SLA violations fetched successfully"
    );
  } catch (error) {
    logger.error("Get SLA violations failed:", error);
    return sendError(res, "Failed to fetch SLA violations");
  }
};
exports.getSLAViolationsByDealerId = async (req, res) => {
  try {
    const { dealerId } = req.params;
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
    } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const pageSize = Math.max(parseInt(limit), 1);
    const skip = (currentPage - 1) * pageSize;

    const filter = { dealer_id: dealerId };

    if (search) {
      filter.sku = { $regex: search, $options: "i" };
    }
    if (status) filter.status = status;

    const [data, totalItems] = await Promise.all([
      SLAViolationModel.find(filter)
        .populate("order_id", "order_number")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      SLAViolationModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return sendSuccess(
      res,
      {
        data,
        pagination: {
          totalItems,
          totalPages,
          currentPage,
          pageSize,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
          nextPage: currentPage < totalPages ? currentPage + 1 : null,
          previousPage: currentPage > 1 ? currentPage - 1 : null,
        },
      },
      "Dealer SLA violations fetched successfully"
    );
  } catch (error) {
    logger.error("Get SLA violations by dealer failed:", error);
    return sendError(res, "Failed to fetch dealer SLA violations");
  }
};

exports.getSLAViolationById = async (req, res) => {
  try {
    const violation = await SLAViolationModel.findById(req.params.id)
      .populate("dealer_id", "name")
      .populate("order_id", "order_number")
      .lean();

    if (!violation) {
      return sendError(res, "SLA violation not found");
    }

    return sendSuccess(res, violation, "SLA violation fetched successfully");
  } catch (error) {
    logger.error("Get SLA violation by ID failed:", error);
    return sendError(res, "Failed to fetch SLA violation");
  }
};

exports.addSLARemark = async (req, res) => {
  try {
    const { notes, added_by } = req.body;

    const violation = await SLAViolationModel.findByIdAndUpdate(
      req.params.id,
      {
        status: "remarked",
        "notes.remark": {
          notes,
          added_by,
          added_at: new Date(),
        },
        updated_at: new Date(),
      },
      { new: true }
    );

    return sendSuccess(res, violation, "Remark added successfully");
  } catch (error) {
    logger.error("Add SLA remark failed:", error);
    return sendError(res, "Failed to add remark");
  }
};
exports.resolveSLAViolation = async (req, res) => {
  try {
    const { notes, added_by } = req.body;

    const violation = await SLAViolationModel.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        "notes.resolve": {
          notes,
          added_by,
          added_at: new Date(),
        },
        updated_at: new Date(),
      },
      { new: true }
    );

    return sendSuccess(res, violation, "SLA violation resolved successfully");
  } catch (error) {
    logger.error("Resolve SLA violation failed:", error);
    return sendError(res, "Failed to resolve SLA violation");
  }
};

exports.closeSLAViolation = async (req, res) => {
  try {
    const { notes, added_by } = req.body;

    const violation = await SLAViolationModel.findByIdAndUpdate(
      req.params.id,
      {
        status: "closed",
        "notes.closed": {
          notes,
          added_by,
          added_at: new Date(),
        },
        updated_at: new Date(),
      },
      { new: true }
    );

    return sendSuccess(res, violation, "SLA violation closed successfully");
  } catch (error) {
    logger.error("Close SLA violation failed:", error);
    return sendError(res, "Failed to close SLA violation");
  }
};
