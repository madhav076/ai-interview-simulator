const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadResume, getResume, analyzeResume } = require("../controllers/resumeController");
const authMiddleware = require("../middleware/authMiddleware");
const { isSupportedResumeMimeType } = require("../services/resumeTextService");

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configure file filter (allow PDF and DOCX resumes)
const fileFilter = (req, file, cb) => {
  if (isSupportedResumeMimeType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Route to upload a resume (Requires Authentication)
router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadResume
);

// Route to get the user's latest uploaded resume (Requires Authentication)
router.get("/", authMiddleware, getResume);

// Route to analyze an uploaded resume with AI (Requires Authentication)
router.post("/:id/analyze", authMiddleware, analyzeResume);

module.exports = router;
