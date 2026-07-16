const express = require("express");
const {
  getInterviewReport,
  generateInterviewReportPDF,
} = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to get generated report for a specific interview (Requires Authentication)
router.get("/:interviewId", authMiddleware, getInterviewReport);

// Route to download PDF report for a specific interview (Requires Authentication)
router.get("/:interviewId/pdf", authMiddleware, generateInterviewReportPDF);

module.exports = router;
