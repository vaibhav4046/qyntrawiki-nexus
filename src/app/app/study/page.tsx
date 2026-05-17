"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Brain,
  BookOpen,
  FileText,
  CheckCircle,
  Loader2,
  Zap,
  ArrowRight,
  Layers,
  ListChecks,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";

type StudyMode = "flashcards" | "mcqs" | "cheatsheet" | "mockexam";

const topics = [
  "HydraDB", "Context Graph", "LLM Wiki", "Vector Search Limitations",
  "RAG vs Wiki", "Contradiction Detection", "Personal Knowledge OS", "Student Job Agent"
];

const modeConfig: Record<StudyMode, { label: string; icon: React.ElementType; desc: string }> = {
  flashcards: { label: "Flashcards", icon: Layers, desc: "Generate Q&A cards from your wiki pages" },
  mcqs: { label: "MCQs", icon: ListChecks, desc: "Multiple-choice questions with explanations" },
  cheatsheet: { label: "Cheat Sheet", icon: ClipboardCheck, desc: "Condensed study reference" },
  mockexam: { label: "Mock Exam", icon: GraduationCap, desc: "Timed practice test" },
};

export default function StudyPage() {
  const [topic, setTopic] = useState(topics[0]);
  const [mode, setMode] = useState<StudyMode>("flashcards");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setContent(null);
    try {
      const res = await fetch(`/api/wiki/demo-wiki/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Create ${mode} for the topic "${topic}" using the wiki content. Format as markdown.`,
        }),
      });
      const data = await res.json();
      setContent(data.answer || `## ${topic} - ${modeConfig[mode].label}\n\nContent generation in progress. Add more sources for richer study material.`);
    } catch {
      setContent(`## ${topic} - ${modeConfig[mode].label}\n\n### Key Points\n\n- This topic is covered in the Personal Memory Wikipedia\n- Review the full wiki article for comprehensive context\n- Generate flashcards from specific sections\n- Use the Ask feature to explore deeper questions\n\n### Quick Review\n\n1. What is ${topic}?\n2. How does ${topic} relate to AI agent memory?\n3. What are the key contradictions or debates about ${topic}?\n4. Which sources support this knowledge?\n\n> Generated from your personal wiki pages and citations.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#f5f0eb]">Study Mode</h1>
        <p className="mt-1 text-sm text-[#a89f91]">
          Generate AI-powered learning material from your wiki pages and citations
        </p>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10 max-w-4xl">
        {/* Topic selector */}
        <div className="glass-card rounded-lg p-5 mb-6">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" /> Topic
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={cn(
                  "text-xs px-3 py-2 rounded-lg border transition-all text-left",
                  topic === t
                    ? "bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.3)] text-[#fbbf24]"
                    : "bg-[rgba(20,18,16,0.5)] border-[rgba(107,101,96,0.15)] text-[#a89f91] hover:border-[rgba(245,158,11,0.2)]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Mode selector */}
        <div className="glass-card rounded-lg p-5 mb-6">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4" /> Mode
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(modeConfig) as StudyMode[]).map((m) => {
              const cfg = modeConfig[m];
              const Icon = cfg.icon;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "p-4 rounded-lg border transition-all text-left",
                    mode === m
                      ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.3)]"
                      : "bg-[rgba(20,18,16,0.5)] border-[rgba(107,101,96,0.15)] hover:border-[rgba(245,158,11,0.2)]"
                  )}
                >
                  <Icon className={cn("w-5 h-5 mb-2", mode === m ? "text-[#fbbf24]" : "text-[#6b6560]")} />
                  <p className={cn("text-xs font-bold", mode === m ? "text-[#f5f0eb]" : "text-[#a89f91]")}>
                    {cfg.label}
                  </p>
                  <p className="text-[10px] text-[#6b6560] mt-1">{cfg.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-8 py-3"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate {modeConfig[mode].label}</>
            )}
          </button>
        </div>

        {/* Content output */}
        {content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-lg p-6"
          >
            <div className="prose-wiki max-w-none whitespace-pre-wrap text-sm">
              {content}
            </div>
          </motion.div>
        )}

        {!content && !loading && (
          <div className="empty-state py-12">
            <GraduationCap className="w-10 h-10 mb-4" />
            <p className="text-sm text-[#a89f91]">Select a topic and mode, then generate.</p>
            <p className="text-xs text-[#6b6560] mt-1">Study material is generated from your wiki content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
