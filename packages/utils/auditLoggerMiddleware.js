const axios = require("axios");


const auditLogger = (actionName, actionModule) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
    //    if (!authHeader) return next();

       axios
        .post(
          `http://user-service:5001/api/action-audit-logs/create`,
          {
            actionName,
            actionModule,
          },
          {
            headers: { Authorization: authHeader },
            // timeout: 500, 
          }
        )
        .catch((err) => {
          console.error("Audit log failed:", err.message);
        });

      next();
    } catch (error) {
      console.error("Audit Logger Middleware Error:", error);
      next();
    }
  };
};

module.exports = auditLogger;
