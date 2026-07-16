const express = require("express");
const {
  getAllUsers,
  getAllInterviews,
  deleteUser,
  deleteInterview,
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Route to fetch all users (Requires Admin authorization)
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

// Route to fetch all interviews (Requires Admin authorization)
router.get("/interviews", authMiddleware, adminMiddleware, getAllInterviews);

// Route to delete a selected user (Requires Admin authorization)
router.delete("/user/:id", authMiddleware, adminMiddleware, deleteUser);

// Route to delete a selected interview (Requires Admin authorization)
router.delete("/interview/:id", authMiddleware, adminMiddleware, deleteInterview);

module.exports = router;
