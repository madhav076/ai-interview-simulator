const { GoogleGenAI } = require("@google/genai");

// Configure the Gemini client using API key from env
const apiKey = process.env.GEMINI_API_KEY;

// Check if Gemini API Key is configured
const hasValidKey = apiKey && apiKey !== "DUMMY_KEY" && apiKey !== "your_gemini_api_key_here";

const ai = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });

const MODEL_NAME = "gemini-3.5-flash";

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
  if (!hasValidKey) {
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

  const result = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });
  const responseText = result.text;

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

/**
 * Generates structured coding interview questions using Gemini AI.
 * @param {string} programmingLanguage
 * @param {string} difficulty
 * @param {number} numberOfQuestions
 * @returns {Promise<Array>} List of generated coding challenge objects
 */
const generateCodingQuestions = async (
  programmingLanguage,
  difficulty,
  numberOfQuestions
) => {
  if (!hasValidKey) {
    // Return mock fallback coding questions if API key is not configured
    const mockQuestions = [];
    for (let i = 1; i <= numberOfQuestions; i++) {
      mockQuestions.push({
        id: i,
        title: `Coding Challenge ${i}`,
        description: `Write a program in ${programmingLanguage} to solve mock challenge ${i} at ${difficulty} difficulty.`,
        difficulty: difficulty,
        codeTemplate: `// starter template for ${programmingLanguage}\n`,
        testCases: [{ input: "test_input", output: "test_output" }],
      });
    }
    return mockQuestions;
  }

  const prompt = `Generate exactly ${numberOfQuestions} coding challenges for a programming interview in ${programmingLanguage} at ${difficulty} difficulty. 
Return a valid JSON array of objects. Each object must have these exact keys:
- "id": unique integer starting from 1
- "title": string, a short title for the coding challenge
- "description": string, the problem description and requirements
- "difficulty": string, either "Easy", "Medium", or "Hard"
- "codeTemplate": string, boilerplate starter code/function signature for the user to write their solution in ${programmingLanguage}
- "testCases": array of objects, where each object has "input" (string) and "output" (string) keys showing sample test cases.`;

  const result = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });
  const responseText = result.text;

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
  generateCodingQuestions,
};
