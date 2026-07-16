const fs = require("fs");
const { transcribeAudio } = require("../services/aiService");
const Interview = require("../models/Interview");

const uploadAudio = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message:
          "No audio file uploaded or invalid file type. Please upload a WAV or MP3 audio file.",
      });
    }

    return res.status(200).json({
      message: "Audio file uploaded successfully.",
      fileName: req.file.filename,
      filePath: req.file.path,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred during voice upload.",
      error: error.message,
    });
  }
};

const transcribeVoiceAnswer = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { interviewId, questionId } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        message: "interviewId is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message:
          "No audio file uploaded or invalid file type. Please upload a WAV or MP3 audio file.",
      });
    }

    // Read audio file buffer from disk
    const fileBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype;

    // Call separate Gemini service to transcribe speech to text
    const transcript = await transcribeAudio(fileBuffer, mimeType);

    // Find the interview and ensure it belongs to the logged-in user
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found.",
      });
    }

    // Save the converted text inside the Interview document as the user's answer
    if (interview.questions && interview.questions.length > 0) {
      const targetQuestionId =
        questionId !== undefined && questionId !== null
          ? parseInt(questionId, 10)
          : null;

      let questionIndex = -1;
      if (targetQuestionId !== null) {
        questionIndex = interview.questions.findIndex(
          (q) => q.id === targetQuestionId
        );
      } else {
        // Fallback to first unanswered question, or first question
        questionIndex = interview.questions.findIndex((q) => !q.userAnswer);
        if (questionIndex === -1) {
          questionIndex = 0;
        }
      }

      if (questionIndex !== -1) {
        interview.questions[questionIndex].userAnswer = transcript;
        interview.markModified("questions");
        await interview.save();
      }
    } else {
      // Defensive fallback if interview.questions is empty
      interview.questions = [
        {
          id: 1,
          text: "Voice Question",
          type: "technical",
          userAnswer: transcript,
        },
      ];
      interview.markModified("questions");
      await interview.save();
    }

    return res.status(200).json({
      message: "Audio transcribed and answer saved successfully.",
      transcript,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred during audio transcription.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadAudio,
  transcribeVoiceAnswer,
};
