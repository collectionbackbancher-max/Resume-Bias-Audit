import type { ResumeSections } from "./nlp_pipeline";

// ── Keyword dictionaries ─────────────────────────────────────────────────────

const MASCULINE_CODED = [
  "aggressive", "dominant", "dominance", "competitive", "fearless", "driven",
  "rockstar", "ninja", "guru", "wizard", "expert", "warrior", "champion",
  "assertive", "decisive", "independent", "ambitious", "bold", "strong",
  "determined", "analytical", "confident", "outspoken", "forceful", "headstrong",
];

const FEMININE_CODED = [
  "supportive", "nurturing", "empathetic", "collaborative", "compassionate",
  "community", "interpersonal", "committed", "together", "shared", "sensitive",
  "humble", "flexible", "cooperative", "responsive", "considerate",
];

const AGE_PROXIES = [
  "young", "energetic", "recent graduate", "digital native", "highly mobile",
  "fresh", "new grad", "entry level", "dynamic", "fast-paced environment",
  "class of", "graduated in", "sophomore", "junior candidate",
];

const GRAD_YEAR_REGEX = /\b(19[6-9]\d|20[0-2]\d)\b/g;

/** Words that reduce risk when found near a flagged word (de-risking context) */
const NEUTRAL_CONTEXT = [
  "growth", "market", "revenue", "sales", "environment", "strategy",
  "results", "performance", "goals", "metrics", "targets",
];

/** High-weight sections where bias is more impactful */
const HIGH_WEIGHT_SECTIONS: (keyof ResumeSections)[] = ["experience", "summary"];
const LOW_WEIGHT_SECTIONS: (keyof ResumeSections)[] = ["skills", "other"];

// ── Types ────────────────────────────────────────────────────────────────────

export interface BiasFlag {
  phrase: string;
  category: "gender" | "age" | "language";
  context: string;
  severity: "Low" | "Moderate" | "High";
  description: string;
  suggestion: string;
  section: string;
}

export interface BiasResult {
  score: number;
  riskLevel: "Low" | "Moderate" | "High";
  flags: BiasFlag[];
  explanation: string;
  scores: {
    language: number;
    age: number;
    name: number;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extract ~8 words of context around a match position */
function extractContext(text: string, index: number, phrase: string): string {
  const words = text.split(/\s+/);
  let charCount = 0;
  let wordIdx = 0;
  for (let i = 0; i < words.length; i++) {
    if (charCount >= index) { wordIdx = i; break; }
    charCount += words[i].length + 1;
  }
  const start = Math.max(0, wordIdx - 4);
  const end = Math.min(words.length, wordIdx + 5);
  return words.slice(start, end).join(" ").trim();
}

/** Check if a flagged phrase is surrounded by neutral/de-risking words */
function hasNeutralContext(context: string): boolean {
  const lower = context.toLowerCase();
  return NEUTRAL_CONTEXT.some(w => lower.includes(w));
}

/** Count occurrences of a word/phrase in text */
function countOccurrences(text: string, phrase: string): number {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(escaped, "gi")) || []).length;
}

/** Determine severity based on frequency and section weight */
function calcSeverity(
  occurrences: number,
  section: string,
  neutralCtx: boolean
): "Low" | "Moderate" | "High" {
  if (neutralCtx) return "Low";
  const highWeight = HIGH_WEIGHT_SECTIONS.includes(section as keyof ResumeSections);
  const lowWeight = LOW_WEIGHT_SECTIONS.includes(section as keyof ResumeSections);
  if (occurrences >= 3 && highWeight) return "High";
  if (occurrences >= 2 || highWeight) return "Moderate";
  if (lowWeight) return "Low";
  return "Low";
}

// ── Section-aware scan ───────────────────────────────────────────────────────

interface SectionText {
  section: string;
  text: string;
  weight: number; // 1.0 = high, 0.5 = low
}

/** Flatten resume sections into weighted text blocks for scanning */
function buildSectionBlocks(
  rawText: string,
  sections?: ResumeSections | null
): SectionText[] {
  if (!sections) {
    return [{ section: "resume", text: rawText, weight: 1.0 }];
  }

  const blocks: SectionText[] = [];

  if (sections.summary) {
    blocks.push({ section: "summary", text: sections.summary, weight: 1.0 });
  }
  if (sections.experience.length > 0) {
    blocks.push({ section: "experience", text: sections.experience.join("\n"), weight: 1.0 });
  }
  if (sections.education.length > 0) {
    blocks.push({ section: "education", text: sections.education.join("\n"), weight: 0.7 });
  }
  if (sections.skills.length > 0) {
    blocks.push({ section: "skills", text: sections.skills.join(", "), weight: 0.5 });
  }
  if (sections.projects.length > 0) {
    blocks.push({ section: "projects", text: sections.projects.join("\n"), weight: 0.6 });
  }
  if (sections.other.length > 0) {
    blocks.push({ section: "other", text: sections.other.join("\n"), weight: 0.4 });
  }

  if (blocks.length === 0) {
    blocks.push({ section: "resume", text: rawText, weight: 1.0 });
  }

  return blocks;
}

