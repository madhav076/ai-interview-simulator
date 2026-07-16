const assert = require("assert");

// Mock PDFKit
const mockPDF = function () {
  return {
    pipe: function (stream) {
      return this;
    },
    fontSize: function () {
      return this;
    },
    text: function () {
      return this;
    },
    moveDown: function () {
      return this;
    },
    end: function () {
      return this;
    },
  };
};

require.cache[require.resolve("pdfkit")] = {
  exports: mockPDF,
};

// 1. Mock Interview Model
const interviewDbStore = [
  {
    _id: "interview_report_111",
    userId: {
      _id: "user_report_222",
      name: "Alice Reporter",
      email: "alice@example.com",
    },
    jobRole: "UX Researcher",
    difficulty: "Medium",
    questions: [
      {
        id: 1,
        text: "Explain your design process.",
        type: "technical",
        userAnswer: "First, user research, then wireframing.",
      },
    ],
    score: 80,
    feedback: "Excellent performance.",
  },
];

const mockInterview = {
  findOne: (query) => {
    const interview = interviewDbStore.find(
      (i) => i._id === query._id && i.userId._id === query.userId
    );
    return {
      populate: (field, selectFields) => ({
        then: (resolve) => resolve(interview || null),
      }),
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
const reportRoutes = require("../src/routes/reportRoutes");
const {
  getInterviewReport,
  generateInterviewReportPDF,
} = require("../src/controllers/reportController");

// Helper to create mock response
const mockResponse = () => {
  const res = {
    headers: {},
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  res.setHeader = (name, value) => {
    res.headers[name] = value;
    return res;
  };
  // Mock write streams since pdfkit doc.pipe(res) acts as a write stream target
  res.on = (event, cb) => {
    return res;
  };
  res.once = (event, cb) => {
    return res;
  };
  res.emit = (event, ...args) => {
    return true;
  };
  res.write = (chunk, cb) => {
    return true;
  };
  res.end = (cb) => {
    return res;
  };
  return res;
};

// Run tests
const runTests = async () => {
  console.log("--- Starting AI Report Generation Step 2 Unit Tests ---");

  // TEST 1: Controller - Fetch Success (JSON)
  {
    const req = {
      user: { _id: "user_report_222" },
      params: {
        interviewId: "interview_report_111",
      },
    };
    const res = mockResponse();
    await getInterviewReport(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Report generated successfully.");
    assert.strictEqual(res.body.report.userName, "Alice Reporter");
    assert.strictEqual(res.body.report.email, "alice@example.com");
    assert.strictEqual(res.body.report.jobRole, "UX Researcher");
    assert.strictEqual(res.body.report.score, 80);
    assert.strictEqual(res.body.report.feedback, "Excellent performance.");
    assert.strictEqual(res.body.report.questions.length, 1);
    assert.strictEqual(
      res.body.report.questions[0].userAnswer,
      "First, user research, then wireframing."
    );
    console.log("✓ TEST 1: Controller - Fetch Success (JSON) passed");
  }

  // TEST 2: Controller - Generate PDF (Success)
  {
    const req = {
      user: { _id: "user_report_222" },
      params: {
        interviewId: "interview_report_111",
      },
    };
    const res = mockResponse();
    await generateInterviewReportPDF(req, res);
    assert.strictEqual(res.headers["Content-Type"], "application/pdf");
    assert.ok(
      res.headers["Content-Disposition"].includes(
        "attachment; filename=Interview_Report_interview_report_111.pdf"
      )
    );
    console.log("✓ TEST 2: Controller - Generate PDF (Success) passed");
  }

  // TEST 3: Controller - PDF Non-existent interview
  {
    const req = {
      user: { _id: "user_report_222" },
      params: {
        interviewId: "non_existent",
      },
    };
    const res = mockResponse();
    await generateInterviewReportPDF(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log("✓ TEST 3: Controller - PDF Non-existent interview passed");
  }

  // TEST 4: Route - Verification
  {
    const reportRoute = reportRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/:interviewId"
    );
    assert.ok(reportRoute);
    const pdfRoute = reportRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/:interviewId/pdf"
    );
    assert.ok(pdfRoute);
    console.log("✓ TEST 4: Route - Verification passed");
  }

  console.log(
    "\n--- All AI Report Generation Step 2 tests passed successfully! ---"
  );
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
