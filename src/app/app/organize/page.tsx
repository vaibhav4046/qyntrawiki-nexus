"use client";

import { motion } from "framer-motion";
import {
  FileText,
  FolderOpen,
  Clock,
  AlertTriangle,
  Copy,
  Download,
  FileJson,
  FileCode,
  CheckCircle2,
  XCircle,
  Eye,
  Layers,
  Lightbulb,
  Archive,
  BookOpen,
  GitPullRequest,
  Globe,
  Terminal,
} from "lucide-react";
import { useState } from "react";

const stats = [
  { label: "Total Pages", value: 142, icon: FileText, color: "text-yellow-400" },
  { label: "Uncategorized", value: 23, icon: FolderOpen, color: "text-orange-400" },
  { label: "Stale Files", value: 8, icon: Clock, color: "text-red-400" },
  { label: "Weak Citations", value: 15, icon: AlertTriangle, color: "text-yellow-400" },
  { label: "Duplicate Risk", value: 4, icon: Copy, color: "text-orange-500" },
];

const suggestions = [
  {
    id: 1,
    title: "Create category: AI Concepts",
    description: "Groups HydraDB, Context Graph, LLM Wiki, and 6 other related pages.",
    confidence: 94,
    icon: Layers,
    iconBg: "bg-yellow-400/20",
    iconColor: "text-yellow-400",
  },
  {
    id: 2,
    title: "Create category: Project Ideas",
    description: "Groups Student Job Agent, Personal Knowledge OS, and 3 related pages.",
    confidence: 91,
    icon: Lightbulb,
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
  },
  {
    id: 3,
    title: "Mark as stale: Counter-Vector-DBs.md",
    description: "Last updated 18 months ago. Newer sources contradict its claims.",
    confidence: 87,
    icon: Archive,
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
  },
  {
    id: 4,
    title: "Add more sources to: Vector Search Limitations",
    description: "Coverage score is low (32%). Add recent papers or documentation.",
    confidence: 82,
    icon: BookOpen,
    iconBg: "bg-yellow-400/20",
    iconColor: "text-yellow-400",
  },
  {
    id: 5,
    title: "Resolve contradiction: Vector Database claims",
    description: "Disputed claim detected between two high-confidence sources.",
    confidence: 78,
    icon: GitPullRequest,
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
  },
  {
    id: 6,
    title: "Suggest public: HydraDB, Context Graph, LLM Wiki",
    description: "High confidence pages with strong citations. Ready for public visibility.",
    confidence: 96,
    icon: Globe,
    iconBg: "bg-yellow-400/20",
    iconColor: "text-yellow-400",
  },
];

export default function OrganizePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("qyntra export --format markdown --all");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#f5f5f5] mb-2">
            AI Organization Assistant
          </h1>
          <p className="text-[#a0a0a0] text-lg">
            Intelligent suggestions to structure, curate, and improve your wiki.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass-card rounded-xl p-5 flex flex-col items-center text-center"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
              <span className="text-2xl font-bold text-[#f5f5f5]">{stat.value}</span>
              <span className="text-xs text-[#a0a0a0] mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-[#f5f5f5] mb-5 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggestions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card rounded-xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg ${s.iconBg}`}>
                    <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-400/15 text-amber-300 border border-yellow-400/25">
                    {s.confidence}% confidence
                  </span>
                </div>
                <div>
                  <h3 className="text-[#f5f5f5] font-semibold mb-1">{s.title}</h3>
                  <p className="text-[#a0a0a0] text-sm leading-relaxed">{s.description}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <button className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-yellow-400/20 text-amber-300 hover:bg-yellow-400/30 transition-colors border border-yellow-400/25">
                    Apply
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-white/5 text-[#a0a0a0] hover:bg-white/10 transition-colors border border-white/10">
                    Ignore
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-white/5 text-[#a0a0a0] hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Review
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CLI Bridge Lite */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="glass-panel rounded-xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-lg bg-yellow-400/20">
              <Terminal className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#f5f5f5]">CLI Bridge Lite</h2>
              <p className="text-sm text-[#666666]">Safe export actions for your wiki data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button className="glass-card rounded-lg p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left group">
              <div className="p-2 rounded-md bg-yellow-400/15 group-hover:bg-yellow-400/25 transition-colors">
                <Download className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#f5f5f5]">Download context bundle</div>
                <div className="text-xs text-[#666666]">.zip</div>
              </div>
            </button>
            <button className="glass-card rounded-lg p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left group">
              <div className="p-2 rounded-md bg-yellow-400/15 group-hover:bg-yellow-400/25 transition-colors">
                <FileCode className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#f5f5f5]">Export as Markdown</div>
                <div className="text-xs text-[#666666]">.md</div>
              </div>
            </button>
            <button className="glass-card rounded-lg p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left group">
              <div className="p-2 rounded-md bg-yellow-400/15 group-hover:bg-yellow-400/25 transition-colors">
                <FileJson className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#f5f5f5]">Export as JSON</div>
                <div className="text-xs text-[#666666]">.json</div>
              </div>
            </button>
            <button
              onClick={handleCopy}
              className="glass-card rounded-lg p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left group"
            >
              <div className="p-2 rounded-md bg-yellow-400/15 group-hover:bg-yellow-400/25 transition-colors">
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-[#f5f5f5]">
                  {copied ? "Copied!" : "Copy CLI command"}
                </div>
                <div className="text-xs text-[#666666]">to clipboard</div>
              </div>
            </button>
          </div>

          <div className="rounded-lg bg-black/30 border border-white/10 p-4 font-mono text-sm text-[#a0a0a0] flex items-center justify-between">
            <code>qyntra export --format markdown --all</code>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-[#666666]" />
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
