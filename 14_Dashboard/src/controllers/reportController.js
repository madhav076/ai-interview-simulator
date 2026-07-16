const Interview = require("../models/Interview");
const PDFDocument = require("pdfkit");

const getInterviewReport = async (req, res) => {
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

    // Find the interview and populate the user details (to fetch user name)
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
    }).populate("userId", "name email");

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found.",
      });
    }

    // Map questions to clearly expose questions and user answers
    const questionsAndAnswers = (interview.questions || []).map((q) => ({
      questionId: q.id,
      questionText: q.text,
      type: q.type,
      userAnswer: q.userAnswer || null,
    }));

    return res.status(200).json({
      message: "Report generated successfully.",
      report: {
        interviewId: interview._id,
        userName: interview.userId ? interview.userId.name : "Unknown",
        email: interview.userId ? interview.userId.email : "Unknown",
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        score: interview.score,
        feedback: interview.feedback || "No feedback generated yet.",
        questions: questionsAndAnswers,
        createdAt: interview.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate report.",
      error: error.message,
    });
  }
};

const generateInterviewReportPDF = async (req, res) => {
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

    // Find the interview and populate user credentials
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user._id,
    }).populate("userId", "name email");

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found.",
      });
    }

    const userName = interview.userId ? interview.userId.name : "Unknown";
    const jobRole = interview.jobRole;
    const difficulty = interview.difficulty;
    const score = interview.score || 0;
    const feedback = interview.feedback || "No feedback generated yet.";
    const questions = interview.questions || [];

    // Initialize PDF document
    const doc = new PDFDocument();

    // Set download headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Interview_Report_${interviewId}.pdf`
    );

    // Stream directly to Express response
    doc.pipe(res);

    // Build PDF document layout
    doc
      .fontSize(22)
      .text("AI Interview Simulator - Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`User Name: ${userName}`);
    doc.text(`Job Role: ${jobRole}`);
    doc.text(`Difficulty: ${difficulty}`);
    doc.text(`Final Score: ${score} marks`);
    doc.text(`Feedback: ${feedback}`);
    doc.moveDown(2);

    doc.fontSize(16).text("Questions & Answers", { underline: true });
    doc.moveDown();

    questions.forEach((q, idx) => {
      doc.fontSize(12).text(`Question ${idx + 1}: ${q.text}`);
      doc.text(`User Answer: ${q.userAnswer || "Not answered."}`);
      doc.moveDown();
    });

    // Stream completion
    doc.end();
  } catch (error) {
    // Check if headers were already sent to prevent app crash
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to generate PDF report.",
        error: error.message,
      });
    }
  }
};

module.exports = {
  getInterviewReport,
  generateInterviewReportPDF,
};
