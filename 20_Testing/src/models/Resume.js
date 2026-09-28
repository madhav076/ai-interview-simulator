const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  analysisTargetRole: {
    type: String,
    default: "",
  },
  analyzedAt: {
    type: Date,
    default: null,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", resumeSchema);
