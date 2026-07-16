const assert = require("assert");

const now = new Date();
const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);

const interviewsList = [
  { score: 80, createdAt: now },
  { score: 60, createdAt: now },
  { score: 95, createdAt: lastMonthDate },
];

const codingList = [
  { score: 70, createdAt: now },
  { score: 100, createdAt: lastMonthDate },
];

// Mock Interview Model
const mockInterview = {
  countDocuments: async (query) => {
    if (query.userId !== "user_analytics_123") return 0;
    if (query.createdAt && query.createdAt.$gte) {
      return interviewsList.filter((i) => i.createdAt >= query.createdAt.$gte)
        .length;
    }
    return interviewsList.length;
  },
  find: (query) => {
    let list = interviewsList;
    if (query.createdAt && query.createdAt.$gte) {
      list = interviewsList.filter((i) => i.createdAt >= query.createdAt.$gte);
    }
    return {
      select: () => ({
        then: (resolve) => resolve(list),
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
    if (query.userId !== "user_analytics_123") return 0;
    if (query.createdAt && query.createdAt.$gte) {
      return codingList.filter((c) => c.createdAt >= query.createdAt.$gte)
        .length;
    }
    return codingList.length;
  },
  find: (query) => {
    let list = codingList;
    if (query.createdAt && query.createdAt.$gte) {
      list = codingList.filter((c) => c.createdAt >= query.createdAt.$gte);
    }
    return {
      select: () => ({
        then: (resolve) => resolve(list),
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
    return query.userId === "user_analytics_123" ? 1 : 0;
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
const analyticsRoutes = require("../src/routes/analyticsRoutes");
const { getAnalyticsData } = require("../src/controllers/analyticsController");

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
  console.log("--- Starting Analytics Step 2 Unit Tests ---");

  // TEST 1: Controller - Fetch Analytics Success (Overall and Monthly Metrics)
  {
    const req = {
      user: { _id: "user_analytics_123" },
    };
    const res = mockResponse();
    await getAnalyticsData(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Analytics fetched successfully.");

    // Overall metrics verification
    assert.strictEqual(res.body.analytics.totalInterviews, 3);
    assert.strictEqual(res.body.analytics.totalCodingInterviews, 2);
    assert.strictEqual(res.body.analytics.totalResumes, 1);
    // Average score should be: (80 + 60 + 95 + 70 + 100) / 5 = 405 / 5 = 81
    assert.strictEqual(res.body.analytics.averageInterviewScore, 81);
    // Highest score should be: 100
    assert.strictEqual(res.body.analytics.highestInterviewScore, 100);

    // Monthly metrics verification
    // Interviews completed this month: standard (80, 60) -> 2
    assert.strictEqual(res.body.analytics.interviewsCompletedThisMonth, 2);
    // Coding interviews completed this month: coding (70) -> 1
    assert.strictEqual(res.body.analytics.codingInterviewsCompletedThisMonth, 1);
    // Average score this month: (80 + 60 + 70) / 3 = 210 / 3 = 70
    assert.strictEqual(res.body.analytics.averageScoreThisMonth, 70);

    console.log("✓ TEST 1: Controller - Fetch Analytics Success passed");
  }

  // TEST 2: Route - Verification
  {
    const analyticsRoute = analyticsRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/"
    );
    assert.ok(analyticsRoute);
    const handlers = analyticsRoute.route.stack;
    assert.ok(handlers.length >= 2); // authMiddleware, getAnalyticsData controller
    console.log("✓ TEST 2: Route - Verification passed");
  }

  console.log("\n--- All Analytics Step 2 tests passed successfully! ---");
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
