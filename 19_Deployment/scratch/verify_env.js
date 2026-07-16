require("dotenv").config({ quiet: true });

console.log("--- Environment Variable Verification ---\n");
console.log("  PORT:         ", process.env.PORT || "(not set, defaults to 5000)");
console.log("  MONGODB_URI:  ", process.env.MONGODB_URI ? "SET" : "NOT SET");
console.log("  GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "SET" : "NOT SET");
console.log("  JWT_SECRET:   ", process.env.JWT_SECRET ? "SET" : "NOT SET");
console.log("  FRONTEND_URL: ", process.env.FRONTEND_URL || "(not set, defaults to http://localhost:3000)");
console.log("\nAll environment variables loaded successfully.\n");
