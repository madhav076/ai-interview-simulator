const dotenv = require("dotenv");
dotenv.config();

async function listModels(apiVersion) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`;
  console.log(`Fetching models for version ${apiVersion}...`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      console.error(`Error for ${apiVersion}:`, data.error);
    } else {
      console.log(`Supported models for ${apiVersion}:`, data.models.map(m => m.name));
    }
  } catch (err) {
    console.error(`Fetch failed for ${apiVersion}:`, err);
  }
}

async function run() {
  await listModels("v1beta");
  await listModels("v1");
}

run();
