const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey });
  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate a JSON object with a key 'greeting' containing 'hello'.",
      config: {
        responseMimeType: "application/json"
      }
    });
    console.log("Success! JSON response:", result.text);
    console.log("Parsed JSON:", JSON.parse(result.text));
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

run();
