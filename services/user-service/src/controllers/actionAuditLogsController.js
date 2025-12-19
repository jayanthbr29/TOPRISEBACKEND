const ActionAuditLogs = require("../models/ActionAuditLogs");
const jwt = require('jsonwebtoken');
const mapRole = (jwtRole) => {

    return jwtRole;
};
exports.createActionAuditLog = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const { actionName, actionModule } = req.body;
        if (actionName == "Login_Successfull_admin" || actionName == "Login_SucceessFull_user" || actionName == "Password_Changed") {
            const log = await ActionAuditLogs.create({
                actionName,
                actionModule,
                userId: null,
                role: null,
                ipAddress: req.ip || req.headers["x-forwarded-for"],
            });

            return res.status(201).json({
                success: true,
                message: "Audit log created successfully",
                data: log,
            });
        } else {


            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const token = authHeader.substring(7);
            const decoded = jwt.decode(token);
            console.log("decoded", decoded);

            if (!decoded) {
                logger.warn('Invalid JWT token: could not decode');
                req.user = null;
                return next();
            }
            const mappedRole = mapRole(decoded.role);
            if (!actionName || !actionModule) {
                return res.status(400).json({
                    success: false,
                    message: "actionName and actionModule are required",
                });
            }
            console.log("sampleData",{
                actionName,
                actionModule,
                userId: decoded.id,
                role: decoded.role,
                ipAddress: req.ip || req.headers["x-forwarded-for"],
            })

            const log = await ActionAuditLogs.create({
                actionName,
                actionModule,
                userId: decoded.id,
                role: decoded.role,
                ipAddress: req.ip || req.headers["x-forwarded-for"],
            });

            return res.status(201).json({
                success: true,
                message: "Audit log created successfully",
                data: log,
            });
        }
    } catch (error) {
        console.error("Create Audit Log Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create audit log",
        });
    }
};


exports.getActionAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            module,
            role,
            userId,
            startDate,
            endDate,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const query = {};


        if (search) {
            query.$or = [
                { actionName: { $regex: search, $options: "i" } },
                { actionModule: { $regex: search, $options: "i" } },
                { role: { $regex: search, $options: "i" } },
                { ipAddress: { $regex: search, $options: "i" } },
            ];
        }


        if (module) query.actionModule = module;
        if (role) query.role = role;
        if (userId) query.userId = userId;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate).setHours(0, 0, 0, 0);
            if (endDate) query.createdAt.$lte = new Date(endDate).setHours(23, 59, 59, 999);
        }

        const sort = {
            [sortBy]: sortOrder === "asc" ? 1 : -1,
        };

        const skip = (Number(page) - 1) * Number(limit);

        const [logs, total] = await Promise.all([
            ActionAuditLogs.find(query)
                .populate("userId")
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean(),

            ActionAuditLogs.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get Audit Logs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch audit logs",
        });
    }
};

