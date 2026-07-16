const express = require("express");
const {
  evaluateInterview,
  getEvaluationByInterviewId,
} = require("../controllers/evaluationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to evaluate interview answers (Requires Authentication)
router.post("/evaluate", authMiddleware, evaluateInterview);

// Route to get evaluation result for a specific interview (Requires Authentication)
router.get("/:interviewId", authMiddleware, getEvaluationByInterviewId);

module.exports = router;
