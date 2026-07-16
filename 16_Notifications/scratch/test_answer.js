const assert = require("assert");

// 1. Mock Interview Model
const interviewDbStore = [
  {
    _id: "interview_789",
    userId: "user_111",
    jobRole: "Backend Developer",
    difficulty: "Medium",
    numberOfQuestions: 2,
    questions: [
      { id: 1, text: "What is Node.js?", type: "technical" },
      { id: 2, text: "Explain middleware.", type: "technical" },
    ],
    save: async function () {
      return this;
    },
    markModified: function (field) {},
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
const answerRoutes = require("../src/routes/answerRoutes");
const {
  submitAnswer,
  getAnswersByInterviewId,
} = require("../src/controllers/answerController");

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
  console.log("--- Starting AI Answer Submission Step 2 Unit Tests ---");

  // TEST 1: Controller - Submit Success
  {
    const req = {
      user: { _id: "user_111" },
      body: {
        interviewId: "interview_789",
        questionId: 1,
        answer: "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
      },
    };
    const res = mockResponse();
    await submitAnswer(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Answer submitted successfully.");
    assert.strictEqual(res.body.interviewId, "interview_789");
    assert.strictEqual(res.body.questionId, 1);

    // Verify stored userAnswer in the mock database
    assert.strictEqual(
      interviewDbStore[0].questions[0].userAnswer,
      "Node.js is a JavaScript runtime built on Chrome's V8 engine."
    );
    console.log("✓ TEST 1: Controller - Submit Success passed");
  }

  // TEST 2: Controller - Missing fields
  {
    const req = {
      user: { _id: "user_111" },
      body: {
        interviewId: "interview_789",
        questionId: 1,
        answer: "",
      },
    };
    const res = mockResponse();
    await submitAnswer(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
      res.body.message,
      "interviewId, questionId, and answer are required."
    );
    console.log("✓ TEST 2: Controller - Missing fields passed");
  }

  // TEST 3: Controller - Non-existent interview (submit)
  {
    const req = {
      user: { _id: "user_111" },
      body: {
        interviewId: "non_existent_id",
        questionId: 1,
        answer: "Some answer.",
      },
    };
    const res = mockResponse();
    await submitAnswer(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log("✓ TEST 3: Controller - Non-existent interview (submit) passed");
  }

  // TEST 4: Controller - Non-existent question ID in interview
  {
    const req = {
      user: { _id: "user_111" },
      body: {
        interviewId: "interview_789",
        questionId: 99,
        answer: "Some answer.",
      },
    };
    const res = mockResponse();
    await submitAnswer(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(
      res.body.message,
      "Question not found in this interview."
    );
    console.log("✓ TEST 4: Controller - Non-existent question ID passed");
  }

  // TEST 5: Controller - Fetch submitted answers (Success)
  {
    const req = {
      user: { _id: "user_111" },
      params: {
        interviewId: "interview_789",
      },
    };
    const res = mockResponse();
    await getAnswersByInterviewId(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Answers fetched successfully.");
    assert.strictEqual(res.body.interviewId, "interview_789");
    assert.strictEqual(res.body.answers.length, 2);
    assert.strictEqual(res.body.answers[0].questionId, 1);
    assert.strictEqual(
      res.body.answers[0].userAnswer,
      "Node.js is a JavaScript runtime built on Chrome's V8 engine."
    );
    assert.strictEqual(res.body.answers[1].userAnswer, null);
    console.log("✓ TEST 5: Controller - Fetch submitted answers (Success) passed");
  }

  // TEST 6: Controller - Fetch answers (Not Found / Unauthorized)
  {
    const req = {
      user: { _id: "unauthorized_user" },
      params: {
        interviewId: "interview_789",
      },
    };
    const res = mockResponse();
    await getAnswersByInterviewId(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log(
      "✓ TEST 6: Controller - Fetch answers (Not Found/Unauthorized) passed"
    );
  }

  // TEST 7: Route - Verification
  {
    const submitRoute = answerRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/submit"
    );
    assert.ok(submitRoute);
    const getAnswersRoute = answerRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/:interviewId"
    );
    assert.ok(getAnswersRoute);
    console.log("✓ TEST 7: Route - Verification passed");
  }

  console.log(
    "\n--- All AI Answer Submission Step 2 tests passed successfully! ---"
  );
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
