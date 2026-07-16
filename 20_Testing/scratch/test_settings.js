const assert = require("assert");

// Mock store for settings
let dbStore = [];

// 1. Mock Settings Model
const mockSettings = {
  create: async function (data) {
    const record = {
      _id: "settings_999",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    dbStore.push(record);
    return record;
  },
  findOne: (query) => {
    const match = dbStore.find((s) => s.userId === query.userId);
    return {
      then: (resolve) => resolve(match || null),
    };
  },
  findOneAndUpdate: async function (query, updateData, options) {
    let record = dbStore.find((r) => r.userId === query.userId);
    const actualUpdates = updateData.$set ? updateData.$set : updateData;
    if (!record) {
      record = {
        _id: "settings_123",
        userId: query.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...actualUpdates,
      };
      dbStore.push(record);
    } else {
      Object.assign(record, actualUpdates);
      record.updatedAt = new Date();
    }
    return record;
  },
};

require.cache[require.resolve("../src/models/Settings")] = {
  exports: mockSettings,
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
const settingsRoutes = require("../src/routes/settingsRoutes");
const {
  saveSettings,
  getSettings,
  updateSettings,
} = require("../src/controllers/settingsController");

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
  console.log("--- Starting Settings Step 2 Unit Tests ---");

  // TEST 1: Controller - Get settings (Returns defaults if none exists)
  {
    const req = {
      user: { _id: "user_123" },
    };
    const res = mockResponse();
    await getSettings(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Settings fetched successfully.");
    assert.strictEqual(res.body.settings.theme, "light");
    assert.strictEqual(res.body.settings.preferredLanguage, "English");
    assert.strictEqual(res.body.settings.interviewDifficulty, "Medium");
    assert.strictEqual(dbStore.length, 1);
    console.log("✓ TEST 1: Controller - Get settings (Default) passed");
  }

  // TEST 2: Controller - Save Success (POST)
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        theme: "dark",
        preferredLanguage: "Spanish",
        interviewDifficulty: "Hard",
      },
    };
    const res = mockResponse();
    await saveSettings(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Settings saved successfully.");
    assert.strictEqual(res.body.settings.theme, "dark");
    assert.strictEqual(res.body.settings.preferredLanguage, "Spanish");
    assert.strictEqual(dbStore.length, 1);
    console.log("✓ TEST 2: Controller - Save Success (POST) passed");
  }

  // TEST 3: Controller - Update Success (PUT)
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        preferredLanguage: "French",
      },
    };
    const res = mockResponse();
    await updateSettings(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Settings updated successfully.");
    assert.strictEqual(res.body.settings.theme, "dark"); // preserved
    assert.strictEqual(res.body.settings.preferredLanguage, "French"); // modified
    console.log("✓ TEST 3: Controller - Update Success (PUT) passed");
  }

  // TEST 4: Controller - Invalid theme value
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        theme: "green",
      },
    };
    const res = mockResponse();
    await saveSettings(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(
      res.body.message,
      "theme must be either 'light' or 'dark'."
    );
    console.log("✓ TEST 4: Controller - Invalid theme value passed");
  }

  // TEST 5: Route - Verification
  {
    const getRoute = settingsRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/" && layer.route.methods.get
    );
    assert.ok(getRoute);

    const postRoute = settingsRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/" && layer.route.methods.post
    );
    assert.ok(postRoute);

    const putRoute = settingsRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/" && layer.route.methods.put
    );
    assert.ok(putRoute);
    console.log("✓ TEST 5: Route - Verification passed");
  }

  console.log("\n--- All Settings Step 2 tests passed successfully! ---");
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
