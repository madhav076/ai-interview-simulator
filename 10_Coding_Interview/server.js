require("dotenv").config({ quiet: true });

const express = require("express");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const resumeRoutes = require("./src/routes/resumeRoutes");
const interviewRoutes = require("./src/routes/interviewRoutes");
const voiceRoutes = require("./src/routes/voiceRoutes");
const codingRoutes = require("./src/routes/codingRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/voice", voiceRoutes);
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
