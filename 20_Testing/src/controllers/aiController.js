const { generateInterviewQuestions } = require("../services/aiService");
const Interview = require("../models/Interview");

const generateQuestions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        message: "interviewId is required.",
      });
    }

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

    const { jobRole, difficulty, numberOfQuestions } = interview;

    // Call the separate AI Service to generate questions from Gemini
    const questions = await generateInterviewQuestions(
      jobRole,
      difficulty,
      numberOfQuestions
    );

    // Save the generated questions inside the Interview document
    interview.questions = questions;
    await interview.save();

    return res.status(200).json({
      message: "Questions generated and saved successfully.",
      interviewId: interview._id,
      jobRole,
      difficulty,
      numberOfQuestions,
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: error.message,
    });
  }
};

const getQuestionsByInterviewId = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { interviewId } = req.params;

    if (!interviewId) {
      return res.status(400).json({
        message: "interviewId is required.",
      });
    }

    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found.",
      });
    }

    return res.status(200).json({
      message: "Questions fetched successfully.",
      interviewId: interview._id,
      questions: interview.questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch questions.",
      error: error.message,
    });
  }
};

module.exports = {
  generateQuestions,
  getQuestionsByInterviewId,
};
