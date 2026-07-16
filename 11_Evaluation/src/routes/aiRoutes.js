const express = require("express");
const {
  generateQuestions,
  getQuestionsByInterviewId,
} = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to generate sample interview questions and save to Interview document (Requires Authentication)
router.post("/generate", authMiddleware, generateQuestions);

// Route to get all questions for a specific interview (Requires Authentication)
router.get("/questions/:interviewId", authMiddleware, getQuestionsByInterviewId);

module.exports = router;
