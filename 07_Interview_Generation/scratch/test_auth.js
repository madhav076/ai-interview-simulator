const assert = require("assert");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. Mock User model before requiring controllers and middleware
const dbStore = [];
const mockUser = {
  findOne: async (query) => {
    return dbStore.find(u => u.email === query.email) || null;
  },
  create: async (data) => {
    const newUser = {
      _id: "mock_id_" + Math.random().toString(36).substr(2, 9),
      ...data,
      role: "user"
    };
    dbStore.push(newUser);
    return newUser;
  },
  findById: (id) => {
    const user = dbStore.find(u => u._id === id);
    const query = {
      then: (resolve) => {
        if (!user) return resolve(null);
        const { password, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      },
      select: (fields) => {
        return {
          then: (resolve) => {
            if (!user) return resolve(null);
            const { password, ...userWithoutPassword } = user;
            resolve(userWithoutPassword);
          }
        };
      }
    };
    return query;
  }
};

// Override the require cache for User model
require.cache[require.resolve("../src/models/User")] = {
  exports: mockUser
};

// 2. Set up environment variables
process.env.JWT_SECRET = "test_jwt_secret_key";

// 3. Require the modules to test
const { registerUser, loginUser, getProfile } = require("../src/controllers/authController");
const authMiddleware = require("../src/middleware/authMiddleware");

// Helper to create mock response object
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

// Test Suite
const runTests = async () => {
  console.log("--- Starting Authentication Unit Tests ---");

  // TEST 1: Register User - Missing Fields
  {
    const req = { body: { name: "", email: "test@example.com", password: "password" } };
    const res = mockResponse();
    await registerUser(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, "Name, email, and password are required.");
    console.log("✓ TEST 1: Register User - Missing Fields passed");
  }

  // TEST 2: Register User - Success
  {
    const req = { body: { name: "John Doe", email: "john@example.com", password: "Password123" } };
    const res = mockResponse();
    await registerUser(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.message, "User registered successfully.");
    assert.strictEqual(res.body.user.name, "John Doe");
    assert.strictEqual(res.body.user.email, "john@example.com");
    assert.strictEqual(res.body.user.role, "user");
    assert.ok(res.body.user.id);
    console.log("✓ TEST 2: Register User - Success passed");
  }

  // TEST 3: Register User - Existing Email
  {
    const req = { body: { name: "John Another", email: "john@example.com", password: "Password123" } };
    const res = mockResponse();
    await registerUser(req, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.body.message, "A user with this email already exists.");
    console.log("✓ TEST 3: Register User - Existing Email passed");
  }

  // TEST 4: Login User - Missing Fields
  {
    const req = { body: { email: "", password: "password" } };
    const res = mockResponse();
    await loginUser(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, "Email and password are required.");
    console.log("✓ TEST 4: Login User - Missing Fields passed");
  }

  // TEST 5: Login User - Invalid Email
  {
    const req = { body: { email: "nonexistent@example.com", password: "Password123" } };
    const res = mockResponse();
    await loginUser(req, res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Invalid email or password.");
    console.log("✓ TEST 5: Login User - Invalid Email passed");
  }

  // TEST 6: Login User - Invalid Password
  {
    const req = { body: { email: "john@example.com", password: "WrongPassword" } };
    const res = mockResponse();
    await loginUser(req, res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Invalid email or password.");
    console.log("✓ TEST 6: Login User - Invalid Password passed");
  }

  // TEST 7: Login User - Success
  let token;
  let userDetails;
  {
    const req = { body: { email: "john@example.com", password: "Password123" } };
    const res = mockResponse();
    await loginUser(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.message, "Login successful.");
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, "john@example.com");
    token = res.body.token;
    userDetails = res.body.user;
    console.log("✓ TEST 7: Login User - Success passed");
  }

  // TEST 8: Middleware - Missing Token
  {
    const req = { headers: {} };
    const res = mockResponse();
    let nextCalled = false;
    await authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Authorization token is required.");
    assert.strictEqual(nextCalled, false);
    console.log("✓ TEST 8: Middleware - Missing Token passed");
  }

  // TEST 9: Middleware - Invalid Token
  {
    const req = { headers: { authorization: "Bearer invalid_token_here" } };
    const res = mockResponse();
    let nextCalled = false;
    await authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Invalid or expired token.");
    assert.strictEqual(nextCalled, false);
    console.log("✓ TEST 9: Middleware - Invalid Token passed");
  }

  // TEST 10: Middleware - Success & Profile Fetch
  {
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockResponse();
    let nextCalled = false;
    await authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.ok(req.user);
    assert.strictEqual(req.user.email, "john@example.com");

    // Profile route controller test
    const profileRes = mockResponse();
    await getProfile(req, profileRes);
    assert.strictEqual(profileRes.statusCode, 200);
    assert.strictEqual(profileRes.body.message, "Profile fetched successfully.");
    assert.strictEqual(profileRes.body.user.email, "john@example.com");

    console.log("✓ TEST 10: Middleware & Profile - Success passed");
  }

  console.log("\n--- All 10 tests passed successfully! ---");
};

runTests().catch(err => {
  console.error("Test failed: ", err);
  process.exit(1);
});