// ── Core scan function ───────────────────────────────────────────────────────

function scanSection(
  block: SectionText,
  keywords: string[],
  category: "gender" | "age" | "language",
  getDescription: (phrase: string, ctx: string) => string,
  getSuggestion: (phrase: string) => string
): BiasFlag[] {
  const flags: BiasFlag[] = [];
  const seenPhrases = new Set<string>();
  const lower = block.text.toLowerCase();

  for (const phrase of keywords) {
    if (!lower.includes(phrase.toLowerCase())) continue;

    const phraseKey = `${block.section}:${phrase}`;
    if (seenPhrases.has(phraseKey)) continue;
    seenPhrases.add(phraseKey);

    const idx = lower.indexOf(phrase.toLowerCase());
    const context = extractContext(block.text, idx, phrase);
    const neutral = hasNeutralContext(context);
    const count = countOccurrences(lower, phrase.toLowerCase());
    const severity = calcSeverity(count, block.section, neutral);

    flags.push({
      phrase,
      category,
      context: `"…${context}…"`,
      severity,
      description: getDescription(phrase, context),
      suggestion: getSuggestion(phrase),
      section: block.section,
    });
  }

  return flags;
}

// ── Intersection signals ─────────────────────────────────────────────────────

function checkIntersectionSignals(flags: BiasFlag[]): BiasFlag[] {
  const extra: BiasFlag[] = [];
  const hasAge = flags.some(f => f.category === "age");
  const hasGender = flags.some(f => f.category === "gender");
  const hasLeadership = flags.some(f =>
    ["leader", "dominant", "assertive", "aggressive"].includes(f.phrase)
  );

  if (hasAge && hasLeadership) {
    extra.push({
      phrase: "age + leadership",
      category: "language",
      context: "Combined age proxy and leadership language detected",
      severity: "High",
      description:
        'Combining age signals with leadership language (e.g., "aggressive leader", "recent graduate who dominates") amplifies bias risk significantly.',
      suggestion:
        'Rewrite to focus on measurable outcomes and skills. Avoid connecting seniority with age-related terms.',
      section: "resume",
    });
  }

  if (hasGender && hasAge) {
    extra.push({
      phrase: "gender + age signals",
      category: "language",
      context: "Gender-coded and age-related language co-occur",
      severity: "Moderate",
      description:
        "The resume contains both gender-coded language and age proxies, which together create an elevated bias risk profile.",
      suggestion:
        "Review the resume holistically. Replace coded language with skill-based, outcome-focused descriptions.",
      section: "resume",
    });
  }

  return extra;
}

// ── Main exported function ───────────────────────────────────────────────────

