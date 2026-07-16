const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadAudio,
  transcribeVoiceAnswer,
} = require("../controllers/voiceController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Configure storage for audio files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/audio/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// Configure file filter (only allow WAV and MP3)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAudioExt = ext === ".wav" || ext === ".mp3";
  const isAudioMime =
    file.mimetype === "audio/wav" ||
    file.mimetype === "audio/mpeg" ||
    file.mimetype === "audio/mp3" ||
    file.mimetype === "audio/x-wav";

  if (isAudioExt || isAudioMime) {
    cb(null, true);
  } else {
    cb(new Error("Only WAV and MP3 audio files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for audio files
  },
});

// Route to upload voice answer (Requires Authentication)
router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    upload.single("voice")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadAudio
);

// Route to upload and transcribe voice answer (Requires Authentication)
router.post(
  "/transcribe",
  authMiddleware,
  (req, res, next) => {
    upload.single("voice")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  transcribeVoiceAnswer
);

module.exports = router;
