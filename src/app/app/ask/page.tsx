"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  MessageSquare,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  citations?: { sourceId: string; quote: string; title?: string }[];
  contextUsed?: { source: string; quote: string }[];
}

const suggestedQuestions = [
  "What do I know about AI agents?",
  "Find my project ideas related to student jobs.",
  "What files mention HydraDB?",
  "What contradictions exist in my notes?",
  "Create a summary of my startup ideas.",
  "What should I work on next based on my data?",
];

const demoHistory: Message[] = [
  {
    id: "ask-1",
    role: "user",
    text: "What is HydraDB and how does it differ from vector databases?",
  },
  {
    id: "ask-1-resp",
    role: "agent",
    text: "HydraDB is a graph-first context infrastructure for AI agents that builds an ontology-first context graph over ingested data. Unlike vector databases which return semantic similarity, HydraDB returns relevance by tracking entities, relationships, and temporal signals.",
    citations: [
      { sourceId: "src-hydradb", quote: "HydraDB is a graph-first context infrastructure for AI agents.", title: "HydraDB Overview" },
      { sourceId: "src-vector-limits", quote: "Vector databases return similarity. HydraDB returns relevance.", title: "Vector Search Limitations" },
    ],
    contextUsed: [
      { source: "HydraDB Overview", quote: "HydraDB is a graph-first context infrastructure..." },
      { source: "Vector Search Limitations", quote: "Vector databases return similarity..." },
    ],
  },
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>(demoHistory);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedContext, setExpandedContext] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setLoading(true);

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`/api/wiki/demo-wiki/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        role: "agent",
        text: data.answer || "I couldn't find a specific answer in your wiki. Try rephrasing or adding more sources.",
        citations: data.citations || [],
        contextUsed: data.contextUsed || [],
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      const agentMsg: Message = {
        id: `a-${Date.now()}`,
        role: "agent",
        text: "Sorry, I ran into an error connecting to your wiki. The demo data suggests: HydraDB is a graph-first context infrastructure for AI agents that replaces vector-only retrieval with intelligent recall.",
        citations: [{ sourceId: "src-hydradb", quote: "HydraDB is a graph-first context infrastructure...", title: "HydraDB Overview" }],
      };
      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-4 shrink-0">
        <h1 className="text-2xl font-bold text-[#f5f5f5]">Ask My Wiki</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Ask natural language questions over your personal knowledge base
        </p>
      </div>

      {/* Suggested questions */}
      {messages.length <= 2 && (
        <div className="px-6 sm:px-8 lg:px-10 pb-4 shrink-0">
          <p className="text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-2">
            Suggested Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                }}
                className="text-xs px-3 py-1.5 rounded bg-[rgba(230,57,70,0.08)] text-[#a0a0a0] hover:bg-[rgba(230,57,70,0.15)] hover:text-[#e63946] transition-all border border-[rgba(230,57,70,0.15)]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 sm:px-8 lg:px-10 py-4 space-y-4"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "agent" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-2xl rounded-lg p-4",
                  msg.role === "user"
                    ? "bg-[rgba(230,57,70,0.1)] border border-[rgba(230,57,70,0.2)]"
                    : "glass-card"
                )}
              >
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    msg.role === "user" ? "text-[#f5f5f5]" : "text-[#a0a0a0]"
                  )}
                >
                  {msg.text}
                </p>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[rgba(107,101,96,0.15)]">
                    <p className="text-[10px] font-bold text-[#666666] uppercase tracking-wider mb-2">
                      Citations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cite, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-1 bg-[rgba(230,57,70,0.1)] text-[#e63946] rounded flex items-center gap-1"
                        >
                          <BookOpen className="w-2.5 h-2.5" />
                          {cite.title || cite.sourceId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Context Used accordion */}
                {msg.contextUsed && msg.contextUsed.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setExpandedContext(
                          expandedContext === msg.id ? null : msg.id
                        )
                      }
                      className="flex items-center gap-1 text-[10px] text-[#666666] hover:text-[#a0a0a0] transition-colors"
                    >
                      {expandedContext === msg.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      Context Used ({msg.contextUsed.length} sources)
                    </button>
                    <AnimatePresence>
                      {expandedContext === msg.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 space-y-2">
                            {msg.contextUsed.map((ctx, i) => (
                              <div
                                key={i}
                                className="p-2 rounded bg-[rgba(107,101,96,0.05)] border border-[rgba(107,101,96,0.1)]"
                              >
                                <p className="text-[10px] font-bold text-[#e63946]">
                                  {ctx.source}
                                </p>
                                <p className="text-[10px] text-[#666666] mt-0.5 italic">
                                  "{ctx.quote}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-[rgba(107,101,96,0.2)] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#a0a0a0]" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                <Loader2 className="w-4 h-4 animate-spin text-[#e63946]" />
                Consulting your knowledge graph...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 sm:px-8 lg:px-10 py-4 shrink-0">
        <div className="glass-panel rounded-lg p-3 flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your wiki..."
            rows={1}
            className="flex-1 bg-transparent border-none resize-none text-sm text-[#f5f5f5] placeholder:text-[#666666] focus:outline-none min-h-[40px] max-h-[120px] py-2"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              input.trim() && !loading
                ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                : "bg-[rgba(107,101,96,0.2)] text-[#666666] cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-[#666666] mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Answers include citations from your sources. Context used is shown for transparency.
        </p>
      </div>
    </div>
  );
}
