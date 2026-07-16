const assert = require("assert");

// 1. Mock Interview Model
const interviewDbStore = [
  {
    _id: "interview_123",
    userId: "user_789",
    jobRole: "Node.js Architect",
    difficulty: "Hard",
    numberOfQuestions: 3,
    questions: [],
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
const aiRoutes = require("../src/routes/aiRoutes");
const {
  generateQuestions,
  getQuestionsByInterviewId,
} = require("../src/controllers/aiController");

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
  console.log("--- Starting AI Question Generation Step 2 Unit Tests ---");

  // TEST 1: Controller - Generate success & save to Interview
  {
    const req = {
      user: { _id: "user_789" },
      body: {
        interviewId: "interview_123",
      },
    };
    const res = mockResponse();
    await generateQuestions(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.message,
      "Questions generated and saved successfully."
    );
    assert.strictEqual(res.body.interviewId, "interview_123");
    assert.strictEqual(res.body.questions.length, 3);
    assert.strictEqual(
      interviewDbStore[0].questions.length,
      3
    ); // verified saved to DB
    console.log(
      "✓ TEST 1: Controller - Generate success & save to Interview passed"
    );
  }

  // TEST 2: Controller - Generate with missing interviewId
  {
    const req = {
      user: { _id: "user_789" },
      body: {
        interviewId: "",
      },
    };
    const res = mockResponse();
    await generateQuestions(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, "interviewId is required.");
    console.log("✓ TEST 2: Controller - Generate with missing interviewId passed");
  }

  // TEST 3: Controller - Generate with non-existent interview
  {
    const req = {
      user: { _id: "user_789" },
      body: {
        interviewId: "non_existent_id",
      },
    };
    const res = mockResponse();
    await generateQuestions(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log("✓ TEST 3: Controller - Generate with non-existent interview passed");
  }

  // TEST 4: Controller - Fetch questions (Success)
  {
    const req = {
      user: { _id: "user_789" },
      params: {
        interviewId: "interview_123",
      },
    };
    const res = mockResponse();
    await getQuestionsByInterviewId(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Questions fetched successfully.");
    assert.strictEqual(res.body.interviewId, "interview_123");
    assert.strictEqual(res.body.questions.length, 3);
    console.log("✓ TEST 4: Controller - Fetch questions (Success) passed");
  }

  // TEST 5: Controller - Fetch questions (Not Found / Unauthorized)
  {
    const req = {
      user: { _id: "unauthorized_user" },
      params: {
        interviewId: "interview_123",
      },
    };
    const res = mockResponse();
    await getQuestionsByInterviewId(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log(
      "✓ TEST 5: Controller - Fetch questions (Not Found/Unauthorized) passed"
    );
  }

  // TEST 6: Route - Verification
  {
    const generateRoute = aiRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/generate"
    );
    assert.ok(generateRoute);
    const getQuestionsRoute = aiRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/questions/:interviewId"
    );
    assert.ok(getQuestionsRoute);
    console.log("✓ TEST 6: Route - Verification passed");
  }

  console.log(
    "\n--- All AI Question Generation Step 2 tests passed successfully! ---"
  );
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
