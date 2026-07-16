const express = require("express");
const {
  createInterview,
  getInterviews,
  getInterviewById,
  deleteInterview,
} = require("../controllers/interviewController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to create a new interview (Requires Authentication)
router.post("/create", authMiddleware, createInterview);

// Route to get all interviews of the logged-in user (Requires Authentication)
router.get("/", authMiddleware, getInterviews);

// Route to get a single interview by ID (Requires Authentication)
router.get("/:id", authMiddleware, getInterviewById);

// Route to delete a single interview by ID (Requires Authentication)
router.delete("/:id", authMiddleware, deleteInterview);

module.exports = router;
