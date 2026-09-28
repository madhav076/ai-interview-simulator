require("dotenv").config();
const http = require("http");
const createApp = require("../server.app");
const authRoutes = require("../src/routes/authRoutes");
const codingRoutes = require("../src/routes/codingRoutes");
const User = require("../src/models/User");
const CodingInterview = require("../src/models/CodingInterview");
const jwt = require("jsonwebtoken");

async function testCompleteFlow() {
  console.log("=== Testing Complete Coding Interview Flow over HTTP ===");
  
  const app = createApp();
  app.use("/api/auth", authRoutes);
  app.use("/api/coding", codingRoutes);

  // 1. Create a mock authenticated user and JWT
  const testUserId = "64b1f456789abcdef1234567";
  const token = jwt.sign({ id: testUserId }, process.env.JWT_SECRET || "my_super_secret_jwt_key_123!", {
    expiresIn: "1h",
  });

  // Mock User.findById
  User.findById = (id) => ({
    select: () => Promise.resolve({ _id: id, email: "coder@example.com", name: "Coder" }),
  });

  // Mock CodingInterview.create
  CodingInterview.create = (doc) => Promise.resolve({
    _id: "interview_" + Date.now(),
    id: "interview_" + Date.now(),
    createdAt: new Date(),
    score: 0,
    ...doc,
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  console.log(`Server listening on port ${port}`);

  const languages = ["Python", "JavaScript", "TypeScript", "Java"];
  const difficulties = ["Easy", "Medium", "Hard"];
  
  for (const lang of languages) {
    const diff = difficulties[Math.floor(Math.random() * difficulties.length)];
    const numQ = 1;
    console.log(`\nFlow: Select ${lang} -> ${diff} -> ${numQ} challenges -> Start Coding Assessment`);

    const response = await fetch(`http://127.0.0.1:${port}/api/coding/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        programmingLanguage: lang,
        difficulty: diff,
        numberOfQuestions: numQ,
      }),
    });

    const status = response.status;
    const data = await response.json();
    console.log(`HTTP Status: ${status}`);

    if (status === 201) {
      const interview = data.codingInterview;
      console.log(`✓ Coding Interview Created: ID=${interview.id || interview._id}, Title="${interview.title}"`);
      console.log(`  Questions count: ${interview.questions?.length}`);
      console.log(`  Challenge 1: "${interview.questions[0]?.title}" (${interview.questions[0]?.difficulty})`);
      console.log(`  Template sample:\n  ${interview.questions[0]?.codeTemplate?.split('\n').slice(0, 2).join('\n  ')}`);
      console.log(`  Test cases: ${JSON.stringify(interview.questions[0]?.testCases)}`);
    } else {
      console.error(`✗ Request failed with status ${status}:`, data);
    }
  }

  server.close();
  console.log("\n=== Complete Coding Interview Flow Test Passed Successfully ===");
}

testCompleteFlow().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
