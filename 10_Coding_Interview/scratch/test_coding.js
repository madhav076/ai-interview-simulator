const assert = require("assert");

// 1. Mock CodingInterview Model
const dbStore = [
  {
    _id: "coding_interview_777",
    userId: "user_123",
    programmingLanguage: "Go",
    difficulty: "Hard",
    numberOfQuestions: 1,
    questions: [
      {
        id: 1,
        title: "Two Sum",
        description: "Find two numbers that add up to target.",
        difficulty: "Easy",
        codeTemplate: "func twoSum(nums []int, target int) []int {}",
        testCases: [],
      },
    ],
    score: 0,
    save: async function () {
      return this;
    },
    markModified: function (field) {},
  },
];

const mockCodingInterview = {
  create: async function (data) {
    const record = {
      _id: "coding_interview_999",
      createdAt: new Date(),
      score: 0,
      ...data,
    };
    dbStore.push(record);
    return record;
  },
  findOne: (query) => {
    const record = dbStore.find(
      (r) => r._id === query._id && r.userId === query.userId
    );
    return {
      then: (resolve) => resolve(record || null),
    };
  },
};

require.cache[require.resolve("../src/models/CodingInterview")] = {
  exports: mockCodingInterview,
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
process.env.GEMINI_API_KEY = ""; // dummy triggers mock coding questions fallback

// 2. Import controller and routes
const codingRoutes = require("../src/routes/codingRoutes");
const {
  createCodingInterview,
  getCodingInterviewById,
  submitCodingAnswer,
} = require("../src/controllers/codingController");

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
  console.log("--- Starting Coding Interview Step 2 Unit Tests ---");

  // TEST 1: Controller - Create Success
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        programmingLanguage: "Python",
        difficulty: "Medium",
        numberOfQuestions: 2,
      },
    };
    const res = mockResponse();
    await createCodingInterview(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(
      res.body.message,
      "Coding interview created and saved successfully."
    );
    assert.strictEqual(res.body.codingInterview.programmingLanguage, "Python");
    assert.strictEqual(res.body.codingInterview.questions.length, 2);
    console.log("✓ TEST 1: Controller - Create Success passed");
  }

  // TEST 2: Controller - Get by ID (Success)
  {
    const req = {
      user: { _id: "user_123" },
      params: {
        id: "coding_interview_777",
      },
    };
    const res = mockResponse();
    await getCodingInterviewById(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.message,
      "Coding interview fetched successfully."
    );
    assert.strictEqual(res.body.codingInterview.programmingLanguage, "Go");
    assert.strictEqual(res.body.codingInterview.questions.length, 1);
    console.log("✓ TEST 2: Controller - Get by ID (Success) passed");
  }

  // TEST 3: Controller - Get by ID (Not Found / Unauthorized)
  {
    const req = {
      user: { _id: "unauthorized_user" },
      params: {
        id: "coding_interview_777",
      },
    };
    const res = mockResponse();
    await getCodingInterviewById(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Coding interview not found.");
    console.log(
      "✓ TEST 3: Controller - Get by ID (Not Found/Unauthorized) passed"
    );
  }

  // TEST 4: Controller - Submit code (Success)
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        codingInterviewId: "coding_interview_777",
        questionId: 1,
        sourceCode: "func twoSum(nums []int, target int) []int { return nil }",
      },
    };
    const res = mockResponse();
    await submitCodingAnswer(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.message,
      "Coding solution submitted successfully."
    );
    assert.strictEqual(res.body.codingInterviewId, "coding_interview_777");
    assert.strictEqual(res.body.questionId, 1);

    // Verify it saved userCode in the mock DB
    assert.strictEqual(
      dbStore[0].questions[0].userCode,
      "func twoSum(nums []int, target int) []int { return nil }"
    );
    console.log("✓ TEST 4: Controller - Submit code (Success) passed");
  }

  // TEST 5: Controller - Submit code (Missing fields)
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        codingInterviewId: "coding_interview_777",
        questionId: 1,
        sourceCode: "",
      },
    };
    const res = mockResponse();
    await submitCodingAnswer(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
      res.body.message,
      "codingInterviewId, questionId, and sourceCode are required."
    );
    console.log("✓ TEST 5: Controller - Submit code (Missing fields) passed");
  }

  // TEST 6: Controller - Submit code (Non-existent questionId)
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        codingInterviewId: "coding_interview_777",
        questionId: 99,
        sourceCode: "some code",
      },
    };
    const res = mockResponse();
    await submitCodingAnswer(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(
      res.body.message,
      "Question not found in this coding interview."
    );
    console.log("✓ TEST 6: Controller - Submit code (Non-existent questionId) passed");
  }

  // TEST 7: Route - Verification
  {
    const createRoute = codingRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/create"
    );
    assert.ok(createRoute);
    const getRoute = codingRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/:id"
    );
    assert.ok(getRoute);
    const submitRoute = codingRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/submit"
    );
    assert.ok(submitRoute);
    console.log("✓ TEST 7: Route - Verification passed");
  }

  console.log(
    "\n--- All Coding Interview Step 2 tests passed successfully! ---"
  );
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
