require("dotenv").config({ quiet: true });

const createApp = require("./server.app");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const resumeRoutes = require("./src/routes/resumeRoutes");
const interviewRoutes = require("./src/routes/interviewRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const answerRoutes = require("./src/routes/answerRoutes");
const evaluationRoutes = require("./src/routes/evaluationRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const codingRoutes = require("./src/routes/codingRoutes");

const app = createApp();
const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/answer", answerRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/coding", codingRoutes);

const startServer = async () => {
  try {
    // Connect to MongoDB before the server begins accepting requests.
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      `Server did not start because the database connection failed: ${error.message}`,
    );
    process.exit(1);
  }
};

startServer();
