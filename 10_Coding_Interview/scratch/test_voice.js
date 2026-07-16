const assert = require("assert");
const fs = require("fs");

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = (path, options) => {
  if (typeof path === "string" && path.includes("uploads/audio")) {
    return Buffer.from("mock_audio_content");
  }
  return originalReadFileSync(path, options);
};

// 1. Mock Interview Model
const interviewDbStore = [
  {
    _id: "interview_456",
    userId: "user_123",
    questions: [
      { id: 1, text: "Explain your experience with REST APIs.", type: "technical" },
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
process.env.GEMINI_API_KEY = ""; // dummy triggers mock transcription

// 2. Import controller and routes
const voiceRoutes = require("../src/routes/voiceRoutes");
const {
  uploadAudio,
  transcribeVoiceAnswer,
} = require("../src/controllers/voiceController");

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
  console.log("--- Starting Voice Module Step 2 Unit Tests ---");

  // TEST 1: Controller - Upload Success
  {
    const req = {
      user: { _id: "user_123" },
      file: {
        filename: "voice-123456789.wav",
        path: "uploads/audio/voice-123456789.wav",
      },
    };
    const res = mockResponse();
    await uploadAudio(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Audio file uploaded successfully.");
    assert.strictEqual(res.body.fileName, "voice-123456789.wav");
    assert.strictEqual(res.body.filePath, "uploads/audio/voice-123456789.wav");
    console.log("✓ TEST 1: Controller - Upload Success passed");
  }

  // TEST 2: Controller - Transcribe Success & DB Save
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        interviewId: "interview_456",
        questionId: 1,
      },
      file: {
        filename: "voice-123456789.wav",
        path: "uploads/audio/voice-123456789.wav",
        mimetype: "audio/wav",
      },
    };
    const res = mockResponse();
    await transcribeVoiceAnswer(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.message,
      "Audio transcribed and answer saved successfully."
    );
    assert.strictEqual(
      res.body.transcript,
      "This is a mock transcription of the uploaded audio file."
    );

    // Verify it was updated in the DB
    assert.strictEqual(
      interviewDbStore[0].questions[0].userAnswer,
      "This is a mock transcription of the uploaded audio file."
    );
    console.log("✓ TEST 2: Controller - Transcribe Success & DB Save passed");
  }

  // TEST 3: Controller - Transcribe with missing interviewId
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        interviewId: "",
      },
      file: {
        filename: "voice-123456789.wav",
        path: "uploads/audio/voice-123456789.wav",
        mimetype: "audio/wav",
      },
    };
    const res = mockResponse();
    await transcribeVoiceAnswer(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, "interviewId is required.");
    console.log("✓ TEST 3: Controller - Transcribe with missing interviewId passed");
  }

  // TEST 4: Controller - Transcribe with non-existent interview
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        interviewId: "non_existent_id",
      },
      file: {
        filename: "voice-123456789.wav",
        path: "uploads/audio/voice-123456789.wav",
        mimetype: "audio/wav",
      },
    };
    const res = mockResponse();
    await transcribeVoiceAnswer(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview not found.");
    console.log("✓ TEST 4: Controller - Transcribe with non-existent interview passed");
  }

  // TEST 5: Route - Verification
  {
    const uploadRoute = voiceRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/upload"
    );
    assert.ok(uploadRoute);
    const transcribeRoute = voiceRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/transcribe"
    );
    assert.ok(transcribeRoute);
    console.log("✓ TEST 5: Route - Verification passed");
  }

  console.log("\n--- All Voice Module Step 2 tests passed successfully! ---");
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
