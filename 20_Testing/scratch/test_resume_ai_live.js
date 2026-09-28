require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs/promises");
const path = require("path");

async function extractPdfText(buffer) {
  const pdfParseModule = require("pdf-parse");
  if (typeof pdfParseModule === "function") {
    const data = await pdfParseModule(buffer);
    return data.text || "";
  } else if (pdfParseModule && typeof pdfParseModule.PDFParse === "function") {
    const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const parser = new pdfParseModule.PDFParse(uint8);
    const data = await parser.getText();
    if (typeof parser.destroy === "function") {
      try { parser.destroy(); } catch (_) {}
    }
    return typeof data === "string" ? data : (data?.text || "");
  }
  throw new Error("Unable to extract text from this resume.");
}

async function run() {
  const filePath = path.join(__dirname, "../uploads/resumes/resume-1783864703505-177414375.pdf");
  const buffer = await fs.readFile(filePath);
  const resumeText = await extractPdfText(buffer);
  const targetJobRole = "Frontend Developer";

  console.log("Extracted Resume Text (first 200 chars):\n", resumeText.slice(0, 200));

  const { analyzeResumeContent } = require("../src/services/aiService");
  try {
    const parsed = await analyzeResumeContent({ resumeText, targetJobRole });
    console.log("\nSuccess! Parsed Analysis:", JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.error("AI Error:", e.message);
  }
}

run();
