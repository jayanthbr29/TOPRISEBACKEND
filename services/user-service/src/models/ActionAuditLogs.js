const mongoose = require("mongoose");

const actionAuditLogsSchema = new mongoose.Schema(
  {
    actionName: {
      type: String,
      required: true,
      trim: true,
    },

    actionModule: {
      type: String,
      required: true,
      trim: true,
    },

    actionTime: {
      type: Date,
      default: Date.now, 
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    role: {
      type: String,
      required: false,
    //   enum: ["admin", "user", "editor", "moderator"], 
    },

    ipAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);
actionAuditLogsSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 } // 30 days
);

module.exports = mongoose.model("ActionAuditLogs", actionAuditLogsSchema);
