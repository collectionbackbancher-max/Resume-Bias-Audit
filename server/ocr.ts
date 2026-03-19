import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { createRequire } from "module";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const tesseract = require("node-tesseract-ocr");

// ── Dependency map (Node.js equivalents of common Python OCR stack) ───────────
//
//  Python (requested)   │  Node.js (installed)       │  Purpose
//  ─────────────────────┼────────────────────────────┼──────────────────────────
//  pdfplumber           │  pdf-parse (npm)            │  PDF text extraction
//  python-docx          │  mammoth (npm)              │  DOCX text extraction
//  pdf2image            │  pdftoppm (system/poppler)  │  PDF → PNG per page
//  pytesseract          │  node-tesseract-ocr (npm)   │  Tesseract OCR bindings
//  Pillow               │  not needed                 │  Images handled natively
//  Tesseract engine     │  tesseract (nix system pkg) │  OCR engine binary
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies that the Tesseract OCR binary is reachable in PATH.
 * Called once at module load time.
 */
async function assertTesseractInstalled(): Promise<void> {
  try {
    await execFileAsync("tesseract", ["--version"]);
  } catch {
    const msg =
      "OCR engine not installed. Please install Tesseract. " +
      "(Run: nix-env -iA nixpkgs.tesseract  or  apt-get install tesseract-ocr)";
    console.error(`[ocr] FATAL — ${msg}`);
    throw new Error(msg);
  }
}

/**
 * Verifies that pdftoppm (poppler) is reachable in PATH.
 */
async function assertPdftoppmInstalled(): Promise<void> {
  try {
    await execFileAsync("pdftoppm", ["-v"]);
  } catch {
    const msg =
      "PDF-to-image converter not installed. Please install poppler-utils. " +
      "(Run: nix-env -iA nixpkgs.poppler  or  apt-get install poppler-utils)";
    console.error(`[ocr] FATAL — ${msg}`);
    throw new Error(msg);
  }
}

/**
 * Converts PDF bytes to PNG images (one per page) using pdftoppm,
 * then runs Tesseract OCR on each page image and returns combined text.
 *
 * Throws with a user-friendly message if required binaries are missing.
 */
export async function extractTextWithOCR(pdfBytes: Buffer): Promise<string> {
  console.log("[ocr] OCR fallback triggered");

  // ── Pre-flight: confirm system binaries are available ─────────────────────
  await assertTesseractInstalled();
  await assertPdftoppmInstalled();

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bias-ocr-"));
  const pdfPath = path.join(tmpDir, "input.pdf");
  const imgPrefix = path.join(tmpDir, "page");

  try {
    fs.writeFileSync(pdfPath, pdfBytes);
    console.log(`[ocr] PDF written to temp: ${pdfPath}`);

    // Convert all PDF pages to PNG at 150 DPI (good balance of speed vs accuracy)
    await execFileAsync("pdftoppm", ["-png", "-r", "150", pdfPath, imgPrefix]);

    // Collect generated images in page order
    const pageImages = fs
      .readdirSync(tmpDir)
      .filter((f) => f.startsWith("page") && f.endsWith(".png"))
      .sort()
      .map((f) => path.join(tmpDir, f));

    console.log(`[ocr] ${pageImages.length} page image(s) ready for Tesseract`);

    if (pageImages.length === 0) {
      console.warn("[ocr] pdftoppm produced no images — PDF may be empty or malformed");
      return "";
    }

    // Run Tesseract on each page
    const tesseractConfig = {
      lang: "eng",
      oem: 1,  // LSTM neural net engine
      psm: 3,  // Fully automatic page segmentation (best for mixed layouts)
    };

    const pageTexts: string[] = [];
    for (let i = 0; i < pageImages.length; i++) {
      console.log(`[ocr] Running Tesseract on page ${i + 1}/${pageImages.length}`);
      try {
        const raw = await tesseract.recognize(pageImages[i], tesseractConfig);
        const cleaned = (raw || "").trim();
        if (cleaned.length > 0) {
          pageTexts.push(cleaned);
        } else {
          console.warn(`[ocr] Page ${i + 1} returned empty text — blank or decorative page`);
        }
      } catch (pageErr: any) {
        // Surface tesseract not found error clearly
        if (pageErr?.message?.toLowerCase().includes("tesseract")) {
          throw new Error("OCR engine not installed. Please install Tesseract.");
        }
        console.error(`[ocr] Tesseract error on page ${i + 1}:`, pageErr);
      }
    }

    const combined = pageTexts.join("\n\n");
    console.log(
      `[ocr] OCR complete — ${combined.length} chars from ${pageTexts.length}/${pageImages.length} page(s)`
    );
    return combined;
  } finally {
    // Always clean up temp files
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log("[ocr] Temp files cleaned up");
    } catch (e) {
      console.warn("[ocr] Temp cleanup failed:", e);
    }
  }
}
