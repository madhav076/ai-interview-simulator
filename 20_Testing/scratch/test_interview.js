const assert = require("assert");

// 1. Mock Interview Model
const interviewDbStore = [];
const mockInterview = {
  create: async (data) => {
    const lastInterview = interviewDbStore[interviewDbStore.length - 1];
    const baseTime = lastInterview ? lastInterview.createdAt.getTime() : Date.now();
    const newInterview = {
      _id: "mock_interview_id_" + Math.random().toString(36).substr(2, 9),
      score: 0,
      questions: [],
      ...data,
      createdAt: new Date(baseTime + 1000), // Ensure later creations are strictly later
    };
    interviewDbStore.push(newInterview);
    return newInterview;
  },
  find: (query) => {
    const userInterviews = interviewDbStore.filter(
      (i) => i.userId === query.userId
    );
    const queryObj = {
      sort: (sortObj) => {
        const sorted = [...userInterviews].sort(
          (a, b) => b.createdAt - a.createdAt
        );
        return {
          then: (resolve) => resolve(sorted),
        };
      },
      then: (resolve) => {
        resolve(userInterviews);
      },
    };
    return queryObj;
  },
  findOne: (query) => {
    const interview = interviewDbStore.find(
      (i) => i._id === query._id && i.userId === query.userId
    );
    return {
      then: (resolve) => resolve(interview || null),
    };
  },
  findOneAndDelete: (query) => {
    const idx = interviewDbStore.findIndex(
      (i) => i._id === query._id && i.userId === query.userId
    );
    let deleted = null;
    if (idx !== -1) {
      deleted = interviewDbStore.splice(idx, 1)[0];
    }
    return {
      then: (resolve) => resolve(deleted),
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
const interviewRoutes = require("../src/routes/interviewRoutes");
const {
  createInterview,
  getInterviews,
  getInterviewById,
  deleteInterview,
} = require("../src/controllers/interviewController");

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
  console.log("--- Starting Interview Generation Step 2 Unit Tests ---");

  let createdId1;
  let createdId2;

  // TEST 1: Create interviews
  {
    const req1 = {
      user: { _id: "user_456" },
      body: {
        jobRole: "Node.js Developer",
        difficulty: "Medium",
        numberOfQuestions: 5,
      },
    };
    const res1 = mockResponse();
    await createInterview(req1, res1);
    assert.strictEqual(res1.statusCode, 201);
    createdId1 = res1.body.interview.id;

    const req2 = {
      user: { _id: "user_456" },
      body: {
        jobRole: "Frontend Developer",
        difficulty: "Easy",
        numberOfQuestions: 3,
      },
    };
    const res2 = mockResponse();
    await createInterview(req2, res2);
    assert.strictEqual(res2.statusCode, 201);
    createdId2 = res2.body.interview.id;

    console.log("✓ TEST 1: Created two test interviews");
  }

  // TEST 2: Get all interviews of logged-in user
  {
    const req = { user: { _id: "user_456" } };
    const res = mockResponse();
    await getInterviews(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.interviews.length, 2);
    assert.strictEqual(res.body.interviews[0].jobRole, "Frontend Developer"); // sorted by createdAt descending
    console.log("✓ TEST 2: Fetch all user interviews passed");
  }

  // TEST 3: Get single interview by ID (Success)
  {
    const req = { user: { _id: "user_456" }, params: { id: createdId1 } };
    const res = mockResponse();
    await getInterviewById(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.interview.jobRole, "Node.js Developer");
    console.log("✓ TEST 3: Fetch single interview by ID (Success) passed");
  }

  // TEST 4: Get single interview by ID (Not Found / Unauthorized)
  {
    const req = {
      user: { _id: "unauthorized_user" },
      params: { id: createdId1 },
    };
    const res = mockResponse();
    await getInterviewById(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log(
      "✓ TEST 4: Fetch single interview by ID (Not Found/Unauthorized) passed"
    );
  }

  // TEST 5: Delete interview (Success)
  {
    const req = { user: { _id: "user_456" }, params: { id: createdId1 } };
    const res = mockResponse();
    await deleteInterview(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Interview deleted successfully.");

    // Verify it was deleted
    const checkReq = { user: { _id: "user_456" } };
    const checkRes = mockResponse();
    await getInterviews(checkReq, checkRes);
    assert.strictEqual(checkRes.body.interviews.length, 1);
    assert.strictEqual(checkRes.body.interviews[0]._id, createdId2);
    console.log("✓ TEST 5: Delete interview (Success) passed");
  }

  // TEST 6: Delete interview (Not Found / Unauthorized)
  {
    const req = {
      user: { _id: "unauthorized_user" },
      params: { id: createdId2 },
    };
    const res = mockResponse();
    await deleteInterview(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(
      res.body.message,
      "Interview not found or unauthorized to delete."
    );
    console.log(
      "✓ TEST 6: Delete interview (Not Found/Unauthorized) passed"
    );
  }

  console.log(
    "\n--- All Interview Generation Step 2 tests passed successfully! ---"
  );
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
