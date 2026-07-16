const mongoose = require("mongoose");
const dns = require("dns");

// Force Google DNS instead of localhost DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI (or MONGO_URI) is missing from the environment variables",
    );
  }

  try {
    const connection = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB connected successfully: ${connection.connection.host}`,
    );
  } catch (error) {
  console.error("MongoDB connection failed:");
  console.error(error);
  throw error;
  }
};

module.exports = connectDB;
