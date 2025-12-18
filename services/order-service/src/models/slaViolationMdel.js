
const mongoose = require("mongoose");

const SLAViolationModelSchema = new mongoose.Schema({
  dealer_id: {
    type: String,
    required: true,
    index: true,
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    index: true,
  },
  sku: { type: String, required: true },
  violation_minutes: { type: Number, required: true },
  status: {
     type: String,
     enum: ["pending", "resolved","remarked","closed"],
     default: "pending",
      required: true 
    },

  notes: { 
    resolve:{
        notes: String,
        added_by: String,
        added_at: {
            type: Date,
            default: Date.now,
        },
    },
    remark:{
        notes: String,
        added_by: String,
        added_at: {
            type: Date,
            default: Date.now,
        },
    },
    closed:{
        notes: String,
        added_by: String,
        added_at: {
            type: Date,
            default: Date.now,
        },
    }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.models.SLAViolationModel || mongoose.model("SLAViolationModel", SLAViolationModelSchema);
