const Interview = require("../models/Interview");
const CodingInterview = require("../models/CodingInterview");
const Resume = require("../models/Resume");

const getDashboardSummary = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
      });
    }

    const userId = req.user._id;

    // Count documents for the logged-in user
    const totalInterviews = await Interview.countDocuments({ userId });
    const totalCodingInterviews = await CodingInterview.countDocuments({
      userId,
    });
    const totalResumes = await Resume.countDocuments({ userId });

    // Fetch scores to compute the average
    const interviews = await Interview.find({ userId }).select("score");
    const codingInterviews = await CodingInterview.find({ userId }).select(
      "score"
    );

    let totalScore = 0;
    interviews.forEach((i) => (totalScore += i.score || 0));
    codingInterviews.forEach((c) => (totalScore += c.score || 0));

    const totalGradedCount = interviews.length + codingInterviews.length;
    const averageScore =
      totalGradedCount > 0 ? Math.round(totalScore / totalGradedCount) : 0;

    // Fetch recent 5 standard interviews sorted by latest created date
    const recentInterviews = await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch recent 5 coding interviews sorted by latest created date
    const recentCodingInterviews = await CodingInterview.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      message: "Dashboard summary fetched successfully.",
      summary: {
        totalInterviews,
        totalCodingInterviews,
        totalResumes,
        averageScore,
      },
      recentInterviews,
      recentCodingInterviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch dashboard summary.",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
};
