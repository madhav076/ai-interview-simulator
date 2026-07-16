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

module.exports = {
  transcribeAudio,
};
