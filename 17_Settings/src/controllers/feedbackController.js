const Interview = require("../models/Interview");

const generateFeedback = async (req, res) => {
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

    const score = interview.score || 0;
    let feedback = "";

    // Generate feedback based on score
    if (score >= 80) {
      feedback = "Excellent performance.";
    } else if (score >= 50) {
      feedback = "Good performance.";
    } else {
      feedback = "Needs improvement.";
    }

    // Save the feedback inside the Interview document
    interview.feedback = feedback;
    await interview.save();

    return res.status(200).json({
      message: "Feedback generated and saved successfully.",
      interviewId: interview._id,
      score,
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate feedback.",
      error: error.message,
    });
  }
};

const getFeedbackByInterviewId = async (req, res) => {
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
      message: "Feedback fetched successfully.",
      interviewId: interview._id,
      score: interview.score,
      feedback: interview.feedback,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch feedback.",
      error: error.message,
    });
  }
};

module.exports = {
  generateFeedback,
  getFeedbackByInterviewId,
};
