import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface BiasResult {
  score: number;
  riskLevel: string;
  flags: string[];
  explanation: string;
}

export interface RewriteSuggestion {
  original: string;
  suggestion: string;
  reason: string;
}

const GENDER_CODED_WORDS = [
  "aggressive", "dominant", "rockstar", "competitive", "expert", "leader", 
  "ambitious", "assertive", "decisive", "independent"
];

const AGE_PROXIES = [
  "young", "energetic", "recent graduate", "digital native", "highly mobile",
  "flexible schedule", "adaptable", "fresh"
];

export async function generateRewriteSuggestions(resumeText: string, flags: string[]): Promise<RewriteSuggestion[]> {
  if (flags.length === 0) return [];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content: "You are an expert in inclusive hiring and bias reduction. Your task is to rewrite biased or gender-coded phrases from a resume into neutral and inclusive alternatives suitable for professional hiring review. Return a JSON array of objects, each containing 'original', 'suggestion', and 'reason'."
        },
        {
          role: "user",
          content: `Resume Content: ${resumeText}\n\nDetected Bias Flags: ${flags.join(", ")}\n\nRewrite the flagged biased or gender-coded phrases into neutral and inclusive alternatives suitable for hiring review.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];
    
    try {
      const parsed = JSON.parse(content);
      // Support both { suggestions: [...] } and [...] formats
      return Array.isArray(parsed) ? parsed : (parsed.suggestions || []);
    } catch (e) {
      // Fallback for non-strict JSON if needed, though response_format: json_object is used
      console.error("JSON parse error for suggestions:", e);
      return [];
    }
  } catch (error) {
    console.error("Error generating rewrite suggestions:", error);
    return [];
  }
}

export function analyzeBias(text: string): BiasResult {
  const lowercaseText = text.toLowerCase();
  const flags: string[] = [];
  
  let languageRisk = 0;
  let ageProxyRisk = 0;
  let nameRisk = 0; // Simplified for MVP
  let otherSignals = 0;

  // Check gender-coded words
  const foundGenderWords = GENDER_CODED_WORDS.filter(word => lowercaseText.includes(word));
  if (foundGenderWords.length > 0) {
    languageRisk = Math.min(foundGenderWords.length * 10, 100);
    flags.push(`Gender-coded language detected: ${foundGenderWords.join(", ")}`);
  }

  // Check age proxies
  const foundAgeProxies = AGE_PROXIES.filter(proxy => lowercaseText.includes(proxy));
  if (foundAgeProxies.length > 0) {
    ageProxyRisk = Math.min(foundAgeProxies.length * 20, 100);
    flags.push(`Age-related proxies detected: ${foundAgeProxies.join(", ")}`);
  }

  // Check for graduation years (e.g., 1990, 2010)
  const gradYearMatch = text.match(/\b(19|20)\d{2}\b/g);
  if (gradYearMatch) {
    ageProxyRisk = Math.min(ageProxyRisk + 20, 100);
    flags.push("Specific graduation years detected, which can lead to age bias.");
  }

  // Calculate Score (Higher is more biased based on user formula, but we'll return 100 - risk for fairness score)
  // User Formula: (Name Risk * 0.3) + (Language Risk * 0.4) + (Age Proxy Risk * 0.2) + (Other Signals * 0.1)
  const totalRisk = (nameRisk * 0.3) + (languageRisk * 0.4) + (ageProxyRisk * 0.2) + (otherSignals * 0.1);
  const score = Math.max(0, 100 - totalRisk);

  let riskLevel = "Low";
  if (totalRisk > 50) riskLevel = "High";
  else if (totalRisk > 20) riskLevel = "Moderate";

  return {
    score,
    riskLevel,
    flags,
    explanation: `The resume was analyzed for potential bias signals. We found ${flags.length} potential risk factors related to gendered language and age proxies.`
  };
}
