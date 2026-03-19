import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowRight, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1 } }),
};

const posts = [
  {
    id: "gender-bias-hiring",
    title: "Gender Bias in Hiring: How to Detect and Eliminate It",
    excerpt: "Learn how gender-coded language in job descriptions and resumes perpetuates bias and discover proven strategies to create fairer hiring processes.",
    category: "Hiring Bias",
    date: "March 15, 2026",
    author: "Sarah Johnson",
    readTime: "7 min read",
    slug: "gender-bias-hiring",
  },
  {
    id: "age-discrimination-recruiting",
    title: "Age Discrimination in Recruiting: Legal Risks and Solutions",
    excerpt: "Understand how age proxies in resumes mask illegal age discrimination and learn best practices for age-blind hiring.",
    category: "Legal Compliance",
    date: "March 12, 2026",
    author: "Michael Chen",
    readTime: "8 min read",
    slug: "age-discrimination-recruiting",
  },
  {
    id: "ai-bias-detection",
    title: "How AI Detects Unconscious Bias in Resumes",
    excerpt: "Explore how machine learning algorithms can identify gender-coded language, age proxies, and hidden bias markers faster than humans.",
    category: "Technology",
    date: "March 9, 2026",
    author: "Emily Rodriguez",
    readTime: "9 min read",
    slug: "ai-bias-detection",
  },
  {
    id: "inclusive-hiring-practices",
    title: "5 Essential Inclusive Hiring Practices for Modern Teams",
    excerpt: "Discover actionable strategies to build diverse teams and create fair hiring processes that attract top talent from all backgrounds.",
    category: "Best Practices",
    date: "March 6, 2026",
    author: "David Kim",
    readTime: "6 min read",
    slug: "inclusive-hiring-practices",
  },
  {
    id: "resume-bias-examples",
    title: "Real Examples of Bias in Resumes (And How to Fix Them)",
    excerpt: "See actual resume examples that trigger bias flags and learn how to rewrite them for more objective evaluation.",
    category: "Practical Tips",
    date: "March 3, 2026",
    author: "Jessica Wong",
    readTime: "10 min read",
    slug: "resume-bias-examples",
  },
  {
    id: "diversity-metrics",
    title: "Measuring Diversity: Key Metrics for Fair Hiring",
    excerpt: "Learn which metrics matter for tracking diversity in hiring and how to use data to drive continuous improvement.",
    category: "Analytics",
    date: "February 28, 2026",
    author: "Robert Taylor",
    readTime: "7 min read",
    slug: "diversity-metrics",
  },
  {
    id: "name-bias-hiring",
    title: "Name Bias in Hiring: The Data and How to Prevent It",
    excerpt: "Studies show resumes with certain names get fewer callbacks. Here's how to implement blind resume review for fairer outcomes.",
    category: "Research",
    date: "February 25, 2026",
    author: "Alexandra Patel",
    readTime: "8 min read",
    slug: "name-bias-hiring",
  },
  {
    id: "job-description-bias",
    title: "Writing Job Descriptions Without Gender Bias",
    excerpt: "Master the art of writing neutral job descriptions that attract diverse candidates and comply with employment law.",
    category: "Content Creation",
    date: "February 22, 2026",
    author: "Marcus Johnson",
    readTime: "6 min read",
    slug: "job-description-bias",
  },
  {
    id: "unconscious-bias-training",
    title: "Why Unconscious Bias Training Isn't Enough (And What Is)",
    excerpt: "Discover why traditional bias training falls short and what combination of strategies actually reduces hiring discrimination.",
    category: "Training",
    date: "February 19, 2026",
    author: "Dr. Lisa Anderson",
    readTime: "9 min read",
    slug: "unconscious-bias-training",
  },
  {
    id: "fair-hiring-roi",
    title: "The ROI of Fair Hiring: Why Diversity Matters for Your Bottom Line",
    excerpt: "Companies with diverse teams outperform competitors. Learn the business case for unbiased hiring and diversity investment.",
    category: "Business Impact",
    date: "February 16, 2026",
    author: "Thomas Bradley",
    readTime: "7 min read",
    slug: "fair-hiring-roi",
  },
];

export default function Blog() {
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
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-cyan-500/10">Back</Button>
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="container mx-auto px-6 py-20">
        <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-5xl lg:text-6xl font-display font-black text-white mb-6">
            Fair Hiring <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Insights</span>
          </h1>
          <p className="text-xl text-gray-400">
            Learn how to eliminate bias in recruiting, build diverse teams, and create fairer hiring processes.
          </p>
        </motion.div>

        {/* ── Blog Grid ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="h-full bg-gradient-to-br from-slate-900/50 to-black border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-cyan-400 group-hover:gap-3 transition-all">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{post.author}</span>
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Subscribe CTA ── */}
        <motion.div
          className="max-w-2xl mx-auto mt-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-display font-bold text-white mb-2">Stay Updated</h3>
          <p className="text-gray-400 mb-6">Get the latest insights on fair hiring practices delivered to your inbox.</p>
          <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg">
            Subscribe to Newsletter
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
