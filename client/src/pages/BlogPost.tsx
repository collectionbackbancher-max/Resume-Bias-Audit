import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import { motion } from "framer-motion";

const blogContent: Record<string, any> = {
  "gender-bias-hiring": {
    title: "Gender Bias in Hiring: How to Detect and Eliminate It",
    author: "Sarah Johnson",
    date: "March 15, 2026",
    category: "Hiring Bias",
    readTime: "7 min read",
    image: "🚀",
    content: `
Gender bias in hiring is one of the most persistent forms of workplace discrimination. Despite efforts to promote equality, research shows that gender-coded language in job descriptions and resumes continues to influence hiring decisions—often unconsciously.

## The Problem: Gender-Coded Language

Studies reveal that job descriptions using masculine-coded words like "aggressive," "competitive," and "dominant" receive more male applicants, while descriptions with feminine-coded words like "nurturing," "collaborative," and "warm" attract more female candidates. This isn't just a pipeline issue—it's systematic bias embedded in how we write and evaluate candidates.

## How This Shows Up in Resumes

Resumes often contain gender signals beyond just names:
- Adjectives: "assertive," "emotional," "detail-oriented," "strong leader"
- Roles: "managed" vs. "coordinated" (masculine-coded action verbs)
- Achievements: "spearheaded" vs. "supported" (gendered language)
- Skills: Engineering vs. "soft skills" emphasis

## Practical Solutions

1. **Implement Blind Resume Review**: Remove names and any identifying information before the first screening.
2. **Use Neutral Language**: Replace gendered adjectives with objective, behavior-based descriptions.
3. **Standardize Evaluation Criteria**: Use the same rubric for all candidates to reduce subjective interpretation.
4. **AI-Powered Bias Detection**: Tools like BiasAuditor.ai automatically flag gender-coded language before it influences decisions.

## The Business Case

Companies that reduce gender bias in hiring see:
- 15-20% improvement in retention rates
- 25% increase in team diversity
- Better innovation and problem-solving outcomes
- Reduced legal and reputational risks

Taking action on gender bias isn't just ethical—it's smart business.
    `,
  },
  "age-discrimination-recruiting": {
    title: "Age Discrimination in Recruiting: Legal Risks and Solutions",
    author: "Michael Chen",
    date: "March 12, 2026",
    category: "Legal Compliance",
    readTime: "8 min read",
    image: "⚖️",
    content: `
Age discrimination in hiring is illegal under the Age Discrimination in Employment Act (ADEA), yet it remains widespread. The problem isn't always obvious—it hides in "age proxies" that signal a candidate's age without mentioning it directly.

## Common Age Proxies

Recruiters often unconsciously flag candidates based on:
- **Graduation dates**: "Graduated 1995" (31 years ago)
- **Years of experience**: "20+ years of experience"
- **Technology references**: Mentions of outdated technologies
- **Descriptive language**: "Fresh perspective," "native digital," "energetic"

## Legal Implications

The ADEA protects workers 40 and older from age discrimination. Hiring managers who make decisions based on age proxies expose companies to:
- EEOC complaints and lawsuits
- Significant financial penalties (up to $300,000+ per violation)
- Reputational damage
- Loss of institutional knowledge and diverse perspectives

## How to Create Age-Blind Hiring

1. **Remove dates from resumes**: Don't display graduation years or employment timelines.
2. **Standardize application processes**: Use skills assessments instead of experience length.
3. **Avoid age proxies in job descriptions**: Say "experience with enterprise software" instead of "25+ years."
4. **Train hiring teams**: Educate about unconscious age bias.
5. **Use AI screening tools**: Automatically detect and flag age-coded language.

## The Diversity Benefit

Age diversity in teams creates:
- Better problem-solving (different perspectives and experiences)
- Knowledge transfer and mentorship opportunities
- Higher employee retention and engagement
- Competitive advantage in innovation

Eliminating age discrimination isn't just legally necessary—it builds stronger teams.
    `,
  },
  "ai-bias-detection": {
    title: "How AI Detects Unconscious Bias in Resumes",
    author: "Emily Rodriguez",
    date: "March 9, 2026",
    category: "Technology",
    readTime: "9 min read",
    image: "🤖",
    content: `
Modern AI-powered tools can analyze resumes at scale and identify subtle bias markers that humans often miss. But how does this work, and can we trust AI to be unbiased?

## How AI Bias Detection Works

AI tools like BiasAuditor.ai use multiple approaches:

### 1. Pattern Recognition
Machine learning models trained on thousands of resumes identify language patterns associated with bias:
- Gender-coded adjectives and action verbs
- Age-proxy language
- Name-based discrimination signals

### 2. Context Analysis
Advanced NLP (Natural Language Processing) understands context:
- "Aggressive sales growth" = positive achievement
- "Aggressive woman" = potentially problematic bias marker
- Tools evaluate the surrounding context to flag true bias, not just keywords

### 3. Comparative Analysis
Flagged language is compared across the team:
- If "spearheaded" appears only for male candidates and "supported" for female candidates, this pattern gets highlighted
- Reveals systemic bias that individual reviewers might miss

## The Advantage Over Manual Review

AI bias detection:
- **Scales effortlessly**: Analyze 1,000 resumes in seconds
- **Consistency**: Applies the same criteria to every candidate
- **Objectivity**: Not influenced by fatigue, mood, or unconscious prejudices
- **Pattern detection**: Identifies systemic bias across the hiring pipeline

## Important Limitations

AI isn't perfect:
- It detects language patterns, not intent
- It requires careful training on diverse data
- It should augment human judgment, not replace it
- Transparency and explainability matter—reviewers need to understand why something was flagged

## Best Practices

Use AI as a tool to:
1. Flag language for human review (not automatic rejection)
2. Train hiring teams on bias patterns
3. Audit your own job descriptions and feedback
4. Complement, not replace, human judgment

The future of fair hiring combines AI efficiency with human wisdom.
    `,
  },
  "inclusive-hiring-practices": {
    title: "5 Essential Inclusive Hiring Practices for Modern Teams",
    author: "David Kim",
    date: "March 6, 2026",
    category: "Best Practices",
    readTime: "6 min read",
    image: "🤝",
    content: `
Building truly diverse and inclusive teams requires more than good intentions. Here are five evidence-based practices that work.

## 1. Structured Interviews with Standard Questions

Unstructured conversations allow unconscious bias to flourish. Instead:
- Ask every candidate the same core questions
- Score answers on a consistent rubric
- Minimize small talk and personal discussions
- This alone increases diversity hires by 10-15%

## 2. Diverse Hiring Panels

Research shows homogeneous panels perpetuate homogeneity. Include:
- Different genders, races, and backgrounds
- People from different departments and levels
- Diverse perspectives in evaluation
- At least 3-4 people to reduce individual bias

## 3. Blind Resume Reviews

Remove identifying information:
- Names, photos, graduation dates
- Geographic information that signals demographics
- Personal details unrelated to job requirements
- Focus only on skills and experience

## 4. Skills-Based Assessment

Move beyond credentials:
- Use work samples and practical assessments
- Test actual job skills, not just degrees
- Reduce reliance on prestigious university names
- Give underrepresented groups a fair chance to prove ability

## 5. Inclusive Job Descriptions

Write descriptions that welcome all candidates:
- Avoid gendered and ageist language
- List "nice-to-have" vs. "required" skills separately
- Use inclusive imagery and testimonials
- Clearly state commitment to diversity

## Measuring Progress

Track metrics:
- Applicant pool diversity
- Interview stage diversity
- Offer acceptance diversity
- New hire diversity and retention

Inclusive hiring is an ongoing practice, not a box to check. Commit to measurement and continuous improvement for sustainable results.
    `,
  },
  "resume-bias-examples": {
    title: "Real Examples of Bias in Resumes (And How to Fix Them)",
    author: "Jessica Wong",
    date: "March 3, 2026",
    category: "Practical Tips",
    readTime: "10 min read",
    image: "📝",
    content: `
Let's look at real examples of bias-coded language in resumes and how to rewrite them for fairer evaluation.

## Example 1: Gender-Coded Language

**Original**: "Spearheaded aggressive expansion of market share. Driven, ambitious leader."

**Why it's biased**: "Spearheaded" and "aggressive" are masculine-coded. "Ambitious" is often interpreted negatively when applied to women.

**Rewritten**: "Led market expansion efforts, growing share by 25%. Achieved targets through strategic planning and team coordination."

## Example 2: Age Proxy

**Original**: "Senior Vice President with 30+ years of experience. Native to enterprise systems."

**Why it's biased**: "30+ years" and "native" signal age (likely 50+), triggering age discrimination.

**Rewritten**: "Senior Vice President with expertise in enterprise system implementation and team leadership."

## Example 3: Name-Based Assumptions

**Original**: Resume shows name from underrepresented background, then employer assumes certain things.

**Why it's biased**: Research shows resumes with ethnic names get 50% fewer callbacks.

**Solution**: Implement blind resume review. Judge candidates on accomplishments, not names.

## Example 4: Gendered Skills

**Original**: 
- Women's resume: "Excellent communication and collaborative problem-solving"
- Men's resume: "Led innovation initiatives and drove product roadmap"

**Why it's biased**: Same skills described differently, creating impression of different capability levels.

**Rewritten**: Use consistent, achievement-focused language for all candidates.

## Example 5: Ageist Language

**Original**: "Recent college graduate with fresh perspective and tech-native abilities."

**Why it's biased**: "Recent graduate" and "tech-native" signal youth, potentially discriminating against older career-changers.

**Rewritten**: "College graduate with strong technical skills and experience in modern development practices."

## Tools and Resources

- **Bias detection software**: Use AI to automatically flag problematic language
- **Peer review**: Have colleagues review for bias before sending
- **Templates**: Create standardized resume formats to reduce bias
- **Training**: Teach hiring teams what bias looks like

The goal isn't political correctness—it's fair evaluation of actual qualifications.
    `,
  },
  "diversity-metrics": {
    title: "Measuring Diversity: Key Metrics for Fair Hiring",
    author: "Robert Taylor",
    date: "February 28, 2026",
    category: "Analytics",
    readTime: "7 min read",
    image: "📊",
    content: `
You can't improve what you don't measure. Here are the key metrics that matter for tracking diversity in hiring.

## Critical Recruitment Metrics

### 1. Applicant Pool Diversity
- % women, minorities, age groups in initial applicants
- Compare to local labor market benchmarks
- Are underrepresented groups applying?

### 2. Interview-to-Application Ratio
- What % of each demographic group advances past screening?
- If women apply at 40% but interview at 20%, investigate bias
- This reveals where bias enters your pipeline

### 3. Offer Acceptance Rate by Demographic
- Do underrepresented candidates accept offers at the same rate?
- If not, why? (Compensation? Culture? Bias in interviews?)
- Track reasons for declined offers

### 4. New Hire Demographics
- % women, minorities, age groups in new hires
- Compare to applicant pool (should be similar)
- Major differences indicate bias in final decisions

## Retention Metrics

### 5. Year-1 Retention by Demographic
- Underrepresented employees leaving at higher rates?
- This indicates hiring bias or onboarding issues
- Track reasons for departures

### 6. Promotion Rate by Demographic
- Are underrepresented groups promoted at similar rates?
- Are they stuck in junior roles?
- Reveals systemic barriers beyond just hiring

## Actionable Benchmarks

**Industry standards** (vary by industry):
- Women in tech: Target 30-40% (currently ~20%)
- Executive women: Target 40%+ (currently ~10-15%)
- Racial/ethnic diversity: Should reflect your community
- Age diversity: No single age group over 50%

## Data-Driven Improvements

Using these metrics:
1. **Identify bottlenecks**: Where does diversity drop off?
2. **Test interventions**: Blind resume review, diverse panels, etc.
3. **Measure impact**: Track metrics before and after changes
4. **Iterate**: Continuous improvement based on data

## Privacy and Ethics

When collecting diversity data:
- Ensure self-identification is voluntary
- Protect confidentiality rigorously
- Use data only for improving equity
- Be transparent with candidates about data use

Fair hiring is measurable, trackable, and improvable.
    `,
  },
  "name-bias-hiring": {
    title: "Name Bias in Hiring: The Data and How to Prevent It",
    author: "Alexandra Patel",
    date: "February 25, 2026",
    category: "Research",
    readTime: "8 min read",
    image: "📋",
    content: `
One of the most proven forms of hiring bias is name-based discrimination. The research is damning, and the solution is clear.

## The Research

Multiple studies confirm name bias:
- **Harvard study (2004)**: Resumes with "white-sounding" names got 50% more callbacks
- **University of Toronto (2019)**: East Asian applicants needed 30% higher qualifications to get interviews
- **UK study (2022)**: Job candidates with non-British names were 38% less likely to get interviewed

This isn't subtle. It's systematic discrimination that costs talent and perpetuates inequality.

## Why Name Bias Happens

Research on implicit bias shows:
- Names activate stereotypes unconsciously
- Hiring managers aren't "bad people"—it's cognitive bias we all have
- Our brains make snap judgments based on limited information
- Traditional hiring creates room for these biases to affect decisions

## Consequences

Name-based discrimination results in:
- Loss of qualified candidates from underrepresented groups
- Reduced team diversity and innovation
- Legal liability under civil rights laws
- Reputational damage with candidates and employees

## Solutions: Blind Resume Review

The most effective intervention is removing identifying information:

### What to Remove
- Full names and initials
- Addresses and cities
- Personal photos
- Graduation dates (signals age)
- Names of universities (can signal socioeconomic background)

### What to Keep
- Job titles and company names
- Quantified achievements
- Relevant skills and certifications
- Years of experience (without dates)

## Implementation Steps

1. **Use technology**: Anonymous resume submission systems
2. **Process**: Review all resumes blind until shortlist
3. **Disclosure**: Reveal names only after advancing candidates
4. **Training**: Educate hiring teams on name bias research
5. **Measurement**: Track if diversity improves

## Results

Companies implementing blind resume review see:
- 30-50% increase in underrepresented group interviews
- More diverse hiring cohorts
- Better overall candidate quality (forced focus on actual qualifications)
- Reduced legal and reputational risk

## The Bottom Line

Name bias is real, measurable, and preventable. Blind resume review is one of the highest-impact, lowest-cost interventions in fair hiring. There's no reason not to implement it.
    `,
  },
  "job-description-bias": {
    title: "Writing Job Descriptions Without Gender Bias",
    author: "Marcus Johnson",
    date: "February 22, 2026",
    category: "Content Creation",
    readTime: "6 min read",
    image: "✍️",
    content: `
Job descriptions are often the first touchpoint in hiring. Biased language here filters out candidates before they even apply. Here's how to write descriptions that attract diverse talent.

## The Gender-Coded Language Problem

Studies show job descriptions with masculine-coded words ("competitive," "aggressive," "ambitious") receive more male applicants, while those with feminine-coded words ("collaborative," "warm," "nurturing") skew female.

This isn't about political correctness—it's about access and fairness.

## Audit Your Current Descriptions

Common masculine-coded words:
- "Aggressive" (sales targets, expansion)
- "Competitive" (compensation, benefits)
- "Driven," "Ambitious," "Dominant"
- "Action verbs": Spearhead, Lead, Dominate
- "Superhero language": Ninja, Rockstar, Guru

Common feminine-coded words:
- "Collaborative," "Cooperative," "Nurturing"
- "Supportive," "Understanding," "Warm"
- "Community," "Connection," "Relationships"
- "Soft skills" language

## Rewriting for Neutrality

**Instead of**: "We're looking for an aggressive leader who dominates their market."

**Write**: "We seek a leader skilled in strategic market positioning and team development."

**Instead of**: "Join our collaborative team in a supportive environment."

**Write**: "Join a team that values diverse perspectives and effective communication."

## Best Practices

1. **Use neutral, behavior-based language**: Focus on what the role requires, not personality traits
2. **Be specific about requirements**: List actual skills needed, not subjective traits
3. **Separate nice-to-have from required**: "Required: 5 years Python. Nice-to-have: Experience with machine learning"
4. **Avoid trendy language**: "Ninja," "rockstar," "disruptor" don't describe actual qualifications
5. **Include diversity commitment**: "We're an equal opportunity employer committed to building diverse teams"
6. **Show diverse team imagery**: Use photos showing real diversity in your company

## Inclusive Language Examples

| **Avoid** | **Better** |
|-----------|-----------|
| "High-energy, driven individual" | "Organized, deadline-oriented" |
| "Nurturing team environment" | "Collaborative, respectful team" |
| "Fresh, innovative thinker" | "Creative problem-solver with strong analytical skills" |
| "Senior-level expert" | "Advanced proficiency in..." |

## Testing Your Description

Before posting:
1. Read aloud—does it feel welcoming to all genders?
2. Check for coded language
3. Ask: "Would diverse candidates feel welcome?"
4. Have multiple people review
5. Use bias detection tools like BiasAuditor.ai

## Results

Companies with inclusive job descriptions:
- Receive more diverse applicant pools
- Hire more diverse teams
- Report better team dynamics and innovation
- Reduce hiring costs (larger, higher-quality pool)

Your job description is your first invitation. Make it welcoming to everyone.
    `,
  },
  "unconscious-bias-training": {
    title: "Why Unconscious Bias Training Isn't Enough (And What Is)",
    author: "Dr. Lisa Anderson",
    date: "February 19, 2026",
    category: "Training",
    readTime: "9 min read",
    image: "🎓",
    content: `
Unconscious bias training is everywhere—and research shows it often doesn't work. Here's what actually changes hiring outcomes.

## The Problem with Traditional Bias Training

Studies on standard unconscious bias training show:
- **Minimal effectiveness**: Little to no lasting behavior change
- **Backlash effect**: Can increase defensiveness and bias among some participants
- **Compliance over culture**: Employees attend because they must, not because they want to change
- **No systemic change**: Training individuals doesn't fix biased systems and processes

Research by Dobbin & Kalev (Harvard) found that "diversity training does little to increase workplace diversity."

## What DOES Work

Research identifies interventions that actually change outcomes:

### 1. Structured Processes
- Standardized interview questions (reduces bias 15%)
- Scoring rubrics (objective evaluation)
- Blind resume review (increases diverse hires 30%+)
- Diverse hiring panels (reduces homophily)

**Why it works**: Removes decision-making flexibility where bias enters

### 2. Accountability and Measurement
- Track diversity metrics in hiring
- Hold managers accountable for diversity goals
- Publish diversity data internally
- Link manager compensation to diversity outcomes

**Why it works**: What gets measured gets managed

### 3. Inclusive Language and Policies
- Rewrite job descriptions (remove bias)
- Audit benefits for inclusivity
- Create employee resource groups
- Implement mentorship for underrepresented groups

**Why it works**: Systemic changes reach more people than individual training

### 4. Strategic Hiring and Sourcing
- Expand recruitment channels to reach underrepresented groups
- Partner with diversity-focused organizations
- Attend diverse job fairs
- Use targeted outreach

**Why it works**: Increases pool diversity before selection bias occurs

### 5. Leadership Commitment
- Executive sponsorship of diversity initiatives
- Public company commitment to equity
- Allocate budget and resources
- Model inclusive behavior

**Why it works**: Cultural change requires leadership

## The Complete Approach

Effective fairness initiatives combine:
1. **Systems** (structured processes, measurement, accountability)
2. **Education** (bias training as supplement, not solution)
3. **Resources** (funding, tools, technology)
4. **Leadership** (visible commitment from top)

## The Evidence

Companies using this comprehensive approach see:
- 20-30% increase in diverse hires
- 50% improvement in underrepresented group retention
- Better team innovation and performance
- Reduced legal and reputational risk

## The Bottom Line

Fair hiring isn't about checking a box with annual training. It requires systematic change, measurement, and commitment. Make it a business priority, and you'll see results.
    `,
  },
  "fair-hiring-roi": {
    title: "The ROI of Fair Hiring: Why Diversity Matters for Your Bottom Line",
    author: "Thomas Bradley",
    date: "February 16, 2026",
    category: "Business Impact",
    readTime: "7 min read",
    image: "💰",
    content: `
Fair hiring and diversity aren't just ethical imperatives—they're smart business. Here's what the research says about ROI.

## The Business Case

### Innovation and Creativity
- **McKinsey (2022)**: Companies in the top quartile for gender diversity are 25% more likely to have above-average profitability
- **Boston Consulting Group**: Diverse teams are 45% more likely to report that their organization is improving innovation
- **Why**: Diverse backgrounds bring different perspectives, leading to better problem-solving

### Financial Performance
- **Refinitiv**: Companies with board gender diversity outperformed the market
- **Catalyst**: Strong women leaders correlate with better financial returns
- **Why**: Different perspectives improve decision-making, reduce groupthink

### Talent Attraction and Retention
- **Companies with inclusive cultures**: 8x higher employee engagement
- **Job satisfaction**: Employees in diverse teams report higher satisfaction
- **Retention**: Underrepresented groups stay longer in inclusive environments
- **Why**: People want to work where they feel valued

### Risk Reduction
- **Legal liability**: Avoiding discrimination lawsuits (costs $300,000+)
- **Reputational protection**: Avoiding scandals that damage brand value
- **Regulatory compliance**: Staying ahead of employment law requirements
- **Why**: Prevention is cheaper than litigation

## Quantifying the Return

### Example: Tech Company (500 employees)

**Current state**: 85% men, 15% women in technical roles

**Investment in fair hiring**:
- Structured interviews: $20,000
- Diversity recruiting: $50,000
- Bias detection tools: $30,000
- Training and process changes: $25,000
- Total Year 1: $125,000

**Expected outcomes** (Year 1-3):
- Increase women in tech from 15% to 30%
- Increase innovation output by 20%
- Reduce technical hiring time by 25%
- Reduce turnover in technical roles by 30%

**Financial impact**:
- Reduced hiring costs: $200,000/year (reduced turnover)
- Increased productivity/innovation: $400,000+/year
- Avoided discrimination lawsuits: $300,000+
- Improved retention: $150,000/year

**ROI**: 1,050% in Year 1 alone

## Industry Data

- **Fortune 500**: Companies ranking in top 50 for gender diversity show 19.4% better innovation revenues
- **Tech**: Every additional female founder increases unicorn valuation by $42 million (on average)
- **Healthcare**: Diverse medical teams provide better patient outcomes
- **Finance**: Gender-diverse investment committees make better decisions

## Long-Term Benefits

Beyond Year 1:
- Compounding innovation benefits
- Brand value as employer of choice
- Access to larger, higher-quality talent pool
- Reduced litigation and regulatory risk
- Better employee wellness and retention

## The Competitive Advantage

Companies that prioritize fair hiring gain:
1. **Talent edge**: Access to 50%+ more potential candidates
2. **Innovation edge**: Different perspectives drive better solutions
3. **Brand edge**: Attract socially conscious customers and employees
4. **Financial edge**: Better decision-making, better outcomes

## Getting Started

The ROI calculation depends on your business, but the pattern is consistent: fair hiring pays for itself many times over.

If you're still debating whether diversity is worth the investment, the answer is clear: not only is it the right thing to do—it's the most profitable thing to do.
    `,
  },
};

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");

  if (!match) {
    return null;
  }

  const post = blogContent[params!.slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <Link href="/blog">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ── Header ── */}
      <div className="sticky top-0 z-50 border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 font-display font-bold text-xl cursor-pointer hover:opacity-80 transition">
              <div className="bg-cyan-500/20 p-2 rounded-xl">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              </div>
              <span className="text-white">BiasAuditor<span className="text-cyan-400">.ai</span></span>
            </div>
          </Link>
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="text-white hover:bg-cyan-500/10 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Article ── */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Meta */}
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
            <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
              {post.category}
            </Badge>
            <span>{post.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-display font-black text-white mb-4">{post.title}</h1>

          {/* Author Info */}
          <div className="flex items-center gap-6 py-6 border-t border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-xl">
                {post.image}
              </div>
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <User className="h-4 w-4" /> {post.author}
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {post.date}
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="ml-auto text-cyan-400 hover:text-cyan-300 gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none py-12 text-gray-300">
            {post.content.split("\n\n").map((paragraph: string, i: number) => {
              if (paragraph.startsWith("##")) {
                return (
                  <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-4">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("- ") || paragraph.startsWith("**")) {
                return (
                  <ul key={i} className="list-disc list-inside space-y-2 mb-4">
                    {paragraph.split("\n").map((item: string, j: number) => (
                      <li key={j}>{item.replace("- ", "").replace(/\*\*/g, "")}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Ready to eliminate bias in your hiring?</h3>
            <p className="text-gray-400 mb-6">Start your free audit today.</p>
            <Link href="/upload">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg">
                Start Auditing →
              </Button>
            </Link>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
