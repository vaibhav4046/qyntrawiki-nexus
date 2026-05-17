"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle, Sparkles, ChevronDown, ChevronRight, ExternalLink, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PageItem {
  title: string;
  summary: string;
  slug: string;
}

interface Citation {
  source: string;
  quote: string;
  url: string;
}

interface ContextItem {
  pageTitle: string;
  pageSlug: string;
  excerpt: string;
}

interface AskResult {
  answer: string;
  citations: Citation[];
  context: ContextItem[];
}

interface Props {
  slug: string;
  pages: PageItem[];
}

export default function AskClient({ slug, pages }: Props) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AskResult | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [history, setHistory] = useState<{ q: string; a: AskResult }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, result, loading]);

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/wiki/${slug}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get answer");

      setResult(data);
      setHistory((prev) => [...prev, { q: question.trim(), a: data }]);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get answer");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  const suggestions = [
    "What is the main topic?",
    "Summarize the key claims",
    "What are the contradictions?",
    "List the entities mentioned",
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-[#00e5ff]" />
          Ask the Wiki
        </h1>
        <p className="text-[#6b5b8a] mt-1">Ask questions about {slug} and get cited answers from your knowledge base</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Chat History */}
      <div className="space-y-6">
        <AnimatePresence>
          {history.map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
              <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)] rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm text-foreground">{item.q}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/[0.05] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[rgba(139,92,246,0.15)]">
                    <User className="w-3.5 h-3.5 text-[#6b5b8a]" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 max-w-[90%]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[rgba(0,229,255,0.2)]">
                  <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
                </div>
                <div className="flex-1 space-y-3">
                  <Card className="jules-card border-[rgba(139,92,246,0.15)]">
                    <CardContent className="pt-6 space-y-4">
                      <div className="prose prose-invert max-w-none">
                        <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
                          {item.a.answer.split("**").map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="text-[#b794f6] font-semibold">{part}</strong> : <span key={i}>{part}</span>
                          )}
                        </div>
                      </div>

                      {item.a.citations && item.a.citations.length > 0 && (
                        <div className="border-t border-[rgba(139,92,246,0.15)] pt-4">
                          <h4 className="text-xs font-semibold text-[#6b5b8a] mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                            <BookOpen className="w-3.5 h-3.5" /> Citations
                          </h4>
                          <div className="grid gap-2">
                            {item.a.citations.map((cite, i) => (
                              <div key={i} className="p-3 bg-[#0a0512] border border-[rgba(139,92,246,0.15)] text-sm space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-[#00e5ff] bg-[rgba(0,229,255,0.1)] px-1.5 py-0.5 rounded">[{i + 1}]</span>
                                  <span className="font-medium text-foreground">{cite.source}</span>
                                  {cite.url && <a href={cite.url} target="_blank" rel="noopener noreferrer" className="text-[#6b5b8a] hover:text-[#00e5ff] ml-auto"><ExternalLink className="w-3.5 h-3.5" /></a>}
                                </div>
                                {cite.quote && <p className="text-[#6b5b8a] text-xs italic">&ldquo;{cite.quote}&rdquo;</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {item.a.context && item.a.context.length > 0 && (
                    <div>
                      <button onClick={() => setContextOpen(!contextOpen)} className="flex items-center gap-2 text-xs text-[#6b5b8a] hover:text-foreground transition-colors w-full p-2 border border-[rgba(139,92,246,0.15)] hover:border-[rgba(0,229,255,0.2)]">
                        {contextOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <span className="font-medium">Context used</span>
                        <span className="text-[#6b5b8a] ml-auto">({item.a.context.length} source{item.a.context.length !== 1 ? "s" : ""})</span>
                      </button>
                      <AnimatePresence>
                        {contextOpen && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 border border-[rgba(139,92,246,0.15)] divide-y divide-white/[0.04] overflow-hidden">
                            {item.a.context.map((ctx, i) => (
                              <div key={i} className="p-3 bg-[rgba(139,92,246,0.05)]">
                                <div className="flex items-center gap-2 mb-1">
                                  <BookOpen className="w-3.5 h-3.5 text-[#00e5ff]" />
                                  <span className="text-sm font-medium text-foreground">{ctx.pageTitle}</span>
                                  {ctx.pageSlug && <a href={`/wiki/${slug}/page/${ctx.pageSlug}`} className="text-xs text-[#00e5ff] hover:underline ml-auto inline-flex items-center gap-1">View <ExternalLink className="w-3 h-3" /></a>}
                                </div>
                                <p className="text-xs text-[#6b5b8a] line-clamp-3">{ctx.excerpt}</p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
            </div>
            <Card className="jules-card flex-1 border-[rgba(139,92,246,0.15)]">
              <CardContent className="flex items-center gap-3 py-4">
                <Loader2 className="w-4 h-4 text-[#00e5ff] animate-spin" />
                <p className="text-sm text-[#6b5b8a]">Searching knowledge graph and generating answer...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-4">
        <Card className="jules-card border-[rgba(139,92,246,0.2)] shadow-[0_0_60px_rgba(168,85,247,0.08)]">
          <CardContent className="pt-4 pb-4 space-y-3">
            {history.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => { setQuestion(s); textareaRef.current?.focus(); }} className="text-xs px-3 py-1.5 rounded-full bg-[#0a0512] border border-[rgba(139,92,246,0.15)] hover:border-[rgba(0,229,255,0.3)] hover:bg-[rgba(0,229,255,0.05)] transition-colors text-[#6b5b8a] hover:text-foreground">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea ref={textareaRef} value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask a question about this wiki..." rows={2}
                  className={cn("w-full px-4 py-3 text-sm resize-none transition-all", "bg-[#0a0512] backdrop-blur-md border border-[rgba(139,92,246,0.2)]", "text-foreground placeholder:text-[#6b5b8a]", "focus:outline-none focus:ring-2 focus:ring-[rgba(0,229,255,0.2)] focus:border-[rgba(0,229,255,0.3)]")}
                />
              </div>
              <Button onClick={handleAsk} disabled={loading || !question.trim()} className="jules-btn jules-btn-solid h-10 w-10 p-0" size="icon">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={endRef} />
    </div>
  );
}
