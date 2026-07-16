const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configure the Gemini client using API key from env
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "DUMMY_KEY");

// Retrieve gemini-1.5-flash model configured for JSON responses
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

/**
 * Generates structured interview questions using Gemini AI.
 * @param {string} jobRole
 * @param {string} difficulty
 * @param {number} numberOfQuestions
 * @returns {Promise<Array>} List of generated question objects
 */
const generateInterviewQuestions = async (
  jobRole,
  difficulty,
  numberOfQuestions
) => {
  if (!apiKey || apiKey === "DUMMY_KEY") {
    // Return mock fallback questions if API key is not configured (e.g. in test envs)
    const mockQuestions = [];
    for (let i = 1; i <= numberOfQuestions; i++) {
      mockQuestions.push({
        id: i,
        text: `Mock question ${i} for a ${difficulty}-level ${jobRole} interview.`,
        type: i % 2 === 0 ? "technical" : "behavioral",
      });
    }
    return mockQuestions;
  }

  const prompt = `Generate exactly ${numberOfQuestions} interview questions for a ${difficulty}-level ${jobRole} position. 
Return a valid JSON array of objects. Each object must have these exact keys: "id" (an integer, starting from 1), "text" (the question text), and "type" (either "technical" or "behavioral").`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Defensively strip any Markdown formatting wrapper if generated
  let cleanText = responseText.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText
      .replace(/^```json\s*/i, "")
      .replace(/```$/, "")
      .trim();
  }

  return JSON.parse(cleanText);
};

module.exports = {
  generateInterviewQuestions,
};
