const express = require("express");
const {
  submitAnswer,
  getAnswersByInterviewId,
} = require("../controllers/answerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to submit user's answer (Requires Authentication)
router.post("/submit", authMiddleware, submitAnswer);

// Route to get all submitted answers for a specific interview (Requires Authentication)
router.get("/:interviewId", authMiddleware, getAnswersByInterviewId);

module.exports = router;
