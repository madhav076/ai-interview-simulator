const express = require("express");
const {
  createCodingInterview,
  getCodingInterviewById,
  submitCodingAnswer,
} = require("../controllers/codingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to create a new coding interview (Requires Authentication)
router.post("/create", authMiddleware, createCodingInterview);

// Route to get a specific coding interview details (Requires Authentication)
router.get("/:id", authMiddleware, getCodingInterviewById);

// Route to submit coding solution (Requires Authentication)
router.post("/submit", authMiddleware, submitCodingAnswer);

module.exports = router;
