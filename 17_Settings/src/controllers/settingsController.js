const Settings = require("../models/Settings");

const saveSettings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { theme, preferredLanguage, interviewDifficulty } = req.body;

    // Validate theme if provided
    if (theme && theme !== "light" && theme !== "dark") {
      return res.status(400).json({
        message: "theme must be either 'light' or 'dark'.",
      });
    }

    // Find and update or create (upsert) the settings document for this user
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      {
        theme: theme || "light",
        preferredLanguage: preferredLanguage || "English",
        interviewDifficulty: interviewDifficulty || "Medium",
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Settings saved successfully.",
      settings: {
        id: settings._id,
        userId: settings.userId,
        theme: settings.theme,
        preferredLanguage: settings.preferredLanguage,
        interviewDifficulty: settings.interviewDifficulty,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save settings.",
      error: error.message,
    });
  }
};

const getSettings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    let settings = await Settings.findOne({ userId: req.user._id });

    // If no settings document exists yet, initialize a default one
    if (!settings) {
      settings = await Settings.create({
        userId: req.user._id,
        theme: "light",
        preferredLanguage: "English",
        interviewDifficulty: "Medium",
      });
    }

    return res.status(200).json({
      message: "Settings fetched successfully.",
      settings: {
        id: settings._id,
        userId: settings.userId,
        theme: settings.theme,
        preferredLanguage: settings.preferredLanguage,
        interviewDifficulty: settings.interviewDifficulty,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch settings.",
      error: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { theme, preferredLanguage, interviewDifficulty } = req.body;

    // Validate theme if provided
    if (theme && theme !== "light" && theme !== "dark") {
      return res.status(400).json({
        message: "theme must be either 'light' or 'dark'.",
      });
    }

    const updateFields = {};
    if (theme) updateFields.theme = theme;
    if (preferredLanguage) updateFields.preferredLanguage = preferredLanguage;
    if (interviewDifficulty)
      updateFields.interviewDifficulty = interviewDifficulty;

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Settings updated successfully.",
      settings: {
        id: settings._id,
        userId: settings.userId,
        theme: settings.theme,
        preferredLanguage: settings.preferredLanguage,
        interviewDifficulty: settings.interviewDifficulty,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update settings.",
      error: error.message,
    });
  }
};

module.exports = {
  saveSettings,
  getSettings,
  updateSettings,
};
