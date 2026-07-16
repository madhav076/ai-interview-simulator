const Interview = require("../models/Interview");

const submitAnswer = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { interviewId, questionId, answer } = req.body;

    if (
      !interviewId ||
      questionId === undefined ||
      questionId === null ||
      !answer
    ) {
      return res.status(400).json({
        message: "interviewId, questionId, and answer are required.",
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

    // Parse questionId to match the number type stored
    const targetQuestionId = parseInt(questionId, 10);

    // Find the question in the interview's questions array
    const questionIndex = interview.questions.findIndex(
      (q) => q.id === targetQuestionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({
        message: "Question not found in this interview.",
      });
    }

    // Save the answer inside the Interview document
    interview.questions[questionIndex].userAnswer = answer;

    // Notify Mongoose of the nested array modification
    interview.markModified("questions");
    await interview.save();

    return res.status(200).json({
      message: "Answer submitted successfully.",
      interviewId: interview._id,
      questionId: targetQuestionId,
      questions: interview.questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit answer.",
      error: error.message,
    });
  }
};

const getAnswersByInterviewId = async (req, res) => {
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

    // Map questions to return the question text and any submitted answers
    const answers = interview.questions.map((q) => ({
      questionId: q.id,
      questionText: q.text,
      userAnswer: q.userAnswer || null,
    }));

    return res.status(200).json({
      message: "Answers fetched successfully.",
      interviewId: interview._id,
      answers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch answers.",
      error: error.message,
    });
  }
};

module.exports = {
  submitAnswer,
  getAnswersByInterviewId,
};
