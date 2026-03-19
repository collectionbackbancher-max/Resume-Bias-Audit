import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { blogContent } from "@/data/blogPosts";

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");

  if (!match || !params) {
    return null;
  }

  const slug = params.slug as string;
  const post = blogContent[slug];

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
              {post?.category || "Blog"}
            </Badge>
            <span>{post?.readTime || "5 min read"}</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-display font-black text-white mb-4">{post?.title || "Article"}</h1>

          {/* Author Info */}
          <div className="flex items-center gap-6 py-6 border-t border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-xl">
                {post?.image || "📝"}
              </div>
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <User className="h-4 w-4" /> {post?.author || "Author"}
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {post?.date || "Date"}
                </div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="ml-auto text-cyan-400 hover:text-cyan-300 gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none py-12 text-gray-300">
            {post?.content ? (
              post.content.split("\n\n").map((paragraph: string, i: number) => {
                if (paragraph.startsWith("##")) {
                  return (
                    <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-4">
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("- ")) {
                  return (
                    <ul key={i} className="list-disc list-inside space-y-2 mb-4">
                      {paragraph.split("\n").map((item: string, j: number) => (
                        <li key={j}>{item.replace("- ", "").trim()}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={i} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })
            ) : (
              <p>Loading article...</p>
            )}
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
