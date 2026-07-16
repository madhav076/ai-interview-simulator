const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configure the Gemini client using API key from env
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "DUMMY_KEY");

// Retrieve gemini-1.5-flash model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Transcribes audio file buffer using Gemini AI.
 * @param {Buffer} buffer Audio file buffer
 * @param {string} mimeType Audio file mimeType
 * @returns {Promise<string>} Transcribed text
 */
const transcribeAudio = async (buffer, mimeType) => {
  if (!apiKey || apiKey === "DUMMY_KEY") {
    // Return mock fallback transcription if API key is not configured
    return "This is a mock transcription of the uploaded audio file.";
  }

  const result = await model.generateContent([
    {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: mimeType,
      },
    },
    "Please transcribe this audio recording into plain text. Return ONLY the transcribed text.",
  ]);

  return result.response.text().trim();
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
  if (!apiKey || apiKey === "DUMMY_KEY") {
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

  const jsonModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Generate exactly ${numberOfQuestions} coding challenges for a programming interview in ${programmingLanguage} at ${difficulty} difficulty. 
Return a valid JSON array of objects. Each object must have these exact keys:
- "id": unique integer starting from 1
- "title": string, a short title for the coding challenge
- "description": string, the problem description and requirements
- "difficulty": string, either "Easy", "Medium", or "Hard"
- "codeTemplate": string, boilerplate starter code/function signature for the user to write their solution in ${programmingLanguage}
- "testCases": array of objects, where each object has "input" (string) and "output" (string) keys showing sample test cases.`;

  const result = await jsonModel.generateContent(prompt);
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
  transcribeAudio,
  generateCodingQuestions,
};
