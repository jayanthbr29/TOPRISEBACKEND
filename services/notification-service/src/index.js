const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const logger = require("/packages/utils/logger");
 
 
const dotenvFlow = require("dotenv-flow");
 
dotenvFlow.config({
    path: path.resolve(__dirname, "../../../../"),
    node_env: "development",
});
 
const ENV = "development";
console.log(`✅ ENVIRONMENT: ${ENV}`);
console.log(`✅ Loaded from: .env.${ENV}`);
console.log(`✅ MONGO_URI: ${process.env.MONGO_URI}`);
 
 
// MongoDB Connection
mongoose
    .connect(
        "mongodb+srv://techdev:R9EjIKZ2m8q3q2xY@cluster0.feoabf8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => logger.info("Connected to MongoDB"))
    .catch((err) => {
        logger.error("MongoDB connection error:", err.message);
        process.exit(1);
    });
 
 
// Express App Setup
const app = express();
const PORT = process.env.PORT || 5001;
const WHITELIST = [
    "http://localhost:3000", // React / Next dev server
    "http://193.203.161.146:3000", // your prod IP (if you serve UI there)
];
app.use(
    cors({
        origin: (origin, cb) => {
            // allow REST tools like Postman (no origin) and any whitelisted origin
            if (!origin || WHITELIST.includes(origin)) return cb(null, true);
            cb(new Error("Not allowed by CORS"));
        },
        credentials: true, // ← crucial!
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
        ],
    })
);
 
app.use(express.json());
app.use(morgan("dev"));
require('./schedulers/cleanupNotifications');
 
const actionRoutes = require("./routes/action");
const notification_templateRoutes = require("./routes/notification_template");
const notificationSettingRoutes = require("./routes/notificationSetting");
const notificationRoutes = require("./routes/notification");
 
 
 
 
 
 
app.use("/api/action", actionRoutes);
app.use("/api/notification_template", notification_templateRoutes);
app.use("/api/notificationSetting", notificationSettingRoutes);
app.use("/api/notification", notificationRoutes);
 
 
 
 
app.get("/health", (req, res) => {
    res.status(200).json({ status: "Notification service is very healthy" });
});
 
 
// Global Error Handler
app.use((err, req, res, next) => {
    logger.error("Unhandled error:", err.message);
    res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
});
 
// Start Server
app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Notification Service is running on port ${PORT}`);
});
 