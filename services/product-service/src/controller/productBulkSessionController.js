const ProductBulkSession = require("../models/productBulkSessionModel");


exports.getProductBulkSession = async (req, res) => {
    try {
        const productBulkSession = await ProductBulkSession
        .find()
        .sort({ created_at: -1 });
        res.status(200).json(productBulkSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getProductBulkSessionById = async (req, res) => {
    try {
        const productBulkSession = await ProductBulkSession.findById(req.params.id);
        if (!productBulkSession) {
            return res.status(404).json({ message: "Product bulk session not found" });
        }
        res.status(200).json(productBulkSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteProductBulkSessionLogById= async (req, res) => {
    try {
        const productBulkSession = await ProductBulkSession.findByIdAndDelete(req.params.id);
        if (!productBulkSession) {
            return res.status(404).json({ message: "Product bulk session not found" });
        }
        res.status(200).json({ message: "Product bulk session deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.bulkDeleteProductBulkSessionLogsByIds = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "IDs array is required" });
        }
        await ProductBulkSession.deleteMany({ _id: { $in: ids } }); 
        res.status(200).json({ message: "Product bulk session logs deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};