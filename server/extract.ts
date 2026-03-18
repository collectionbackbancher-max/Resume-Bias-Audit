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
    try {
      ocrRaw = await extractTextWithOCR(buffer);
    } catch (ocrErr: any) {
      console.error(`[extract] OCR pipeline error: ${ocrErr.message}`);
    }

    const ocrCleaned = cleanText(ocrRaw);
    console.log(`[extract] OCR result length: ${ocrCleaned.length} chars`);
    console.log(`[extract] OCR used: ${ocrCleaned.length > cleaned.length ? "YES" : "NO (pdf-parse was better)"}`);

    if (ocrCleaned.length > cleaned.length) {
      return { text: ocrCleaned, length: ocrCleaned.length, source: "ocr" };
    }

    // Both sources failed — return whatever we have (may be empty)
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
    throw new Error(
      "Unsupported file type. Please upload a PDF or DOCX file."
    );
  }

  console.log(
    `[extract] ─── Extraction complete ─── source: ${result.source} | length: ${result.length} chars`
  );

  if (result.length === 0) {
    throw new Error(
      "No text found. This may be a scanned (image-based) PDF. " +
        "Please use a text-based PDF or paste the resume text manually."
    );
  }

  return result;
}
