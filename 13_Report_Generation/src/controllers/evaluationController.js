const Interview = require("../models/Interview");

const evaluateInterview = async (req, res) => {
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

    const questions = interview.questions || [];
    const totalQuestionsCount = questions.length;
    let answeredQuestionsCount = 0;
    let totalScore = 0;

    // Calculate score: 10 marks per answered question, 0 otherwise
    questions.forEach((q) => {
      if (q.userAnswer && q.userAnswer.trim() !== "") {
        answeredQuestionsCount++;
        totalScore += 10;
      }
    });

    // Save the evaluated score and metadata inside the Interview document
    interview.score = totalScore;
    interview.totalQuestions = totalQuestionsCount;
    interview.answeredQuestions = answeredQuestionsCount;
    await interview.save();

    return res.status(200).json({
      message: "Interview evaluated successfully.",
      interviewId: interview._id,
      score: interview.score,
      totalQuestions: interview.totalQuestions,
      answeredQuestions: interview.answeredQuestions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to evaluate interview.",
      error: error.message,
    });
  }
};

const getEvaluationByInterviewId = async (req, res) => {
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
      message: "Evaluation fetched successfully.",
      interviewId: interview._id,
      score: interview.score,
      totalQuestions: interview.totalQuestions,
      answeredQuestions: interview.answeredQuestions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch evaluation.",
      error: error.message,
    });
  }
};

module.exports = {
  evaluateInterview,
  getEvaluationByInterviewId,
};
