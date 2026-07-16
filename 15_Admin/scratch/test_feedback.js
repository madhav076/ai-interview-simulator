const assert = require("assert");

// 1. Mock Interview Model
const interviewDbStore = [
  {
    _id: "interview_excellent",
    userId: "user_333",
    score: 85,
    feedback: "",
    save: async function () {
      return this;
    },
  },
  {
    _id: "interview_good",
    userId: "user_333",
    score: 65,
    feedback: "",
    save: async function () {
      return this;
    },
  },
  {
    _id: "interview_poor",
    userId: "user_333",
    score: 35,
    feedback: "",
    save: async function () {
      return this;
    },
  },
];

const mockInterview = {
  findOne: (query) => {
    const interview = interviewDbStore.find(
      (i) => i._id === query._id && i.userId === query.userId
    );
    return {
      then: (resolve) => resolve(interview || null),
    };
  },
};

require.cache[require.resolve("../src/models/Interview")] = {
  exports: mockInterview,
};

// Mock User Model
const mockUser = {
  findById: (id) => ({
    select: () => ({
      then: (resolve) => resolve({ _id: id, email: "test@example.com" }),
    }),
  }),
};
require.cache[require.resolve("../src/models/User")] = {
  exports: mockUser,
};

// Set env
process.env.JWT_SECRET = "test_jwt_secret_key";

// 2. Import controller and routes
const feedbackRoutes = require("../src/routes/feedbackRoutes");
const {
  generateFeedback,
  getFeedbackByInterviewId,
} = require("../src/controllers/feedbackController");

// Helper to create mock response
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

// Run tests
const runTests = async () => {
  console.log("--- Starting AI Feedback Step 2 Unit Tests ---");

  // TEST 1: Excellent performance (Score >= 80) & DB Save
  {
    const req = {
      user: { _id: "user_333" },
      body: { interviewId: "interview_excellent" },
    };
    const res = mockResponse();
    await generateFeedback(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.message,
      "Feedback generated and saved successfully."
    );
    assert.strictEqual(res.body.score, 85);
    assert.strictEqual(res.body.feedback, "Excellent performance.");

    // Verify it was saved in the mock DB
    assert.strictEqual(
      interviewDbStore[0].feedback,
      "Excellent performance."
    );
    console.log("✓ TEST 1: Excellent performance (Score >= 80) & DB Save passed");
  }

  // TEST 2: Good performance (Score >= 50) & DB Save
  {
    const req = {
      user: { _id: "user_333" },
      body: { interviewId: "interview_good" },
    };
    const res = mockResponse();
    await generateFeedback(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.score, 65);
    assert.strictEqual(res.body.feedback, "Good performance.");
    assert.strictEqual(interviewDbStore[1].feedback, "Good performance.");
    console.log("✓ TEST 2: Good performance (Score >= 50) & DB Save passed");
  }

  // TEST 3: Needs improvement (Score < 50) & DB Save
  {
    const req = {
      user: { _id: "user_333" },
      body: { interviewId: "interview_poor" },
    };
    const res = mockResponse();
    await generateFeedback(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.score, 35);
    assert.strictEqual(res.body.feedback, "Needs improvement.");
    assert.strictEqual(interviewDbStore[2].feedback, "Needs improvement.");
    console.log("✓ TEST 3: Needs improvement (Score < 50) & DB Save passed");
  }

  // TEST 4: Fetch feedback (Success)
  {
    const req = {
      user: { _id: "user_333" },
      params: { interviewId: "interview_excellent" },
    };
    const res = mockResponse();
    await getFeedbackByInterviewId(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Feedback fetched successfully.");
    assert.strictEqual(res.body.interviewId, "interview_excellent");
    assert.strictEqual(res.body.score, 85);
    assert.strictEqual(res.body.feedback, "Excellent performance.");
    console.log("✓ TEST 4: Fetch feedback (Success) passed");
  }

  // TEST 5: Fetch feedback (Not Found / Unauthorized)
  {
    const req = {
      user: { _id: "unauthorized_user" },
      params: { interviewId: "interview_excellent" },
    };
    const res = mockResponse();
    await getFeedbackByInterviewId(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log(
      "✓ TEST 5: Fetch feedback (Not Found/Unauthorized) passed"
    );
  }

  // TEST 6: Route verification
  {
    const generateRoute = feedbackRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/generate"
    );
    assert.ok(generateRoute);
    const getFeedbackRoute = feedbackRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/:interviewId"
    );
    assert.ok(getFeedbackRoute);
    console.log("✓ TEST 6: Route verification passed");
  }

  console.log("\n--- All AI Feedback Step 2 tests passed successfully! ---");
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
