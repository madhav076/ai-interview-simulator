const assert = require("assert");
const http = require("http");

// Load dotenv so that process.env values are populated.
require("dotenv").config({ quiet: true });

// Import the app factory (no database or server startup involved).
const createApp = require("../server.app");

const runTests = async () => {
  console.log("--- Health Check API Tests ---\n");

  const app = createApp();

  // Start a temporary server on a random port.
  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // Test 1: GET /api/health returns 200 and the expected JSON body.
      await new Promise((resolve, reject) => {
        http.get(`${baseUrl}/api/health`, (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            try {
              assert.strictEqual(res.statusCode, 200);
              const body = JSON.parse(data);
              assert.deepStrictEqual(body, { status: "Server is running" });
              console.log("  PASS: GET /api/health returns correct response.");
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        });
      });

      // Test 2: Verify CORS headers are present in a preflight response.
      await new Promise((resolve, reject) => {
        const options = {
          hostname: "127.0.0.1",
          port,
          path: "/api/health",
          method: "OPTIONS",
          headers: {
            Origin: "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
          },
        };
        const req = http.request(options, (res) => {
          try {
            const allowOrigin = res.headers["access-control-allow-origin"];
            assert.ok(allowOrigin, "CORS header should be present");
            console.log("  PASS: CORS headers are present in response.");
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        req.end();
      });

      console.log("\nAll health check tests passed!\n");
    } catch (error) {
      console.error(`\n  FAIL: ${error.message}\n`);
      process.exit(1);
    } finally {
      server.close();
    }
  });
};

runTests();
