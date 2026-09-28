const fs = require("fs/promises");
const path = require("path");
const mammoth = require("mammoth");

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
  } else if (typeof pdfParseModule?.default === "function") {
    const data = await pdfParseModule.default(buffer);
    return data.text || "";
  }
  throw new Error("Unable to extract text from this resume.");
}

async function testPdf() {
  const filePath = path.join(__dirname, "../uploads/resumes/resume-1783864703505-177414375.pdf");
  console.log("Reading PDF from:", filePath);
  const buffer = await fs.readFile(filePath);
  const text = await extractPdfText(buffer);
  console.log("PDF extracted text length:", text.length);
  console.log("PDF text preview:\n", text.slice(0, 300));
}

testPdf().catch(console.error);
