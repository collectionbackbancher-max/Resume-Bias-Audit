import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

/** Simple in-memory cache to avoid re-calling OpenAI for the same raw text */
const cleanTextCache = new Map<string, string>();

export interface ResumeSections {
  name: string;
  summary: string;
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  other: string[];
}

/**
 * STEP 1: Clean OCR-extracted resume text using OpenAI.
 * Fixes broken words, removes noise, normalises formatting.
 * Only called when the extraction source was OCR.
 */
export async function cleanOCRText(rawText: string): Promise<string> {
  const cacheKey = rawText.slice(0, 200);
  if (cleanTextCache.has(cacheKey)) {
    console.log("[nlp] cleanOCRText: cache hit");
    return cleanTextCache.get(cacheKey)!;
  }

  console.log("[nlp] cleanOCRText: calling OpenAI…");
  const t0 = Date.now();

  try {
    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a resume text cleaning assistant. Clean and normalize resume text extracted via OCR. Fix broken words and spacing issues, remove noise like page headers/numbers/random symbols, preserve all meaningful resume content, and keep the professional structure. Return ONLY the cleaned text — no commentary.",
          },
          {
            role: "user",
            content: `Clean and normalize this resume text extracted via OCR. Fix broken words, remove noise, and preserve meaningful content:\n\n${rawText}`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("cleanOCRText timeout")), 30_000)
      ),
    ]);

    const cleaned = (response as any).choices[0]?.message?.content?.trim() || rawText;
    console.log(`[nlp] cleanOCRText done in ${Date.now() - t0}ms — ${rawText.length} → ${cleaned.length} chars`);
    cleanTextCache.set(cacheKey, cleaned);
    return cleaned;
  } catch (err: any) {
    console.error("[nlp] cleanOCRText failed:", err.message);
    return rawText; // graceful fallback
  }
}

/**
 * STEP 2: Parse the cleaned resume text into structured sections.
 * Uses OpenAI to reliably detect headings and group content.
 */
export async function parseResumeSections(cleanText: string): Promise<ResumeSections> {
  console.log("[nlp] parseResumeSections: calling OpenAI…");
  const t0 = Date.now();

  const empty: ResumeSections = {
    name: "",
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    other: [],
  };

  try {
    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a resume parser. Extract the following sections from the resume text and return valid JSON.
Return this exact shape:
{
  "name": "Candidate's full name (string)",
  "summary": "Objective or summary paragraph (string, empty if absent)",
  "skills": ["list", "of", "skills"],
  "experience": ["Each job as a single string: 'Title at Company (Dates): bullet1; bullet2'"],
  "education": ["Each degree as a single string: 'Degree, School (Year)'"],
  "projects": ["Each project as a single string"],
  "other": ["Any remaining content as strings"]
}
Return ONLY the JSON object. No markdown, no explanation.`,
          },
          {
            role: "user",
            content: cleanText,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 3000,
        temperature: 0.1,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("parseResumeSections timeout")), 30_000)
      ),
    ]);

    const content = (response as any).choices[0]?.message?.content;
    if (!content) return empty;

    const parsed = JSON.parse(content);
    console.log(`[nlp] parseResumeSections done in ${Date.now() - t0}ms`);
    return {
      name: parsed.name || "",
      summary: parsed.summary || "",
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      other: Array.isArray(parsed.other) ? parsed.other : [],
    };
  } catch (err: any) {
    console.error("[nlp] parseResumeSections failed:", err.message);
    return empty;
  }
}