export function analyzeBias(
  text: string,
  sections?: ResumeSections | null
): BiasResult {
  const blocks = buildSectionBlocks(text, sections);
  const allFlags: BiasFlag[] = [];

  // Track risk per dimension, weighted by section
  let languageRiskSum = 0;
  let ageRiskSum = 0;
  let totalWeight = 0;

  for (const block of blocks) {
    // ── Masculine-coded language ─────────────────────────────────────────────
    const mascFlags = scanSection(
      block,
      MASCULINE_CODED,
      "gender",
      (phrase, ctx) =>
        `Masculine-coded word "${phrase}" detected in ${block.section}. This language may unconsciously filter out candidates who don't identify with it.`,
      (phrase) =>
        `Replace "${phrase}" with outcome-focused alternatives. E.g., instead of "aggressive", use "results-driven" or "proactive".`
    );

    // ── Feminine-coded language ──────────────────────────────────────────────
    const femFlags = scanSection(
      block,
      FEMININE_CODED,
      "gender",
      (phrase, ctx) =>
        `Feminine-coded word "${phrase}" detected in ${block.section}. While not always biased, it may attract a narrower applicant pool.`,
      (phrase) =>
        `Consider balancing "${phrase}" with skill-based language to appeal to all candidates.`
    );

    // ── Age proxies ──────────────────────────────────────────────────────────
    const ageFlags = scanSection(
      block,
      AGE_PROXIES,
      "age",
      (phrase, ctx) =>
        `Age-related proxy "${phrase}" detected in ${block.section}. This may discourage older or non-traditional candidates.`,
      (phrase) =>
        `Remove "${phrase}" or replace with a skills-based description that doesn't imply a preferred age range.`
    );

    const sectionFlags = [...mascFlags, ...femFlags, ...ageFlags];
    allFlags.push(...sectionFlags);

    // ── Accumulate weighted risk ─────────────────────────────────────────────
    const langCount = [...mascFlags, ...femFlags].length;
    const ageCount = ageFlags.length;

    languageRiskSum += langCount * block.weight * 10;
    ageRiskSum += ageCount * block.weight * 15;
    totalWeight += block.weight;
  }

  // ── Graduation year detection (full text) ────────────────────────────────
  const gradYears = text.match(GRAD_YEAR_REGEX) || [];
  if (gradYears.length > 0) {
    ageRiskSum += Math.min(gradYears.length * 10, 30);
    allFlags.push({
      phrase: gradYears[0],
      category: "age",
      context: `Graduation year(s) detected: ${[...new Set(gradYears)].join(", ")}`,
      severity: "Low",
      description:
        "Specific years (graduation, employment start) allow readers to infer a candidate's approximate age, which can introduce unconscious bias.",
      suggestion:
        'Instead of listing years, focus on duration: "5 years of experience in…" or omit graduation years from education entries.',
      section: "education",
    });
  }

  // ── Intersection signals ─────────────────────────────────────────────────
  const intersections = checkIntersectionSignals(allFlags);
  allFlags.push(...intersections);

  // ── Score calculation ────────────────────────────────────────────────────
  const normalizedLanguageRisk = Math.min(languageRiskSum, 100);
  const normalizedAgeRisk = Math.min(ageRiskSum, 100);
  const nameRisk = 0;

  const totalRisk =
    nameRisk * 0.2 +
    normalizedLanguageRisk * 0.5 +
    normalizedAgeRisk * 0.3;

  const score = Math.round(Math.max(0, 100 - totalRisk));

  let riskLevel: "Low" | "Moderate" | "High" = "Low";
  if (totalRisk > 50) riskLevel = "High";
  else if (totalRisk > 20) riskLevel = "Moderate";

  const highCount = allFlags.filter(f => f.severity === "High").length;
  const modCount = allFlags.filter(f => f.severity === "Moderate").length;

  const explanation = [
    `Analyzed ${blocks.length} section(s) of the resume.`,
    allFlags.length === 0
      ? "No significant bias signals were detected — this resume uses neutral, inclusive language."
      : `Found ${allFlags.length} potential bias signal(s): ${highCount} high severity, ${modCount} moderate, ${allFlags.length - highCount - modCount} low.`,
    riskLevel === "High"
      ? "This resume has significant bias indicators that may reduce applicant pool diversity."
      : riskLevel === "Moderate"
      ? "Some bias language was detected. Targeted rewrites are recommended."
      : "Minor signals detected. Small refinements would further improve inclusivity.",
  ].join(" ");

  return {
    score,
    riskLevel,
    flags: allFlags,
    explanation,
    scores: {
      language: Math.round(Math.max(0, 100 - normalizedLanguageRisk)),
      age: Math.round(Math.max(0, 100 - normalizedAgeRisk)),
      name: 100,
    },
  };
}

export interface RewriteSuggestion {
  original: string;
  suggestion: string;
  reason: string;
}

/** Generate AI-powered rewrite suggestions using GPT */
export async function generateRewriteSuggestions(
  resumeText: string,
  flags: BiasFlag[]
): Promise<RewriteSuggestion[]> {
  if (flags.length === 0) return [];

  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  const flagSummary = flags
    .map(f => `"${f.phrase}" (${f.category}, ${f.severity}, in ${f.section})`)
    .join("; ");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content:
            "You are an inclusive hiring language expert. Provide rewrite suggestions for biased phrases found in a resume. Return a JSON object with key 'suggestions' containing an array where each item has 'original', 'suggestion', and 'reason' fields. Keep suggestions professional and skills-focused.",
        },
        {
          role: "user",
          content: `Resume excerpt:\n${resumeText.slice(0, 2000)}\n\nFlagged phrases: ${flagSummary}\n\nProvide neutral, inclusive rewrites for each flagged phrase.`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
  } catch (err) {
    console.error("[bias] generateRewriteSuggestions failed:", err);
    return [];
  }
}
