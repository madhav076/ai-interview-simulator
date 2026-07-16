const express = require("express");
const {
  saveSettings,
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Route to fetch saved user settings (Requires Authentication)
router.get("/", authMiddleware, getSettings);

// Route to save user settings (Requires Authentication)
router.post("/", authMiddleware, saveSettings);

// Route to update user settings (Requires Authentication)
router.put("/", authMiddleware, updateSettings);

module.exports = router;
