"use client";

import { motion } from "framer-motion";
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  GitPullRequest,
  BookOpen,
  XCircle,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

const summaryStats = [
  { label: "Total Claims", value: 312, icon: FileText, color: "text-yellow-400", bg: "bg-yellow-400/15" },
  { label: "Supported", value: 198, icon: ShieldCheck, color: "text-green-400", bg: "bg-green-500/15" },
  { label: "Disputed", value: 24, icon: XCircle, color: "text-red-400", bg: "bg-red-500/15" },
  { label: "Under Review", value: 11, icon: Eye, color: "text-orange-400", bg: "bg-orange-500/15" },
];

const contradictions = [
  {
    id: 1,
    claimA: {
      subject: "Vector Database",
      predicate: "returns",
      object: "similarity not relevance",
      source: "ACM Survey 2023",
      confidence: 85,
    },
    claimB: {
      subject: "Vector Database",
      predicate: "is",
      object: "sufficient for agent memory",
      source: "Blog: Agentic RAG Patterns",
      confidence: 65,
    },
    explanation:
      "Claim A argues similarity search does not imply semantic relevance, while Claim B treats vector retrieval as adequate memory. These are in tension when relevance is required.",
    status: "disputed",
  },
  {
    id: 2,
    claimA: {
      subject: "Vector Search",
      predicate: "is",
      object: "only useful for simple recommendation systems",
      source: "Hacker News Thread, 2022",
      confidence: 45,
    },
    claimB: {
      subject: "Vector Search",
      predicate: "enables",
      object: "complex semantic retrieval and reasoning",
      source: "Google Research, 2023",
      confidence: 92,
    },
    explanation:
      "Low-confidence claim dismisses vector search as trivial, while multiple high-confidence sources demonstrate advanced semantic and multi-hop retrieval use cases.",
    status: "possible contradiction",
  },
];

export default function ContradictionsPage() {
  return (
    <div className="min-h-screen bg-black p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#f5f5f5] mb-2 flex items-center gap-3">
            <Scale className="w-8 h-8 text-yellow-400" />
            Claim and Contradiction Ledger
          </h1>
          <p className="text-[#a0a0a0] text-lg">
            Track disputed claims, compare evidence, and resolve conflicting statements.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {summaryStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass-card rounded-xl p-5 flex flex-col items-center text-center"
            >
              <div className={`p-2.5 rounded-lg ${stat.bg} mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">{stat.value}</span>
              <span className="text-xs text-[#a0a0a0] mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Contradictions List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#f5f5f5] mb-5 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            Disputed Claims
          </h2>

          {contradictions.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className="glass-card rounded-xl p-6 md:p-8"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                    c.status === "disputed"
                      ? "bg-red-500/15 text-red-300 border-red-500/25"
                      : "bg-orange-500/15 text-orange-300 border-orange-500/25"
                  }`}
                >
                  {c.status === "disputed" ? "Disputed" : "Possible Contradiction"}
                </span>
                <span className="text-xs text-[#666666]">#{c.id.toString().padStart(3, "0")}</span>
              </div>

              {/* Claims Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-start">
                {/* Claim A */}
                <div className="glass-panel rounded-lg p-5 border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-medium text-amber-300 uppercase tracking-wider">
                      Claim A
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[#f5f5f5] font-medium">
                      <span className="text-yellow-400">{c.claimA.subject}</span>{" "}
                      <span className="text-[#a0a0a0]">{c.claimA.predicate}</span>{" "}
                      <span className="text-[#f5f5f5]">{c.claimA.object}</span>
                    </div>
                    <div className="text-xs text-[#666666]">Source: {c.claimA.source}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${c.claimA.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-yellow-400">
                        {c.claimA.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center justify-center py-2 md:py-0">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <span className="text-red-400 font-bold text-sm">VS</span>
                  </div>
                </div>

                {/* Claim B */}
                <div className="glass-panel rounded-lg p-5 border-l-4 border-l-orange-500">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-medium text-orange-300 uppercase tracking-wider">
                      Claim B
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[#f5f5f5] font-medium">
                      <span className="text-orange-400">{c.claimB.subject}</span>{" "}
                      <span className="text-[#a0a0a0]">{c.claimB.predicate}</span>{" "}
                      <span className="text-[#f5f5f5]">{c.claimB.object}</span>
                    </div>
                    <div className="text-xs text-[#666666]">Source: {c.claimB.source}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full"
                          style={{ width: `${c.claimB.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-orange-400">
                        {c.claimB.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-[#a0a0a0] mt-0.5 shrink-0" />
                  <p className="text-sm text-[#a0a0a0] leading-relaxed">{c.explanation}</p>
                </div>
              </div>

              {/* Resolution Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/10">
                <button className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500/15 text-green-300 hover:bg-green-500/25 transition-colors border border-green-500/25 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Resolved
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-lg bg-orange-500/15 text-orange-300 hover:bg-orange-500/25 transition-colors border border-orange-500/25 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Needs Review
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-lg bg-yellow-400/15 text-amber-300 hover:bg-yellow-400/25 transition-colors border border-yellow-400/25 flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4" />
                  Create Wiki Section
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
