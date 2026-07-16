const express = require("express");
const cors = require("cors");

const createApp = () => {
  const app = express();

  // CORS configuration for the frontend.
  const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
