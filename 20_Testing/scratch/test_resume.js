const assert = require("assert");

// 1. Mock Mongoose Models
const resumeDbStore = [];
const mockResume = {
  create: async (data) => {
    const newResume = {
      _id: "mock_resume_id_" + Math.random().toString(36).substr(2, 9),
      ...data,
      uploadedAt: new Date(),
      analysis: null,
      analysisTargetRole: "",
      analyzedAt: null,
      save: async function () {
        return this;
      },
    };
    resumeDbStore.push(newResume);
    return newResume;
  },
  findOne: (query) => {
    const userResumes = resumeDbStore.filter((r) => {
      const userMatches = r.userId === query.userId;
      const idMatches = !query._id || r._id === query._id;
      return userMatches && idMatches;
    });
    const queryObj = {
      sort: (sortObj) => {
        const sorted = [...userResumes].sort(
          (a, b) => b.uploadedAt - a.uploadedAt
        );
        const result = sorted[0] || null;
        return result;
      },
      then: (resolve) => {
        const result = userResumes[0] || null;
        resolve(result);
      },
    };
    return queryObj;
  },
};

require.cache[require.resolve("../src/models/Resume")] = {
  exports: mockResume,
};

// Mock User Model
const mockUser = {
  findById: (id) => {
    return {
      select: () => {
        return {
          then: (resolve) => resolve({ _id: id, email: "test@example.com" }),
        };
      },
    };
  },
};
require.cache[require.resolve("../src/models/User")] = {
  exports: mockUser,
};

require.cache[require.resolve("../src/services/resumeTextService")] = {
  exports: {
    getMimeTypeFromFileName: () => "application/pdf",
    isSupportedResumeMimeType: (mimeType) => {
      return [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(mimeType);
    },
    extractResumeText: async () =>
      "Jane Doe frontend developer resume with React, Node.js, MongoDB, projects, internship experience, and 25% performance improvement.",
  },
};

require.cache[require.resolve("../src/services/resumeAnalysisService")] = {
  exports: {
    createResumeAnalysis: async ({ targetJobRole }) => ({
      overallScore: 82,
      atsCompatibilityScore: 78,
      strengths: ["Mentions React, Node.js, MongoDB, projects, and internship experience."],
      weaknesses: ["Needs more quantified outcomes across experience bullets."],
      missingRecommendedSkills: ["Add role-relevant testing skills if accurate."],
      projectExperienceQuality: {
        score: 80,
        summary: "Projects and experience are present with some measurable impact.",
        suggestions: ["Clarify project outcomes and technical ownership."],
      },
      improvementSuggestions: ["Add metrics where evidence supports them."],
      actionPlan: ["Revise bullets to include action, method, and result."],
      targetJobRole,
      jobMatchScore: targetJobRole ? 76 : null,
    }),
  },
};

// 2. Mock multer
const mockMulter = (config) => {
  return {
    single: (fieldname) => {
      return (req, res, next) => {
        if (req.mockUploadError) {
          return next(req.mockUploadError);
        }
        if (req.mockNoFile) {
          req.file = undefined;
          return next();
        }
        req.file = {
          fieldname: fieldname,
          originalname: "my_resume.pdf",
          mimetype: "application/pdf",
          size: 20480,
          filename: `${fieldname}-12345678.pdf`,
          path: `uploads/resumes/${fieldname}-12345678.pdf`,
        };
        next();
      };
    },
  };
};
mockMulter.diskStorage = (config) => ({});
class MulterError extends Error {
  constructor(message) {
    super(message);
    this.name = "MulterError";
  }
}
mockMulter.MulterError = MulterError;

require.cache[require.resolve("multer")] = {
  exports: mockMulter,
};

// Expose fake environment secret
process.env.JWT_SECRET = "test_jwt_secret_key";

// 3. Import route handler & controller
const resumeRoutes = require("../src/routes/resumeRoutes");
const { uploadResume, getResume, analyzeResume } = require("../src/controllers/resumeController");

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

// Run Tests
const runTests = async () => {
  console.log("--- Starting Resume Module Step 2 Unit Tests ---");

  // TEST 1: Controller - Upload Success and database save
  {
    const req = {
      user: { _id: "user_123" },
      file: {
        fieldname: "resume",
        originalname: "test-resume.pdf",
        size: 10240,
        filename: "resume-1234567890.pdf",
        path: "uploads/resumes/resume-1234567890.pdf",
      },
    };
    const res = mockResponse();
    await uploadResume(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.message, "Resume uploaded successfully.");
    assert.strictEqual(res.body.resume.userId, "user_123");
    assert.strictEqual(res.body.resume.fileName, "resume-1234567890.pdf");
    assert.ok(res.body.resume.id);
    assert.ok(res.body.resume.uploadedAt);
    console.log("✓ TEST 1: Controller - Upload & Database Save passed");
  }

  // TEST 2: Controller - Get uploaded resume (Success)
  {
    const req = { user: { _id: "user_123" } };
    const res = mockResponse();
    await getResume(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Resume fetched successfully.");
    assert.strictEqual(res.body.resume.userId, "user_123");
    assert.strictEqual(res.body.resume.fileName, "resume-1234567890.pdf");
    console.log("✓ TEST 2: Controller - Get resume (Success) passed");
  }

  // TEST 3: Controller - Get uploaded resume (Not Found)
  {
    const req = { user: { _id: "non_existent_user" } };
    const res = mockResponse();
    await getResume(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "No resume found for this user.");
    console.log("✓ TEST 3: Controller - Get resume (Not Found) passed");
  }

  // TEST 4: Controller - Analyze resume and persist result
  {
    const existingResume = resumeDbStore.find((r) => r.userId === "user_123");
    const req = {
      user: { _id: "user_123" },
      params: { id: existingResume._id },
      body: { targetJobRole: "Frontend Developer" },
    };
    const res = mockResponse();
    await analyzeResume(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Resume analyzed successfully.");
    assert.strictEqual(res.body.analysis.overallScore, 82);
    assert.strictEqual(res.body.analysis.targetJobRole, "Frontend Developer");
    assert.strictEqual(existingResume.analysis.overallScore, 82);
    assert.ok(existingResume.analyzedAt);
    console.log("✓ TEST 4: Controller - Resume analysis passed");
  }

  // TEST 5: Controller - Analyze non-existent resume (404)
  {
    const req = {
      user: { _id: "user_123" },
      params: { id: "non_existent_id" },
      body: { targetJobRole: "Backend Developer" },
    };
    const res = mockResponse();
    await analyzeResume(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Resume not found.");
    console.log("✓ TEST 5: Controller - Analyze non-existent resume returns 404");
  }

  // TEST 6: Controller - Analyze without auth (401)
  {
    const req = {
      params: { id: "some_id" },
      body: { targetJobRole: "Full Stack Developer" },
    };
    const res = mockResponse();
    await analyzeResume(req, res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Unauthorized. Please log in.");
    console.log("✓ TEST 6: Controller - Analyze without auth returns 401");
  }

  // TEST 7: Middleware Integration & Authorization
  {
    // Find upload route stack
    const uploadRoute = resumeRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/upload"
    );
    assert.ok(uploadRoute);

    // Middleware stack: authMiddleware, custom multer error wrapper, uploadResume controller
    const handlers = uploadRoute.route.stack;
    assert.ok(handlers.length >= 3);

    const analyzeRoute = resumeRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/:id/analyze"
    );
    assert.ok(analyzeRoute);

    console.log("✓ TEST 7: Routes - Middleware integration verified");
  }

  console.log("\n--- All Resume Module Step 2 tests passed successfully! ---");
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
