const express = require("express");
const { getAnalyticsData } = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to fetch user analytics (Requires Authentication)
router.get("/", authMiddleware, getAnalyticsData);

module.exports = router;
