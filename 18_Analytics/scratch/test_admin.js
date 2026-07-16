const assert = require("assert");

// Mock stores for delete tracking
let usersDb = [
  { _id: "user_11", name: "Alice", email: "alice@example.com", role: "admin" },
  { _id: "user_22", name: "Bob", email: "bob@example.com", role: "user" },
];

let interviewsDb = [
  {
    _id: "interview_99",
    jobRole: "Backend Dev",
    userId: { name: "Bob", email: "bob@example.com" },
  },
];

// 1. Mock User Model
const mockUser = {
  find: (query) => ({
    select: (fields) => ({
      then: (resolve) => resolve(usersDb),
    }),
  }),
  findById: (id) => ({
    select: () => ({
      then: (resolve) => {
        if (id === "admin_123") {
          resolve({ _id: id, role: "admin", email: "admin@example.com" });
        } else {
          resolve({ _id: id, role: "user", email: "user@example.com" });
        }
      },
    }),
  }),
  findByIdAndDelete: async (id) => {
    const idx = usersDb.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    const deleted = usersDb[idx];
    usersDb.splice(idx, 1);
    return deleted;
  },
};
require.cache[require.resolve("../src/models/User")] = {
  exports: mockUser,
};

// Mock Interview Model
const mockInterview = {
  find: (query) => ({
    populate: (field, selectFields) => ({
      then: (resolve) => resolve(interviewsDb),
    }),
  }),
  findByIdAndDelete: async (id) => {
    const idx = interviewsDb.findIndex((i) => i._id === id);
    if (idx === -1) return null;
    const deleted = interviewsDb[idx];
    interviewsDb.splice(idx, 1);
    return deleted;
  },
};
require.cache[require.resolve("../src/models/Interview")] = {
  exports: mockInterview,
};

// Set env
process.env.JWT_SECRET = "test_jwt_secret_key";

// 2. Import controller, middleware, and routes
const adminRoutes = require("../src/routes/adminRoutes");
const {
  getAllUsers,
  getAllInterviews,
  deleteUser,
  deleteInterview,
} = require("../src/controllers/adminController");
const adminMiddleware = require("../src/middleware/adminMiddleware");

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
  console.log("--- Starting Admin Step 2 Unit Tests ---");

  // TEST 1: Middleware - Allow Admin
  {
    let nextCalled = false;
    const req = {
      user: { _id: "admin_123", role: "admin" },
    };
    const res = mockResponse();
    adminMiddleware(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);
    console.log("✓ TEST 1: Middleware - Allow Admin passed");
  }

  // TEST 2: Middleware - Reject Non-Admin (Forbidden)
  {
    let nextCalled = false;
    const req = {
      user: { _id: "user_456", role: "user" },
    };
    const res = mockResponse();
    adminMiddleware(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.message, "Forbidden. Admin access required.");
    console.log("✓ TEST 2: Middleware - Reject Non-Admin passed");
  }

  // TEST 3: Controller - Get All Users
  {
    const req = {
      user: { _id: "admin_123", role: "admin" },
    };
    const res = mockResponse();
    await getAllUsers(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Users fetched successfully.");
    assert.strictEqual(res.body.users.length, 2);
    assert.strictEqual(res.body.users[0].name, "Alice");
    assert.strictEqual(res.body.users[0].role, "admin");
    console.log("✓ TEST 3: Controller - Get All Users passed");
  }

  // TEST 4: Controller - Get All Interviews
  {
    const req = {
      user: { _id: "admin_123", role: "admin" },
    };
    const res = mockResponse();
    await getAllInterviews(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Interviews fetched successfully.");
    assert.strictEqual(res.body.interviews.length, 1);
    assert.strictEqual(res.body.interviews[0].jobRole, "Backend Dev");
    console.log("✓ TEST 4: Controller - Get All Interviews passed");
  }

  // TEST 5: Controller - Delete User (Success)
  {
    const req = {
      user: { _id: "admin_123", role: "admin" },
      params: { id: "user_22" },
    };
    const res = mockResponse();
    await deleteUser(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "User deleted successfully.");
    assert.strictEqual(res.body.userId, "user_22");
    assert.strictEqual(usersDb.length, 1);
    console.log("✓ TEST 5: Controller - Delete User (Success) passed");
  }

  // TEST 6: Controller - Delete User (Not Found)
  {
    const req = {
      user: { _id: "admin_123", role: "admin" },
      params: { id: "non_existent" },
    };
    const res = mockResponse();
    await deleteUser(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "User not found.");
    console.log("✓ TEST 6: Controller - Delete User (Not Found) passed");
  }

  // TEST 7: Controller - Delete Interview Record (Success)
  {
    const req = {
      user: { _id: "admin_123", role: "admin" },
      params: { id: "interview_99" },
    };
    const res = mockResponse();
    await deleteInterview(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.message,
      "Interview record deleted successfully."
    );
    assert.strictEqual(res.body.interviewId, "interview_99");
    assert.strictEqual(interviewsDb.length, 0);
    console.log("✓ TEST 7: Controller - Delete Interview (Success) passed");
  }

  // TEST 8: Controller - Delete Interview Record (Not Found)
  {
    const req = {
      user: { _id: "admin_123", role: "admin" },
      params: { id: "non_existent" },
    };
    const res = mockResponse();
    await deleteInterview(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Interview record not found.");
    console.log("✓ TEST 8: Controller - Delete Interview (Not Found) passed");
  }

  // TEST 9: Route - Verification
  {
    const usersRoute = adminRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/users"
    );
    assert.ok(usersRoute);
    const deleteUserRoute = adminRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/user/:id"
    );
    assert.ok(deleteUserRoute);
    assert.strictEqual(deleteUserRoute.route.methods.delete, true);

    const deleteInterviewRoute = adminRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/interview/:id"
    );
    assert.ok(deleteInterviewRoute);
    assert.strictEqual(deleteInterviewRoute.route.methods.delete, true);
    console.log("✓ TEST 9: Route - Verification passed");
  }

  console.log("\n--- All Admin Step 2 tests passed successfully! ---");
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
