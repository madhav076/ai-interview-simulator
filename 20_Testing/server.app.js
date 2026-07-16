const express = require("express");
const cors = require("cors");

const createApp = () => {
  const app = express();

  // CORS configuration for the frontend.
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ].filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || 
                        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  app.use(cors(corsOptions));

  app.use(express.json());

  // Health check endpoint.
  app.get("/api/health", (req, res) => {
    res.json({ status: "Server is running" });
  });

  return app;
};

module.exports = createApp;
