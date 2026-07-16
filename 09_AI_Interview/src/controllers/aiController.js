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

    // Generate sample questions (hardcoded for now)
    const sampleQuestions = [];
    for (let i = 1; i <= numberOfQuestions; i++) {
      sampleQuestions.push({
        id: i,
        text: `Sample question ${i} for a ${difficulty}-level ${jobRole} interview.`,
        type: i % 2 === 0 ? "technical" : "behavioral",
      });
    }

    // Save the generated questions inside the Interview document
    interview.questions = sampleQuestions;
    await interview.save();

    return res.status(200).json({
      message: "Questions generated and saved successfully.",
      interviewId: interview._id,
      jobRole,
      difficulty,
      numberOfQuestions,
      questions: sampleQuestions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate questions.",
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
