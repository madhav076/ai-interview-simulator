const Interview = require("../models/Interview");
const CodingInterview = require("../models/CodingInterview");
const Resume = require("../models/Resume");

const getAnalyticsData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const userId = req.user._id;

    // Count records for user
    const totalInterviews = await Interview.countDocuments({ userId });
    const totalCodingInterviews = await CodingInterview.countDocuments({
      userId,
    });
    const totalResumes = await Resume.countDocuments({ userId });

    // Fetch scores from all interviews to compute metrics
    const interviews = await Interview.find({ userId }).select("score");
    const codingInterviews = await CodingInterview.find({ userId }).select(
      "score"
    );

    let totalScore = 0;
    let highestScore = 0;
    let gradedCount = 0;

    interviews.forEach((i) => {
      const s = i.score || 0;
      totalScore += s;
      gradedCount++;
      if (s > highestScore) highestScore = s;
    });

    codingInterviews.forEach((c) => {
      const s = c.score || 0;
      totalScore += s;
      gradedCount++;
      if (s > highestScore) highestScore = s;
    });

    const averageInterviewScore =
      gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;

    // Compute monthly start timestamp
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch monthly counts
    const interviewsCompletedThisMonth = await Interview.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth },
    });
    const codingInterviewsCompletedThisMonth =
      await CodingInterview.countDocuments({
        userId,
        createdAt: { $gte: startOfMonth },
      });

    // Fetch monthly details for average calculations
    const interviewsThisMonth = await Interview.find({
      userId,
      createdAt: { $gte: startOfMonth },
    }).select("score");
    const codingInterviewsThisMonth = await CodingInterview.find({
      userId,
      createdAt: { $gte: startOfMonth },
    }).select("score");

    let monthlyTotalScore = 0;
    let monthlyGradedCount = 0;

    interviewsThisMonth.forEach((i) => {
      monthlyTotalScore += i.score || 0;
      monthlyGradedCount++;
    });

    codingInterviewsThisMonth.forEach((c) => {
      monthlyTotalScore += c.score || 0;
      monthlyGradedCount++;
    });

    const averageScoreThisMonth =
      monthlyGradedCount > 0
        ? Math.round(monthlyTotalScore / monthlyGradedCount)
        : 0;

    return res.status(200).json({
      message: "Analytics fetched successfully.",
      analytics: {
        totalInterviews,
        totalCodingInterviews,
        totalResumes,
        averageInterviewScore,
        highestInterviewScore: highestScore,
        interviewsCompletedThisMonth,
        codingInterviewsCompletedThisMonth,
        averageScoreThisMonth,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch analytics.",
      error: error.message,
    });
  }
};

module.exports = {
  getAnalyticsData,
};
