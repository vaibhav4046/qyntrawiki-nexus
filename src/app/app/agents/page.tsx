"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Bot,
  Play,
  Check,
  Loader2,
  Sparkles,
  FileSearch,
  AlertTriangle,
  Calendar,
  FolderSync,
  Globe,
  GraduationCap,
  BookOpen,
  Shield,
  RefreshCw,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "idle" | "ready" | "running" | "completed";
}

const agents: Agent[] = [
  { id: "citation", name: "Citation Agent", description: "Checks pages for missing or weak citations", icon: FileSearch, status: "idle" },
  { id: "contradiction", name: "Contradiction Agent", description: "Finds disputed claims across files and sources", icon: AlertTriangle, status: "idle" },
  { id: "daily", name: "Daily Memory Agent", description: "Summarizes new changes for the daily sidebar", icon: Calendar, status: "idle" },
  { id: "indexer", name: "Indexer Agent", description: "Watches approved folders and creates local file records", icon: FolderSync, status: "ready" },
  { id: "organizer", name: "Organizer Agent", description: "Suggests safe file and wiki organization plans", icon: RefreshCw, status: "idle" },
  { id: "publisher", name: "Publisher Agent", description: "Reviews public-safe pages before publishing", icon: Globe, status: "idle" },
  { id: "study", name: "Study Agent", description: "Creates flashcards and study plans from selected pages", icon: GraduationCap, status: "idle" },
  { id: "compiler", name: "Wiki Compiler Agent", description: "Turns sources into personal Wikipedia pages", icon: BookOpen, status: "ready" },
];

export default function AgentsPage() {
  const [agentStatuses, setAgentStatuses] = useState<Record<string, Agent["status"]>>(
    Object.fromEntries(agents.map((a) => [a.id, a.status]))
  );
  const [running, setRunning] = useState<string | null>(null);

  async function runAgent(id: string) {
    setRunning(id);
    setAgentStatuses((prev) => ({ ...prev, [id]: "running" }));

    // Simulate agent work
    await new Promise((r) => setTimeout(r, 2000));

    setAgentStatuses((prev) => ({ ...prev, [id]: "completed" }));
    setRunning(null);

    // Reset after 3 seconds
    setTimeout(() => {
      setAgentStatuses((prev) => ({ ...prev, [id]: "ready" }));
    }, 3000);
  }

  const statusConfig: Record<Agent["status"], { label: string; color: string; bg: string }> = {
    idle: { label: "idle", color: "text-[#6b6560]", bg: "bg-[rgba(107,101,96,0.1)]" },
    ready: { label: "ready", color: "text-[#fbbf24]", bg: "bg-[rgba(245,158,11,0.15)]" },
    running: { label: "running", color: "text-[#60a5fa]", bg: "bg-[rgba(59,130,246,0.15)]" },
    completed: { label: "completed", color: "text-green-400", bg: "bg-[rgba(34,197,94,0.15)]" },
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#f5f0eb]">Agent Control Room</h1>
        <p className="mt-1 text-sm text-[#a89f91]">
          Safe, reviewable workspace agents — no destructive file operations without approval
        </p>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10">
        {/* Safety notice */}
        <div className="glass-panel rounded-lg p-4 mb-6 flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#fbbf24] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#f5f0eb]">Review Before Apply</p>
            <p className="text-xs text-[#a89f91]">
              Agents generate proposals. Destructive file operations require a separate approval step.
            </p>
          </div>
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {agents.map((agent, idx) => {
            const Icon = agent.icon;
            const status = agentStatuses[agent.id];
            const cfg = statusConfig[status];
            const isRunning = running === agent.id;

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", cfg.bg)}>
                    <Icon className={cn("w-5 h-5", cfg.color)} />
                  </div>
                  <span className={cn("badge text-[10px]", cfg.bg, cfg.color)}>
                    {isRunning ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : status === "completed" ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : null}
                    {cfg.label}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#f5f0eb] mb-1">{agent.name}</h3>
                <p className="text-xs text-[#a89f91] mb-4 leading-relaxed">{agent.description}</p>

                <button
                  onClick={() => runAgent(agent.id)}
                  disabled={isRunning}
                  className={cn(
                    "w-full py-2 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2",
                    isRunning
                      ? "bg-[rgba(59,130,246,0.15)] text-[#60a5fa] cursor-not-allowed"
                      : "btn-secondary"
                  )}
                >
                  {isRunning ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running...</>
                  ) : (
                    <><Play className="w-3.5 h-3.5" /> Run Review</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
