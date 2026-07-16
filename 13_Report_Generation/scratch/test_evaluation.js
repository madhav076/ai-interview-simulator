const assert = require("assert");

// 1. Mock Interview Model
const interviewDbStore = [
  {
    _id: "interview_abc",
    userId: "user_222",
    jobRole: "Product Manager",
    difficulty: "Easy",
    numberOfQuestions: 3,
    questions: [
      {
        id: 1,
        text: "Explain your background.",
        type: "behavioral",
        userAnswer: "I have 5 years of experience.",
      },
      {
        id: 2,
        text: "How do you prioritize?",
        type: "behavioral",
        userAnswer: "",
      },
      {
        id: 3,
        text: "What is A/B testing?",
        type: "technical",
        userAnswer: "It's comparing two versions of a webpage.",
      },
    ],
    score: 0,
    totalQuestions: 0,
    answeredQuestions: 0,
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
const evaluationRoutes = require("../src/routes/evaluationRoutes");
const {
  evaluateInterview,
  getEvaluationByInterviewId,
} = require("../src/controllers/evaluationController");

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
  console.log("--- Starting AI Evaluation Step 2 Unit Tests ---");

  // TEST 1: Controller - Success (2 answered, 1 empty -> score should be 20)
  {
    const req = {
      user: { _id: "user_222" },
      body: {
        interviewId: "interview_abc",
      },
    };
    const res = mockResponse();
    await evaluateInterview(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Interview evaluated successfully.");
    assert.strictEqual(res.body.interviewId, "interview_abc");
    assert.strictEqual(res.body.score, 20);
    assert.strictEqual(res.body.totalQuestions, 3);
    assert.strictEqual(res.body.answeredQuestions, 2);

    // Verify it was updated in the DB
    assert.strictEqual(interviewDbStore[0].score, 20);
    assert.strictEqual(interviewDbStore[0].totalQuestions, 3);
    assert.strictEqual(interviewDbStore[0].answeredQuestions, 2);
    console.log("✓ TEST 1: Controller - Success passed");
  }

  // TEST 2: Controller - Missing interviewId (evaluate)
  {
    const req = {
      user: { _id: "user_222" },
      body: {
        interviewId: "",
      },
    };
    const res = mockResponse();
    await evaluateInterview(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, "interviewId is required.");
    console.log("✓ TEST 2: Controller - Missing interviewId passed");
  }

  // TEST 3: Controller - Non-existent interview (evaluate)
  {
    const req = {
      user: { _id: "user_222" },
      body: {
        interviewId: "non_existent_id",
      },
    };
    const res = mockResponse();
    await evaluateInterview(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log("✓ TEST 3: Controller - Non-existent interview (evaluate) passed");
  }

  // TEST 4: Controller - Fetch evaluation results (Success)
  {
    const req = {
      user: { _id: "user_222" },
      params: {
        interviewId: "interview_abc",
      },
    };
    const res = mockResponse();
    await getEvaluationByInterviewId(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Evaluation fetched successfully.");
    assert.strictEqual(res.body.interviewId, "interview_abc");
    assert.strictEqual(res.body.score, 20);
    assert.strictEqual(res.body.totalQuestions, 3);
    assert.strictEqual(res.body.answeredQuestions, 2);
    console.log("✓ TEST 4: Controller - Fetch evaluation results (Success) passed");
  }

  // TEST 5: Controller - Fetch evaluation (Not Found / Unauthorized)
  {
    const req = {
      user: { _id: "unauthorized_user" },
      params: {
        interviewId: "interview_abc",
      },
    };
    const res = mockResponse();
    await getEvaluationByInterviewId(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log(
      "✓ TEST 5: Controller - Fetch evaluation (Not Found/Unauthorized) passed"
    );
  }

  // TEST 6: Route - Verification
  {
    const evaluateRoute = evaluationRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/evaluate"
    );
    assert.ok(evaluateRoute);
    const getEvaluationRoute = evaluationRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/:interviewId"
    );
    assert.ok(getEvaluationRoute);
    console.log("✓ TEST 6: Route - Verification passed");
  }

  console.log(
    "\n--- All AI Evaluation Step 2 tests passed successfully! ---"
  );
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
