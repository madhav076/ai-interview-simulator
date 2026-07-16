const express = require("express");
const {
  generateFeedback,
  getFeedbackByInterviewId,
} = require("../controllers/feedbackController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to generate simpler feedback based on score (Requires Authentication)
router.post("/generate", authMiddleware, generateFeedback);

// Route to get saved feedback for a specific interview (Requires Authentication)
router.get("/:interviewId", authMiddleware, getFeedbackByInterviewId);

module.exports = router;
