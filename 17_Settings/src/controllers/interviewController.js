const Interview = require("../models/Interview");

const createInterview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { jobRole, difficulty, numberOfQuestions } = req.body;

    // Validate inputs
    if (!jobRole || !difficulty || numberOfQuestions === undefined || numberOfQuestions === null || numberOfQuestions === "") {
      return res.status(400).json({
        message: "jobRole, difficulty, and numberOfQuestions are required.",
      });
    }

    const allowedDifficulties = ["Easy", "Medium", "Hard"];
    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        message: "Difficulty must be one of: Easy, Medium, Hard.",
      });
    }

    const questionsCount = parseInt(numberOfQuestions, 10);
    if (isNaN(questionsCount) || questionsCount <= 0) {
      return res.status(400).json({
        message: "numberOfQuestions must be a valid positive number.",
      });
    }

    const title = `${jobRole} Interview (${difficulty})`;

    // Create interview record in MongoDB
    const interview = await Interview.create({
      userId: req.user._id,
      title,
      jobRole,
      difficulty,
      numberOfQuestions: questionsCount,
      questions: [], // No AI questions generated yet
    });

    return res.status(201).json({
      message: "Interview created successfully.",
      interview: {
        id: interview._id,
        userId: interview.userId,
        title: interview.title,
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        numberOfQuestions: interview.numberOfQuestions,
        questions: interview.questions,
        score: interview.score,
        createdAt: interview.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create interview.",
      error: error.message,
    });
  }
};

const getInterviews = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    // Retrieve all interviews of the logged-in user, sorted by creation date
    const interviews = await Interview.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Interviews fetched successfully.",
      interviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch interviews.",
      error: error.message,
    });
  }
};

const getInterviewById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { id } = req.params;

    // Retrieve a single interview, ensuring it belongs to the logged-in user
    const interview = await Interview.findOne({ _id: id, userId: req.user._id });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found.",
      });
    }

    return res.status(200).json({
      message: "Interview fetched successfully.",
      interview,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch interview.",
      error: error.message,
    });
  }
};

const deleteInterview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { id } = req.params;

    // Delete the interview, ensuring it belongs to the logged-in user
    const interview = await Interview.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found or unauthorized to delete.",
      });
    }

    return res.status(200).json({
      message: "Interview deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete interview.",
      error: error.message,
    });
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  deleteInterview,
};
