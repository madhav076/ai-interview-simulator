const fs = require("fs/promises");
const path = require("path");
const mammoth = require("mammoth");

const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const isSupportedResumeMimeType = (mimeType) => {
  return mimeType === PDF_MIME || mimeType === DOCX_MIME;
};

const getMimeTypeFromFileName = (fileName = "") => {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".pdf") return PDF_MIME;
  if (extension === ".docx") return DOCX_MIME;
  return "";
};

const normaliseText = (text) => {
  return String(text || "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/**
 * Extracts plain text from a PDF buffer safely across pdf-parse v1 and v2.
 */
const extractPdfText = async (buffer) => {
  const pdfParseModule = require("pdf-parse");

  // pdf-parse v1 (exported as function)
  if (typeof pdfParseModule === "function") {
    const data = await pdfParseModule(buffer);
    return data?.text || "";
  }

  // pdf-parse v2+ (exported as class PDFParse)
  if (pdfParseModule && typeof pdfParseModule.PDFParse === "function") {
    const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const parser = new pdfParseModule.PDFParse(uint8);
    try {
      const data = await parser.getText();
      return typeof data === "string" ? data : (data?.text || "");
    } finally {
      if (typeof parser.destroy === "function") {
        try { parser.destroy(); } catch (_) {}
      }
    }
  }

  if (typeof pdfParseModule?.default === "function") {
    const data = await pdfParseModule.default(buffer);
    return data?.text || "";
  }

  throw new Error("Unable to extract text from this resume.");
};

/**
 * Extracts text content from a resume file (PDF or DOCX).
 * Validates text length and throws clear HTTP-friendly errors if invalid or empty.
 */
const extractResumeText = async ({ filePath, fileName, mimeType }) => {
  const detectedMimeType = mimeType || getMimeTypeFromFileName(fileName || filePath);

  if (!isSupportedResumeMimeType(detectedMimeType)) {
    const error = new Error("Unsupported resume file type. Please upload a PDF or DOCX file.");
    error.statusCode = 400;
    throw error;
  }

  let buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch (err) {
    console.error(`[ResumeTextService] File read error for "${filePath}":`, err.message);
    const error = new Error("Resume file not found on server.");
    error.statusCode = 404;
    throw error;
  }

  let rawText = "";
  try {
    if (detectedMimeType === PDF_MIME) {
      rawText = await extractPdfText(buffer);
    } else {
      const parsed = await mammoth.extractRawText({ buffer });
      rawText = parsed?.value || "";
    }
  } catch (err) {
    console.error(`[ResumeTextService] Extraction error for "${fileName || filePath}":`, err.message);
    const error = new Error("Unable to extract text from this resume.");
    error.statusCode = 422;
    throw error;
  }

  const text = normaliseText(rawText);
  if (!text || text.length < 40) {
    console.warn(`[ResumeTextService] Resume text too short or empty (${text?.length || 0} chars) for "${fileName || filePath}"`);
    const error = new Error("Unable to extract text from this resume.");
    error.statusCode = 422;
    throw error;
  }

  // Cap at 30,000 characters to prevent excessive token payloads
  return text.slice(0, 30000);
};

module.exports = {
  DOCX_MIME,
  PDF_MIME,
  extractResumeText,
  extractPdfText,
  getMimeTypeFromFileName,
  isSupportedResumeMimeType,
  normaliseText,
};
