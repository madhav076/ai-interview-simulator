const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to get user dashboard summary (Requires Authentication)
router.get("/", authMiddleware, getDashboardSummary);

module.exports = router;
