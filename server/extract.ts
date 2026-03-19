import mammoth from "mammoth";
import { createRequire } from "module";
import { extractTextWithOCR } from "./ocr";

const require = createRequire(import.meta.url);
const _pdfParseModule = require("pdf-parse");
const pdfParse = _pdfParseModule.default ?? _pdfParseModule;

/** Minimum character count before we consider text extraction a failure */
const MIN_TEXT_LENGTH = 50;

export interface ExtractionResult {
  text: string;
  length: number;
  source: "pdf-parse" | "ocr" | "docx";
}

/**
 * Custom error with user-friendly message and actionable suggestion.
 */
export class ExtractionError extends Error {
  constructor(public error: string, public suggestion: string) {
    super(error);
    this.name = "ExtractionError";
  }
}

/**
 * Normalize extracted text:
 * - Collapse runs of 3+ blank lines into two
 * - Collapse runs of spaces/tabs on a single line into one space
 * - Strip leading/trailing whitespace on each line
 * - Trim overall
 */
function cleanText(raw: string): string {
  return raw
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())  // collapse horizontal whitespace
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")                           // collapse excess blank lines
    .trim();
}

/**
 * Extract text from a PDF buffer.
 * Falls back to OCR if pdf-parse returns fewer than MIN_TEXT_LENGTH characters
 * or if pdf-parse throws (corrupted PDF).
 */
async function extractFromPDF(
  buffer: Buffer,
  filename: string
): Promise<ExtractionResult> {
  let rawText = "";
  let numpages = 0;

  console.log(`[extract] File type: PDF | filename: "${filename}"`);

  // ── Step 1: pdf-parse ──────────────────────────────────────────────────────
  try {
    console.log("[extract] Attempting pdf-parse...");
    const data = await pdfParse(buffer);
    rawText = data.text || "";
    numpages = data.numpages ?? 0;
    console.log(
      `[extract] pdf-parse result: ${numpages} page(s), ${rawText.length} raw chars`
    );
  } catch (parseErr: any) {
    console.error(
      `[extract] pdf-parse threw — PDF may be corrupted or encrypted: ${parseErr.message}`
    );
    // rawText stays empty; we'll attempt OCR below
  }

  const cleaned = cleanText(rawText);
  console.log(`[extract] Cleaned text length: ${cleaned.length} chars`);

  // ── Step 2: OCR fallback if text is too short ──────────────────────────────
  if (cleaned.length < MIN_TEXT_LENGTH) {
    console.log(
      `[extract] Extracted text too short (${cleaned.length} < ${MIN_TEXT_LENGTH} chars) — triggering OCR fallback`
    );
    let ocrRaw = "";
    let ocrErrorMsg = "";
    try {
      ocrRaw = await extractTextWithOCR(buffer);
    } catch (ocrErr: any) {
      // OCR threw a fatal error (e.g., Tesseract not installed)
      ocrErrorMsg = ocrErr.message || "Unknown OCR error";
      console.error(`[extract] OCR failed: ${ocrErrorMsg}`);
    }

    const ocrCleaned = cleanText(ocrRaw);
    console.log(`[extract] OCR result length: ${ocrCleaned.length} chars`);
    console.log(`[extract] OCR used: ${ocrCleaned.length > cleaned.length ? "YES" : "NO"}`);

    if (ocrCleaned.length > cleaned.length) {
      return { text: ocrCleaned, length: ocrCleaned.length, source: "ocr" };
    }

    // Both pdf-parse and OCR failed to extract meaningful text
    if (ocrErrorMsg) {
      throw new ExtractionError(
        `OCR processing failed: ${ocrErrorMsg}`,
        "This usually means the OCR engine is misconfigured. Please try a different file or contact support."
      );
    }

    // Both sources tried but returned minimal text
    return { text: cleaned, length: cleaned.length, source: "pdf-parse" };
  }

  console.log(`[extract] OCR used: NO`);
  return { text: cleaned, length: cleaned.length, source: "pdf-parse" };
}

/**
 * Extract text from a DOCX buffer using mammoth.
 */
async function extractFromDOCX(
  buffer: Buffer,
  filename: string
): Promise<ExtractionResult> {
  console.log(`[extract] File type: DOCX | filename: "${filename}"`);
  console.log("[extract] Parsing DOCX with mammoth...");

  const result = await mammoth.extractRawText({ buffer });

  if (result.messages?.length) {
    console.warn("[extract] mammoth warnings:", result.messages);
  }

  const cleaned = cleanText(result.value || "");
  console.log(`[extract] Cleaned text length: ${cleaned.length} chars`);

  return { text: cleaned, length: cleaned.length, source: "docx" };
}

/**
 * Main entry point.
 * Dispatches to the correct extractor based on MIME type.
 * Throws with a user-friendly message on unsupported types or empty results.
 */
export async function extractResumeText(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<ExtractionResult> {
  console.log(
    `[extract] ─── Starting extraction ─── "${filename}" | MIME: ${mimetype} | size: ${buffer.length} bytes`
  );

  let result: ExtractionResult;

  if (mimetype === "application/pdf") {
    result = await extractFromPDF(buffer, filename);
  } else if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    result = await extractFromDOCX(buffer, filename);
  } else {
    console.warn(`[extract] Unsupported MIME type: ${mimetype}`);
    throw new ExtractionError(
      "Unsupported file type. Only PDF and DOCX files are supported.",
      "Please upload a PDF or DOCX file (e.g., resume.pdf, resume.docx)."
    );
  }

  console.log(
    `[extract] ─── Extraction complete ─── source: ${result.source} | length: ${result.length} chars`
  );

  if (result.length === 0) {
    throw new ExtractionError(
      "No text could be extracted from the file.",
      "This may be a scanned image PDF. Try uploading a text-based PDF, a DOCX file, or paste the resume text manually."
    );
  }

  return result;
}
