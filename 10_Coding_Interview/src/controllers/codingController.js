const CodingInterview = require("../models/CodingInterview");
const { generateCodingQuestions } = require("../services/aiService");

const createCodingInterview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { programmingLanguage, difficulty, numberOfQuestions } = req.body;

    if (!programmingLanguage || !difficulty || !numberOfQuestions) {
      return res.status(400).json({
        message:
          "programmingLanguage, difficulty, and numberOfQuestions are required.",
      });
    }

    const count = parseInt(numberOfQuestions, 10);
    if (isNaN(count) || count <= 0) {
      return res.status(400).json({
        message: "numberOfQuestions must be a positive integer.",
      });
    }

    // Call Gemini AI service to generate coding challenges
    const questions = await generateCodingQuestions(
      programmingLanguage,
      difficulty,
      count
    );

    // Save the generated coding interview in MongoDB
    const title = `${programmingLanguage} (${difficulty}) Coding Interview`;
    const codingInterview = await CodingInterview.create({
      userId: req.user._id,
      title,
      programmingLanguage,
      difficulty,
      numberOfQuestions: count,
      questions,
    });

    return res.status(201).json({
      message: "Coding interview created and saved successfully.",
      codingInterview: {
        id: codingInterview._id,
        userId: codingInterview.userId,
        title: codingInterview.title,
        programmingLanguage: codingInterview.programmingLanguage,
        difficulty: codingInterview.difficulty,
        numberOfQuestions: codingInterview.numberOfQuestions,
        questions: codingInterview.questions,
        score: codingInterview.score,
        createdAt: codingInterview.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create coding interview.",
      error: error.message,
    });
  }
};

const getCodingInterviewById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Coding interview ID is required.",
      });
    }

    // Find the coding interview and ensure it belongs to the logged-in user
    const codingInterview = await CodingInterview.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!codingInterview) {
      return res.status(404).json({
        message: "Coding interview not found.",
      });
    }

    return res.status(200).json({
      message: "Coding interview fetched successfully.",
      codingInterview,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch coding interview.",
      error: error.message,
    });
  }
};

const submitCodingAnswer = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const { codingInterviewId, questionId, sourceCode } = req.body;

    if (!codingInterviewId || questionId === undefined || questionId === null || !sourceCode) {
      return res.status(400).json({
        message: "codingInterviewId, questionId, and sourceCode are required.",
      });
    }

    // Find the coding interview and ensure it belongs to the logged-in user
    const codingInterview = await CodingInterview.findOne({
      _id: codingInterviewId,
      userId: req.user._id,
    });

    if (!codingInterview) {
      return res.status(404).json({
        message: "Coding interview not found.",
      });
    }

    // Match the questionId within the interview document's questions array
    const targetQuestionId = parseInt(questionId, 10);
    const questionIndex = codingInterview.questions.findIndex(
      (q) => q.id === targetQuestionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({
        message: "Question not found in this coding interview.",
      });
    }

    // Save the submitted source code in MongoDB
    codingInterview.questions[questionIndex].userCode = sourceCode;

    // Tell Mongoose of nested array updates
    codingInterview.markModified("questions");
    await codingInterview.save();

    return res.status(200).json({
      message: "Coding solution submitted successfully.",
      codingInterviewId: codingInterview._id,
      questionId: targetQuestionId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit coding solution.",
      error: error.message,
    });
  }
};

module.exports = {
  createCodingInterview,
  getCodingInterviewById,
  submitCodingAnswer,
};
