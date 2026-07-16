const assert = require("assert");

// Mock store for notifications
let dbStore = [
  {
    _id: "notif_777",
    userId: "user_123",
    title: "Old Alert",
    message: "This is a past event.",
    isRead: false,
    createdAt: new Date(Date.now() - 10000),
    save: async function () {
      return this;
    },
  },
];

// 1. Mock Notification Model
const mockNotification = {
  create: async function (data) {
    const record = {
      _id: "notif_999",
      createdAt: new Date(),
      isRead: false,
      ...data,
      save: async function () {
        return this;
      },
    };
    dbStore.push(record);
    return record;
  },
  find: (query) => {
    const list = dbStore.filter((n) => n.userId === query.userId);
    return {
      sort: (sortCriteria) => {
        // Mock sorting by newest first
        list.sort((a, b) => b.createdAt - a.createdAt);
        return {
          then: (resolve) => resolve(list),
        };
      },
    };
  },
  findOne: (query) => {
    const match = dbStore.find(
      (n) => n._id === query._id && n.userId === query.userId
    );
    return {
      then: (resolve) => resolve(match || null),
    };
  },
};

require.cache[require.resolve("../src/models/Notification")] = {
  exports: mockNotification,
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
const notificationRoutes = require("../src/routes/notificationRoutes");
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
} = require("../src/controllers/notificationController");

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
  console.log("--- Starting Notification Step 2 Unit Tests ---");

  // TEST 1: Controller - Create Success
  {
    const req = {
      user: { _id: "user_123" },
      body: {
        title: "Test Alert",
        message: "You have a new interview scheduled.",
      },
    };
    const res = mockResponse();
    await createNotification(req, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.message, "Notification created successfully.");
    assert.strictEqual(res.body.notification.title, "Test Alert");
    assert.strictEqual(dbStore.length, 2);
    console.log("✓ TEST 1: Controller - Create Success passed");
  }

  // TEST 2: Controller - Get User Notifications
  {
    const req = {
      user: { _id: "user_123" },
    };
    const res = mockResponse();
    await getUserNotifications(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.message,
      "Notifications fetched successfully."
    );
    assert.strictEqual(res.body.notifications.length, 2);
    // Newest first check
    assert.strictEqual(res.body.notifications[0].title, "Test Alert");
    assert.strictEqual(res.body.notifications[1].title, "Old Alert");
    console.log("✓ TEST 2: Controller - Get User Notifications passed");
  }

  // TEST 3: Controller - Mark As Read (Success)
  {
    const req = {
      user: { _id: "user_123" },
      params: { id: "notif_777" },
    };
    const res = mockResponse();
    await markNotificationAsRead(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(
      res.body.message,
      "Notification marked as read successfully."
    );
    assert.strictEqual(res.body.notificationId, "notif_777");

    // Assert actual object value updated
    const oldNotif = dbStore.find((n) => n._id === "notif_777");
    assert.strictEqual(oldNotif.isRead, true);
    console.log("✓ TEST 3: Controller - Mark As Read (Success) passed");
  }

  // TEST 4: Controller - Mark As Read (Not Found / Unauthorized)
  {
    const req = {
      user: { _id: "another_user" },
      params: { id: "notif_777" },
    };
    const res = mockResponse();
    await markNotificationAsRead(req, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.message, "Notification not found.");
    console.log(
      "✓ TEST 4: Controller - Mark As Read (Not Found/Unauthorized) passed"
    );
  }

  // TEST 5: Route - Verification
  {
    const getRoute = notificationRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/"
    );
    assert.ok(getRoute);
    assert.strictEqual(getRoute.route.methods.get, true);

    const createRoute = notificationRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/create"
    );
    assert.ok(createRoute);

    const readRoute = notificationRoutes.stack.find(
      (layer) => layer.route && layer.route.path === "/:id/read"
    );
    assert.ok(readRoute);
    assert.strictEqual(readRoute.route.methods.put, true);
    console.log("✓ TEST 5: Route - Verification passed");
  }

  console.log("\n--- All Notification Step 2 tests passed successfully! ---");
};

runTests().catch((err) => {
  console.error("Test failed: ", err);
  process.exit(1);
});
