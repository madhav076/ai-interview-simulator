/**
 * Full API Integration Test
 *
 * Tests every backend API endpoint for:
 * - Proper HTTP status codes
 * - JSON responses
 * - Invalid input handling (400)
 * - JWT protection (401 without token)
 * - Admin protection (403 without admin role)
 * - Correct success responses
 *
 * Uses the real Express app with mocked Mongoose models so no database is needed.
 */

const assert = require("assert");
const http = require("http");

// ---------------------
// Test Infrastructure
// ---------------------

require("dotenv").config({ quiet: true });
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key";
process.env.GEMINI_API_KEY = "DUMMY_KEY";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ---- In-memory data stores ----
let users = [];
let interviews = [];
let notifications = [];
let settingsStore = [];
let resumes = [];
let codingInterviews = [];

// ---- Mock helpers ----
const toPlain = (obj) => JSON.parse(JSON.stringify(obj));

const createMockId = () =>
  Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");

// ---- Mock User Model ----
const mockUserModel = {
  findOne: async (query) => {
    const u = users.find((u) => {
      if (query.email) return u.email === query.email;
      return false;
    });
    if (!u) return null;
    return u;
  },
  findById: (id) => ({
    select: async () => {
      const u = users.find((u) => u._id === id);
      if (!u) return null;
      const { password, ...rest } = u;
      return rest;
    },
  }),
  find: () => ({
    select: async () => users.map(({ password, ...rest }) => rest),
  }),
  create: async (data) => {
    const user = {
      _id: createMockId(),
      ...data,
      role: data.role || "user",
      createdAt: new Date(),
    };
    users.push(user);
    return user;
  },
  findByIdAndDelete: async (id) => {
    const idx = users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    return users.splice(idx, 1)[0];
  },
};

// ---- Mock Interview Model ----
const createMockInterview = () => ({
  countDocuments: async (query) => {
    return interviews.filter((i) => {
      if (query.userId && String(i.userId) !== String(query.userId))
        return false;
      if (query.createdAt && query.createdAt.$gte) {
        return new Date(i.createdAt) >= new Date(query.createdAt.$gte);
      }
      return true;
    }).length;
  },
  find: (query) => {
    let results = [...interviews];
    if (query) {
      if (query.userId)
        results = results.filter(
          (i) => String(i.userId) === String(query.userId)
        );
      if (query.createdAt && query.createdAt.$gte) {
        results = results.filter(
          (i) => new Date(i.createdAt) >= new Date(query.createdAt.$gte)
        );
      }
    }
    return {
      sort: (s) => ({
        limit: (n) => Promise.resolve(results.slice(0, n)),
        then: (resolve) => resolve(results),
      }),
      select: (f) => ({
        then: (resolve) => resolve(results),
      }),
      populate: () => ({
        then: (resolve) => resolve(results),
      }),
      then: (resolve) => resolve(results),
    };
  },
  findOne: (query) => {
    let match = interviews.find((i) => {
      if (query._id && String(i._id) !== String(query._id)) return false;
      if (query.userId && String(i.userId) !== String(query.userId))
        return false;
      return true;
    });
    if (!match) {
      const emptyQuery = {
        populate: () => emptyQuery,
        then: (resolve) => resolve(null),
      };
      return emptyQuery;
    }
    // Return a saveable mock document
    const doc = {
      ...match,
      save: async () => {
        const idx = interviews.findIndex((i) => i._id === match._id);
        if (idx !== -1) interviews[idx] = { ...interviews[idx], ...doc };
        return doc;
      },
      markModified: () => {},
    };
    const queryObj = {
      populate: () => queryObj,
      then: (resolve) => resolve(doc),
    };
    return queryObj;
  },
  create: async (data) => {
    const interview = {
      _id: createMockId(),
      ...data,
      score: 0,
      totalQuestions: 0,
      answeredQuestions: 0,
      feedback: "",
      createdAt: new Date(),
    };
    interviews.push(interview);
    return interview;
  },
  findOneAndDelete: async (query) => {
    const idx = interviews.findIndex((i) => {
      if (query._id && String(i._id) !== String(query._id)) return false;
      if (query.userId && String(i.userId) !== String(query.userId))
        return false;
      return true;
    });
    if (idx === -1) return null;
    return interviews.splice(idx, 1)[0];
  },
  findByIdAndDelete: async (id) => {
    const idx = interviews.findIndex((i) => i._id === id);
    if (idx === -1) return null;
    return interviews.splice(idx, 1)[0];
  },
});

