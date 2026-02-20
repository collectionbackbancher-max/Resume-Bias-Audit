export interface BiasResult {
  score: number;
  riskLevel: string;
  flags: string[];
  explanation: string;
}

const GENDER_CODED_WORDS = [
  "aggressive", "dominant", "rockstar", "competitive", "expert", "leader", 
  "ambitious", "assertive", "decisive", "independent"
];

const AGE_PROXIES = [
  "young", "energetic", "recent graduate", "digital native", "highly mobile",
  "flexible schedule", "adaptable", "fresh"
];

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
