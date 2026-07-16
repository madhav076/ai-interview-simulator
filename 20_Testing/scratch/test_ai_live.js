require("dotenv").config();
const { generateInterviewQuestions, generateCodingQuestions } = require("../src/services/aiService");

async function run() {
  console.log("--- Testing AI Generation with Live Gemini API ---");
  
  // Test Interview Question Generation
  try {
    console.log("\n1. Testing AI Interview generation...");
    const questions = await generateInterviewQuestions("Node.js Developer", "Medium", 3);
    console.log("Success! Questions received:", JSON.stringify(questions, null, 2));
    if (questions.length === 3 && questions[0].text && !questions[0].text.includes("Mock")) {
      console.log("✓ Live AI Interview generation returned real responses successfully.");
    } else {
      console.error("✗ Live AI Interview generation returned unexpected output.");
    }
  } catch (err) {
    console.error("✗ Live AI Interview generation failed:", err);
  }

  // Test Coding Question Generation
  try {
    console.log("\n2. Testing Coding Interview generation...");
    const challenges = await generateCodingQuestions("JavaScript", "Easy", 1);
    console.log("Success! Coding challenges received:", JSON.stringify(challenges, null, 2));
    if (challenges.length === 1 && challenges[0].title && !challenges[0].title.includes("Mock")) {
      console.log("✓ Live Coding Interview generation returned real responses successfully.");
    } else {
      console.error("✗ Live Coding Interview generation returned unexpected output.");
    }
  } catch (err) {
    console.error("✗ Live Coding Interview generation failed:", err);
  }
}

run();
