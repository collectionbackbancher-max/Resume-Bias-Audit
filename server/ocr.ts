import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { createRequire } from "module";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const tesseract = require("node-tesseract-ocr");

/**
 * Converts PDF bytes to PNG images (one per page) using pdftoppm,
 * then runs Tesseract OCR on each page image.
 * Returns the combined extracted text.
 */
export async function extractTextWithOCR(pdfBytes: Buffer): Promise<string> {
  console.log("[ocr] OCR fallback triggered");

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bias-ocr-"));
  const pdfPath = path.join(tmpDir, "input.pdf");
  const imgPrefix = path.join(tmpDir, "page");

  try {
    fs.writeFileSync(pdfPath, pdfBytes);
    console.log(`[ocr] PDF written to temp path: ${pdfPath}`);

    // Convert PDF pages to PNG images using pdftoppm (from poppler)
    // Output files will be: page-1.png, page-2.png, etc.
    await execFileAsync("pdftoppm", ["-png", "-r", "150", pdfPath, imgPrefix]);

    // Collect all generated page images in sorted order
    const pageImages = fs
      .readdirSync(tmpDir)
      .filter((f) => f.startsWith("page") && f.endsWith(".png"))
      .sort()
      .map((f) => path.join(tmpDir, f));

    console.log(`[ocr] ${pageImages.length} page image(s) ready for OCR`);

    if (pageImages.length === 0) {
      console.warn("[ocr] No page images were generated from the PDF");
      return "";
    }

    // Run Tesseract OCR on each page image
    const tesseractConfig = {
      lang: "eng",
      oem: 1,  // LSTM neural net engine
      psm: 3,  // Fully automatic page segmentation
    };

    const pageTexts: string[] = [];
    for (let i = 0; i < pageImages.length; i++) {
      const imgPath = pageImages[i];
      console.log(`[ocr] Running OCR on page ${i + 1}/${pageImages.length}`);
      try {
        const pageText = await tesseract.recognize(imgPath, tesseractConfig);
        const cleaned = (pageText || "").trim();
        if (cleaned.length > 0) {
          pageTexts.push(cleaned);
        } else {
          console.warn(`[ocr] Page ${i + 1} returned empty text — may be blank or decorative`);
        }
      } catch (pageErr) {
        console.error(`[ocr] Tesseract failed on page ${i + 1}:`, pageErr);
      }
    }

    const combined = pageTexts.join("\n\n");
    console.log(
      `[ocr] OCR complete: ${combined.length} total characters from ${pageTexts.length}/${pageImages.length} page(s)`
    );
    return combined;
  } catch (err) {
    console.error("[ocr] OCR pipeline error:", err);
    return "";
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log("[ocr] Temp files cleaned up");
    } catch (cleanupErr) {
      console.warn("[ocr] Temp cleanup failed:", cleanupErr);
    }
  }
}
