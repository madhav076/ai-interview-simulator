const assert = require("assert");

// 1. Mock Interview Model
const mockInterview = {
  countDocuments: async (query) => {
    return query.userId === "user_dash_123" ? 3 : 0;
  },
  find: (query) => {
    const list = [
      { score: 80, title: "Standard 1", createdAt: new Date() },
      { score: 60, title: "Standard 2", createdAt: new Date() },
      { score: 100, title: "Standard 3", createdAt: new Date() },
    ];
    return {
      select: () => ({
        then: (resolve) => resolve(list),
      }),
      sort: () => ({
        limit: () => ({
          then: (resolve) => resolve(list),
        }),
      }),
    };
  },
};
require.cache[require.resolve("../src/models/Interview")] = {
  exports: mockInterview,
};

// Mock CodingInterview Model
const mockCodingInterview = {
  countDocuments: async (query) => {
    return query.userId === "user_dash_123" ? 2 : 0;
  },
  find: (query) => {
    const list = [
      { score: 70, title: "Coding 1", createdAt: new Date() },
      { score: 90, title: "Coding 2", createdAt: new Date() },
    ];
    return {
      select: () => ({
        then: (resolve) => resolve(list),
      }),
      sort: () => ({
        limit: () => ({
          then: (resolve) => resolve(list),
        }),
      }),
    };
  },
};
require.cache[require.resolve("../src/models/CodingInterview")] = {
  exports: mockCodingInterview,
};

// Mock Resume Model
const mockResume = {
  countDocuments: async (query) => {
    return query.userId === "user_dash_123" ? 1 : 0;
  },
};
require.cache[require.resolve("../src/models/Resume")] = {
  exports: mockResume,
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
const dashboardRoutes = require("../src/routes/dashboardRoutes");
const {
  getDashboardSummary,
} = require("../src/controllers/dashboardController");

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
  console.log("--- Starting Dashboard Step 2 Unit Tests ---");

  // TEST 1: Controller - Fetch Success (Aggregations, Average Score, and Recents)
  {
    const req = {
      user: { _id: "user_dash_123" },
    };
    const res = mockResponse();
    await getDashboardSummary(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.message,
      "Dashboard summary fetched successfully."
    );
    assert.strictEqual(res.body.summary.totalInterviews, 3);
    assert.strictEqual(res.body.summary.totalCodingInterviews, 2);
    assert.strictEqual(res.body.summary.totalResumes, 1);

    // Average score should be: (80 + 60 + 100 + 70 + 90) / 5 = 400 / 5 = 80
    assert.strictEqual(res.body.summary.averageScore, 80);

    // Recents verification
    assert.strictEqual(res.body.recentInterviews.length, 3);
    assert.strictEqual(res.body.recentInterviews[0].title, "Standard 1");
    assert.strictEqual(res.body.recentCodingInterviews.length, 2);
    assert.strictEqual(res.body.recentCodingInterviews[0].title, "Coding 1");
    console.log("✓ TEST 1: Controller - Fetch Success passed");
  }

  // TEST 2: Route - Verification
  {
    const dashboardRoute = dashboardRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/"
    );
    assert.ok(dashboardRoute);
    const handlers = dashboardRoute.route.stack;
    assert.ok(handlers.length >= 2); // authMiddleware, getDashboardSummary controller
    console.log("✓ TEST 2: Route - Verification passed");
  }

  console.log("\n--- All Dashboard Step 2 tests passed successfully! ---");
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
