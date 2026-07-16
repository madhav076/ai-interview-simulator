const Notification = require("../models/Notification");

const createNotification = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "title and message are required.",
      });
    }

    // Save the notification linked to the logged-in user
    const notification = await Notification.create({
      userId: req.user._id,
      title,
      message,
    });

    return res.status(201).json({
      message: "Notification created successfully.",
      notification: {
        id: notification._id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create notification.",
      error: error.message,
    });
  }
};

const getUserNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    // Retrieve all notifications of the logged-in user, sorted by newest first
    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Notifications fetched successfully.",
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Notification ID is required.",
      });
    }

    // Find the notification and make sure it belongs to the logged-in user
    const notification = await Notification.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    // Mark the selected notification as read
    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read successfully.",
      notificationId: id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to mark notification as read.",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
};
