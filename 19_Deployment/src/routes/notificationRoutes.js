const express = require("express");
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to fetch all notifications for the logged-in user (Requires Authentication)
router.get("/", authMiddleware, getUserNotifications);

// Route to create a new notification (Requires Authentication)
router.post("/create", authMiddleware, createNotification);

// Route to mark a notification as read (Requires Authentication)
router.put("/:id/read", authMiddleware, markNotificationAsRead);

module.exports = router;