// ---- Mock CodingInterview Model ----
const mockCodingInterview = {
  countDocuments: async () => codingInterviews.length,
  find: () => ({
    select: () => ({
      then: (resolve) => resolve(codingInterviews),
    }),
    sort: () => ({
      limit: () => Promise.resolve(codingInterviews),
    }),
  }),
};

// ---- Mock Resume Model ----
const mockResumeModel = {
  countDocuments: async () => resumes.length,
  create: async (data) => {
    const resume = {
      _id: createMockId(),
      ...data,
      uploadedAt: new Date(),
    };
    resumes.push(resume);
    return resume;
  },
  findOne: (query) => ({
    sort: async () => resumes.find((r) => String(r.userId) === String(query.userId)) || null,
  }),
};

// ---- Mock Notification Model ----
const mockNotificationModel = {
  create: async (data) => {
    const notif = {
      _id: createMockId(),
      ...data,
      isRead: false,
      createdAt: new Date(),
    };
    notifications.push(notif);
    return notif;
  },
  find: (query) => ({
    sort: async () =>
      notifications.filter(
        (n) => String(n.userId) === String(query.userId)
      ),
  }),
  findOne: async (query) => {
    const notif = notifications.find((n) => {
      if (query._id && String(n._id) !== String(query._id)) return false;
      if (query.userId && String(n.userId) !== String(query.userId))
        return false;
      return true;
    });
    if (!notif) return null;
    return {
      ...notif,
      save: async () => {
        const idx = notifications.findIndex((n) => n._id === notif._id);
        if (idx !== -1) notifications[idx].isRead = true;
      },
    };
  },
};

// ---- Mock Settings Model ----
const mockSettingsModel = {
  findOne: async (query) => {
    return settingsStore.find(
      (s) => String(s.userId) === String(query.userId)
    ) || null;
  },
  create: async (data) => {
    const s = {
      _id: createMockId(),
      ...data,
      updatedAt: new Date(),
    };
    settingsStore.push(s);
    return s;
  },
  findOneAndUpdate: async (query, update, options) => {
    let existing = settingsStore.find(
      (s) => String(s.userId) === String(query.userId)
    );
    if (!existing && options && options.upsert) {
      const newSettings = {
        _id: createMockId(),
        userId: query.userId,
        theme: "light",
        preferredLanguage: "English",
        interviewDifficulty: "Medium",
        updatedAt: new Date(),
      };
      settingsStore.push(newSettings);
      existing = newSettings;
    }
    if (existing) {
      const updates = update.$set || update;
      Object.assign(existing, updates, { updatedAt: new Date() });
    }
    return existing;
  },
};

// ---- Register mocks in require cache ----
require.cache[require.resolve("../src/models/User")] = {
  exports: mockUserModel,
};
require.cache[require.resolve("../src/models/Interview")] = {
  exports: createMockInterview(),
};
require.cache[require.resolve("../src/models/CodingInterview")] = {
  exports: mockCodingInterview,
};
require.cache[require.resolve("../src/models/Resume")] = {
  exports: mockResumeModel,
};
require.cache[require.resolve("../src/models/Notification")] = {
  exports: mockNotificationModel,
};
require.cache[require.resolve("../src/models/Settings")] = {
  exports: mockSettingsModel,
};
require.cache[require.resolve("../src/config/db")] = {
  exports: async () => {},
};

