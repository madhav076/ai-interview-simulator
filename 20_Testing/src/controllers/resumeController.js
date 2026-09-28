const Resume = require("../models/Resume");
const { createResumeAnalysis } = require("../services/resumeAnalysisService");
const { extractResumeText, getMimeTypeFromFileName } = require("../services/resumeTextService");

const toResumeResponse = (resume) => ({
  id: resume._id,
  userId: resume.userId,
  fileName: resume.fileName,
  filePath: resume.filePath,
  uploadedAt: resume.uploadedAt,
  analysis: resume.analysis,
  analysisTargetRole: resume.analysisTargetRole,
  analyzedAt: resume.analyzedAt,
});

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
      resume: toResumeResponse(resume),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "An error occurred during file upload.",
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
      resume: toResumeResponse(resume),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "An error occurred while fetching the resume.",
    });
  }
};

const analyzeResume = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    const targetJobRole = String(req.body?.targetJobRole || "").trim().slice(0, 120);
    const resumeText = await extractResumeText({
      filePath: resume.filePath,
      fileName: resume.fileName,
      mimeType: getMimeTypeFromFileName(resume.fileName),
    });

    const analysis = await createResumeAnalysis({ resumeText, targetJobRole });

    resume.analysis = analysis;
    resume.analysisTargetRole = targetJobRole;
    resume.analyzedAt = new Date();
    await resume.save();

    return res.status(200).json({
      message: "Resume analyzed successfully.",
      resume: toResumeResponse(resume),
      analysis,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const isRetryable = statusCode === 503 || statusCode === 429 || statusCode === 502;
    return res.status(statusCode).json({
      message: error.message || "An error occurred while analyzing the resume.",
      retryable: isRetryable,
    });
  }
};

module.exports = {
  uploadResume,
  getResume,
  analyzeResume,
};
