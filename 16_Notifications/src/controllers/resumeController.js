const Resume = require("../models/Resume");

const uploadResume = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded or invalid file type. Please upload a PDF resume.",
      });
    }

    // Save uploaded resume details in MongoDB
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.filename,
      filePath: req.file.path,
    });

    return res.status(201).json({
      message: "Resume uploaded successfully.",
      resume: {
        id: resume._id,
        userId: resume.userId,
        fileName: resume.fileName,
        filePath: resume.filePath,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred during file upload.",
      error: error.message,
    });
  }
};

const getResume = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    // Find the latest uploaded resume for this user
    const resume = await Resume.findOne({ userId: req.user._id }).sort({
      uploadedAt: -1,
    });

    if (!resume) {
      return res.status(404).json({
        message: "No resume found for this user.",
      });
    }

    return res.status(200).json({
      message: "Resume fetched successfully.",
      resume: {
        id: resume._id,
        userId: resume.userId,
        fileName: resume.fileName,
        filePath: resume.filePath,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while fetching the resume.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadResume,
  getResume,
};
