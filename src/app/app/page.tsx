"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  FileText, Database, Lightbulb, AlertTriangle, FolderOpen,
  GitBranch, MessageSquare, Plug, Upload, BookOpen,
  ArrowRight, Zap, Globe, CheckCircle2, XCircle, Clock,
} from "lucide-react";

const stats = [
  { label: "Wiki Pages", value: 9, icon: FileText, href: "/app/wiki", color: "#e63946" },
  { label: "Sources", value: 8, icon: Database, href: "/app/import", color: "#f77f00" },
  { label: "Files", value: 7, icon: FolderOpen, href: "/app/files", color: "#a78bfa" },
  { label: "Entities", value: 18, icon: Lightbulb, href: "/app/graph", color: "#00b4d8" },
  { label: "Claims", value: 18, icon: MessageSquare, href: "/app/ask", color: "#34d399" },
  { label: "Contradictions", value: 2, icon: AlertTriangle, href: "/app/contradictions", color: "#e63946" },
];

const modules = [
  { label: "Connect Sources", desc: "Link Notion, Drive, local files", icon: Plug, href: "/app/connect", accent: "#e63946" },
  { label: "Import Data", desc: "Upload files, paste text, add URLs", icon: Upload, href: "/app/import", accent: "#f77f00" },
  { label: "Browse Wiki", desc: "Read compiled articles", icon: BookOpen, href: "/app/wiki", accent: "#00b4d8" },
  { label: "Explore Graph", desc: "Visualize knowledge network", icon: GitBranch, href: "/app/graph", accent: "#4a7c59" },
  { label: "Ask Questions", desc: "Query your knowledge base", icon: MessageSquare, href: "/app/ask", accent: "#ff69b4" },
  { label: "Organize", desc: "AI suggestions for structure", icon: Database, href: "/app/organize", accent: "#a78bfa" },
];

const connectors = [
  { name: "Google Drive", status: "active", icon: Globe },
  { name: "Notion", status: "active", icon: Database },
  { name: "Local", status: "standby", icon: FolderOpen },
  { name: "Slack", status: "offline", icon: MessageSquare },
  { name: "GitHub", status: "offline", icon: GitBranch },
  { name: "Microsoft", status: "offline", icon: Globe },
];

const recentPages = [
  { title: "What are AI Agents?", summary: "Overview of autonomous AI systems...", slug: "what-are-ai-agents" },
  { title: "Memory Types", summary: "Short-term vs long-term memory in agents...", slug: "memory-types" },
  { title: "Vector Databases", summary: "Pinecone, Weaviate, Chroma comparison...", slug: "vector-databases" },
  { title: "Agent Frameworks", summary: "LangChain, AutoGPT, CrewAI overview...", slug: "agent-frameworks" },
];

export default function AppDashboardPage() {
  return (
    <div className="min-h-screen bg-[#060606] p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-[13px] text-[#888] mt-1">
            AI Agent Memory wiki — 2 of 6 sources connected
          </p>
        </div>
        <Link href="/app/ask" className="q-btn w-fit">
          <Zap className="w-4 h-4" />
          Ask My Wiki
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={stat.href}>
                <div className="q-card hover:border-[#2a2a2a]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3 tracking-wide">Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Link
                  href={mod.href}
                  className="q-card flex items-start gap-4 group hover:border-[#2a2a2a]"
                >
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${mod.accent}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: mod.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white group-hover:text-[#e63946] transition-colors">
                      {mod.label}
                    </p>
                    <p className="text-[13px] text-[#888] mt-0.5">{mod.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#e63946] transition-colors shrink-0 mt-1" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pages */}
        <div className="q-card">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#e63946]" />
            Recent Wiki Pages
          </h2>
          <div className="space-y-2">
            {recentPages.map((page) => (
              <Link
                key={page.slug}
                href={`/app/wiki/${page.slug}`}
                className="flex items-center justify-between p-3 rounded-md bg-[#0c0c0c] hover:bg-[#161616] transition-colors group border border-transparent hover:border-[#1a1a1a]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-white truncate">{page.title}</p>
                  <p className="text-[13px] text-[#888] truncate mt-0.5">{page.summary}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#e63946] shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Connector Status */}
        <div className="q-card">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Plug className="w-4 h-4 text-[#f77f00]" />
            Connector Status
          </h2>
          <div className="space-y-2">
            {connectors.map((conn) => (
              <div
                key={conn.name}
                className="flex items-center justify-between p-3 rounded-md bg-[#0c0c0c] border border-[#1a1a1a]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      conn.status === "active" && "bg-[#4a7c59] shadow-[0_0_6px_#4a7c59]",
                      conn.status === "standby" && "bg-[#f77f00]",
                      conn.status === "offline" && "bg-[#555]"
                    )}
                  />
                  <conn.icon className="w-4 h-4 text-[#888]" />
                  <span className="text-[14px] text-white">{conn.name}</span>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wider",
                    conn.status === "active" && "text-[#4a7c59]",
                    conn.status === "standby" && "text-[#f77f00]",
                    conn.status === "offline" && "text-[#555]"
                  )}
                >
                  {conn.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-md bg-[#e63946]/5 border border-[#e63946]/20">
            <p className="text-[13px] text-[#e63946] font-medium">
              2 contradictions detected
            </p>
            <p className="text-[13px] text-[#888] mt-1">
              Review in the Contradictions module to resolve conflicts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