// ---- Load Express app ----
const createApp = require("../server.app");
const authRoutes = require("../src/routes/authRoutes");
const resumeRoutes = require("../src/routes/resumeRoutes");
const interviewRoutes = require("../src/routes/interviewRoutes");
const aiRoutes = require("../src/routes/aiRoutes");
const answerRoutes = require("../src/routes/answerRoutes");
const evaluationRoutes = require("../src/routes/evaluationRoutes");
const feedbackRoutes = require("../src/routes/feedbackRoutes");
const reportRoutes = require("../src/routes/reportRoutes");
const dashboardRoutes = require("../src/routes/dashboardRoutes");
const adminRoutes = require("../src/routes/adminRoutes");
const notificationRoutes = require("../src/routes/notificationRoutes");
const settingsRoutes = require("../src/routes/settingsRoutes");
const analyticsRoutes = require("../src/routes/analyticsRoutes");

const app = createApp();
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/answer", answerRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);

// ---- HTTP request helper ----
const request = (server, method, path, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const options = {
      hostname: "127.0.0.1",
      port,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(data);
        } catch {
          parsedBody = data;
        }
        resolve({ status: res.statusCode, body: parsedBody, headers: res.headers });
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

// ---- Test runner ----
let testCount = 0;
let passCount = 0;

const test = async (name, fn) => {
  testCount++;
  try {
    await fn();
    passCount++;
    console.log(`  ✓ TEST ${testCount}: ${name}`);
  } catch (error) {
    console.error(`  ✗ TEST ${testCount}: ${name}`);
    console.error(`    Error: ${error.message}`);
    process.exit(1);
  }
};

// ---- Main Test Suite ----
const runTests = async () => {
  console.log("--- Full API Integration Tests ---\n");

  const server = app.listen(0);
  const auth = (token) => ({ Authorization: `Bearer ${token}` });

  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let interviewId;
  let notificationId;

  // ===== HEALTH CHECK =====
  await test("GET /api/health returns 200", async () => {
    const res = await request(server, "GET", "/api/health");
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, { status: "Server is running" });
  });

  // ===== AUTHENTICATION =====
  await test("POST /api/auth/register - missing fields returns 400", async () => {
    const res = await request(server, "POST", "/api/auth/register", {});
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message);
  });

  await test("POST /api/auth/register - success returns 201", async () => {
    const res = await request(server, "POST", "/api/auth/register", {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.user);
    assert.strictEqual(res.body.user.email, "test@example.com");
    userId = res.body.user.id;
  });

  await test("POST /api/auth/register - duplicate email returns 409", async () => {
    const res = await request(server, "POST", "/api/auth/register", {
      name: "Test User 2",
      email: "test@example.com",
      password: "password123",
    });
    assert.strictEqual(res.status, 409);
  });

  await test("POST /api/auth/login - missing fields returns 400", async () => {
    const res = await request(server, "POST", "/api/auth/login", {});
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/auth/login - wrong email returns 401", async () => {
    const res = await request(server, "POST", "/api/auth/login", {
      email: "wrong@example.com",
      password: "password123",
    });
    assert.strictEqual(res.status, 401);
  });

  await test("POST /api/auth/login - wrong password returns 401", async () => {
    const res = await request(server, "POST", "/api/auth/login", {
      email: "test@example.com",
      password: "wrongpassword",
    });
    assert.strictEqual(res.status, 401);
  });

  await test("POST /api/auth/login - success returns 200 with token", async () => {
    const res = await request(server, "POST", "/api/auth/login", {
      email: "test@example.com",
      password: "password123",
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.token);
    userToken = res.body.token;
  });

  await test("GET /api/auth/profile - no token returns 401", async () => {
    const res = await request(server, "GET", "/api/auth/profile");
    assert.strictEqual(res.status, 401);
  });

  await test("GET /api/auth/profile - invalid token returns 401", async () => {
    const res = await request(server, "GET", "/api/auth/profile", null, auth("invalid_token"));
    assert.strictEqual(res.status, 401);
  });

  await test("GET /api/auth/profile - valid token returns 200", async () => {
    const res = await request(server, "GET", "/api/auth/profile", null, auth(userToken));
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.user);
  });

  // Register admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminUser = {
    _id: createMockId(),
    name: "Admin User",
    email: "admin@example.com",
    password: adminPassword,
    role: "admin",
    createdAt: new Date(),
  };
  users.push(adminUser);
  adminId = adminUser._id;
  adminToken = jwt.sign({ userId: adminId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // ===== INTERVIEW =====
  await test("POST /api/interview/create - no token returns 401", async () => {
    const res = await request(server, "POST", "/api/interview/create", {
      jobRole: "Developer",
      difficulty: "Easy",
      numberOfQuestions: 3,
    });
    assert.strictEqual(res.status, 401);
  });

  await test("POST /api/interview/create - missing fields returns 400", async () => {
    const res = await request(
      server, "POST", "/api/interview/create", {},
      auth(userToken)
    );
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/interview/create - invalid difficulty returns 400", async () => {
    const res = await request(
      server, "POST", "/api/interview/create",
      { jobRole: "Developer", difficulty: "Extreme", numberOfQuestions: 3 },
      auth(userToken)
    );
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/interview/create - invalid numberOfQuestions returns 400", async () => {
    const res = await request(
      server, "POST", "/api/interview/create",
      { jobRole: "Developer", difficulty: "Easy", numberOfQuestions: -1 },
      auth(userToken)
    );
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/interview/create - success returns 201", async () => {
    const res = await request(
      server, "POST", "/api/interview/create",
      { jobRole: "Developer", difficulty: "Easy", numberOfQuestions: 3 },
      auth(userToken)
    );
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.interview);
    interviewId = res.body.interview.id;
  });

  await test("GET /api/interview - no token returns 401", async () => {
    const res = await request(server, "GET", "/api/interview");
    assert.strictEqual(res.status, 401);
  });

  await test("GET /api/interview - success returns 200", async () => {
    const res = await request(server, "GET", "/api/interview", null, auth(userToken));
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.interviews));
  });

  await test("GET /api/interview/:id - success returns 200", async () => {
    const res = await request(
      server, "GET", `/api/interview/${interviewId}`, null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.interview);
  });

  await test("GET /api/interview/:id - wrong ID returns 404", async () => {
    const res = await request(
      server, "GET", `/api/interview/${createMockId()}`, null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 404);
  });

  // ===== AI QUESTIONS =====
  await test("POST /api/ai/generate - no token returns 401", async () => {
    const res = await request(server, "POST", "/api/ai/generate", {
      interviewId,
    });
    assert.strictEqual(res.status, 401);
  });

  await test("POST /api/ai/generate - missing interviewId returns 400", async () => {
    const res = await request(server, "POST", "/api/ai/generate", {}, auth(userToken));
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/ai/generate - success returns 200", async () => {
    const res = await request(
      server, "POST", "/api/ai/generate",
      { interviewId },
      auth(userToken)
    );
    if (res.status !== 200) {
      console.log("TEST 23 ERROR:", res.body);
    }
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.questions);
    assert.ok(res.body.questions.length > 0);
  });

  await test("GET /api/ai/questions/:interviewId - success returns 200", async () => {
    const res = await request(
      server, "GET", `/api/ai/questions/${interviewId}`, null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.questions);
  });

  // ===== ANSWERS =====
  await test("POST /api/answer/submit - no token returns 401", async () => {
    const res = await request(server, "POST", "/api/answer/submit", {
      interviewId,
      questionId: 1,
      answer: "My answer",
    });
    assert.strictEqual(res.status, 401);
  });

  await test("POST /api/answer/submit - missing fields returns 400", async () => {
    const res = await request(
      server, "POST", "/api/answer/submit", {},
      auth(userToken)
    );
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/answer/submit - success returns 200", async () => {
    const res = await request(
      server, "POST", "/api/answer/submit",
      { interviewId, questionId: 1, answer: "My test answer" },
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.message);
  });

  await test("POST /api/answer/submit - wrong questionId returns 404", async () => {
    const res = await request(
      server, "POST", "/api/answer/submit",
      { interviewId, questionId: 999, answer: "Answer" },
      auth(userToken)
    );
    assert.strictEqual(res.status, 404);
  });

  await test("GET /api/answer/:interviewId - success returns 200", async () => {
    const res = await request(
      server, "GET", `/api/answer/${interviewId}`, null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.answers);
  });

  // ===== EVALUATION =====
  await test("POST /api/evaluation/evaluate - no token returns 401", async () => {
    const res = await request(server, "POST", "/api/evaluation/evaluate", {
      interviewId,
    });
    assert.strictEqual(res.status, 401);
  });

  await test("POST /api/evaluation/evaluate - missing interviewId returns 400", async () => {
    const res = await request(
      server, "POST", "/api/evaluation/evaluate", {},
      auth(userToken)
    );
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/evaluation/evaluate - success returns 200", async () => {
    const res = await request(
      server, "POST", "/api/evaluation/evaluate",
      { interviewId },
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.score !== undefined);
  });

  await test("GET /api/evaluation/:interviewId - success returns 200", async () => {
    const res = await request(
      server, "GET", `/api/evaluation/${interviewId}`, null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.score !== undefined);
  });

  // ===== FEEDBACK =====
  await test("POST /api/feedback/generate - no token returns 401", async () => {
    const res = await request(server, "POST", "/api/feedback/generate", {
      interviewId,
    });
    assert.strictEqual(res.status, 401);
  });

  await test("POST /api/feedback/generate - missing interviewId returns 400", async () => {
    const res = await request(
      server, "POST", "/api/feedback/generate", {},
      auth(userToken)
    );
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/feedback/generate - success returns 200", async () => {
    const res = await request(
      server, "POST", "/api/feedback/generate",
      { interviewId },
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.feedback);
  });

  await test("GET /api/feedback/:interviewId - success returns 200", async () => {
    const res = await request(
      server, "GET", `/api/feedback/${interviewId}`, null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.feedback !== undefined);
  });

  // ===== REPORT =====
  await test("GET /api/report/:interviewId - no token returns 401", async () => {
    const res = await request(
      server, "GET", `/api/report/${interviewId}`
    );
    assert.strictEqual(res.status, 401);
  });

  await test("GET /api/report/:interviewId - success returns 200", async () => {
    const res = await request(
      server, "GET", `/api/report/${interviewId}`, null,
      auth(userToken)
    );
    if (res.status !== 200) {
      console.log("TEST 39 ERROR:", res.body);
    }
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.report);
  });

  // ===== DASHBOARD =====
  await test("GET /api/dashboard - no token returns 401", async () => {
    const res = await request(server, "GET", "/api/dashboard");
    assert.strictEqual(res.status, 401);
  });

  await test("GET /api/dashboard - success returns 200", async () => {
    const res = await request(
      server, "GET", "/api/dashboard", null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.summary);
  });

  // ===== ANALYTICS =====
  await test("GET /api/analytics - no token returns 401", async () => {
    const res = await request(server, "GET", "/api/analytics");
    assert.strictEqual(res.status, 401);
  });

  await test("GET /api/analytics - success returns 200", async () => {
    const res = await request(
      server, "GET", "/api/analytics", null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.analytics);
  });

  // ===== NOTIFICATIONS =====
  await test("POST /api/notification/create - no token returns 401", async () => {
    const res = await request(server, "POST", "/api/notification/create", {
      title: "Test",
      message: "Hello",
    });
    assert.strictEqual(res.status, 401);
  });

  await test("POST /api/notification/create - missing fields returns 400", async () => {
    const res = await request(
      server, "POST", "/api/notification/create", {},
      auth(userToken)
    );
    assert.strictEqual(res.status, 400);
  });

  await test("POST /api/notification/create - success returns 201", async () => {
    const res = await request(
      server, "POST", "/api/notification/create",
      { title: "Test Notification", message: "This is a test." },
      auth(userToken)
    );
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.notification);
    notificationId = res.body.notification.id;
  });

  await test("GET /api/notification - success returns 200", async () => {
    const res = await request(
      server, "GET", "/api/notification", null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.notifications);
  });

  await test("PUT /api/notification/:id/read - success returns 200", async () => {
    const res = await request(
      server, "PUT", `/api/notification/${notificationId}/read`, {},
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
  });

  await test("PUT /api/notification/:id/read - wrong ID returns 404", async () => {
    const res = await request(
      server, "PUT", `/api/notification/${createMockId()}/read`, {},
      auth(userToken)
    );
    assert.strictEqual(res.status, 404);
  });

  // ===== SETTINGS =====
  await test("GET /api/settings - no token returns 401", async () => {
    const res = await request(server, "GET", "/api/settings");
    assert.strictEqual(res.status, 401);
  });

  await test("GET /api/settings - success returns 200 with defaults", async () => {
    const res = await request(
      server, "GET", "/api/settings", null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.settings);
  });

  await test("POST /api/settings - success returns 200", async () => {
    const res = await request(
      server, "POST", "/api/settings",
      { theme: "dark", preferredLanguage: "Hindi" },
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.settings);
  });

  await test("POST /api/settings - invalid theme returns 400", async () => {
    const res = await request(
      server, "POST", "/api/settings",
      { theme: "neon" },
      auth(userToken)
    );
    assert.strictEqual(res.status, 400);
  });

  await test("PUT /api/settings - success returns 200", async () => {
    const res = await request(
      server, "PUT", "/api/settings",
      { theme: "light" },
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.settings);
  });

  await test("PUT /api/settings - invalid theme returns 400", async () => {
    const res = await request(
      server, "PUT", "/api/settings",
      { theme: "rainbow" },
      auth(userToken)
    );
    assert.strictEqual(res.status, 400);
  });

  // ===== ADMIN =====
  await test("GET /api/admin/users - no token returns 401", async () => {
    const res = await request(server, "GET", "/api/admin/users");
    assert.strictEqual(res.status, 401);
  });

  await test("GET /api/admin/users - non-admin returns 403", async () => {
    const res = await request(
      server, "GET", "/api/admin/users", null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 403);
  });

  await test("GET /api/admin/users - admin returns 200", async () => {
    const res = await request(
      server, "GET", "/api/admin/users", null,
      auth(adminToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.users);
  });

  await test("GET /api/admin/interviews - admin returns 200", async () => {
    const res = await request(
      server, "GET", "/api/admin/interviews", null,
      auth(adminToken)
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.interviews);
  });

  await test("DELETE /api/admin/user/:id - non-admin returns 403", async () => {
    const res = await request(
      server, "DELETE", `/api/admin/user/${userId}`, null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 403);
  });

  await test("DELETE /api/admin/user/:id - wrong ID returns 404", async () => {
    const res = await request(
      server, "DELETE", `/api/admin/user/${createMockId()}`, null,
      auth(adminToken)
    );
    assert.strictEqual(res.status, 404);
  });

  await test("DELETE /api/admin/interview/:id - wrong ID returns 404", async () => {
    const res = await request(
      server, "DELETE", `/api/admin/interview/${createMockId()}`, null,
      auth(adminToken)
    );
    assert.strictEqual(res.status, 404);
  });

  // ===== DELETE INTERVIEW (user-level) =====
  await test("DELETE /api/interview/:id - success returns 200", async () => {
    // Create a throwaway interview to delete
    const createRes = await request(
      server, "POST", "/api/interview/create",
      { jobRole: "Tester", difficulty: "Medium", numberOfQuestions: 2 },
      auth(userToken)
    );
    const tempId = createRes.body.interview.id;
    const res = await request(
      server, "DELETE", `/api/interview/${tempId}`, null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 200);
  });

  await test("DELETE /api/interview/:id - wrong ID returns 404", async () => {
    const res = await request(
      server, "DELETE", `/api/interview/${createMockId()}`, null,
      auth(userToken)
    );
    assert.strictEqual(res.status, 404);
  });

  // ===== CORS VERIFICATION =====
  await test("OPTIONS preflight returns CORS headers", async () => {
    const port = server.address().port;
    const res = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port,
          path: "/api/health",
          method: "OPTIONS",
          headers: {
            Origin: "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
          },
        },
        (res) => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
          });
        }
      );
      req.on("error", reject);
      req.end();
    });
    assert.ok(res.headers["access-control-allow-origin"]);
  });

  // ===== SUMMARY =====
  server.close();
  console.log(`\n--- All ${passCount}/${testCount} tests passed! ---\n`);
};

runTests().catch((err) => {
  console.error("Test suite failed:", err.message);
  process.exit(1);
});
