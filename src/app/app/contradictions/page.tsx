"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle2, Target, ChevronRight, Eye,
} from "lucide-react";

type Severity = "high" | "medium" | "low";

interface Contradiction {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  sources: string[];
  resolved: boolean;
}

const contradictions: Contradiction[] = [
  {
    id: "c1",
    title: "Memory Persistence Conflict",
    description: "Vector DB article says 'persistent' but Agent article says 'ephemeral'.",
    severity: "high",
    sources: ["Vector DBs", "Agent Architecture"],
    resolved: false,
  },
  {
    id: "c2",
    title: "Framework Version Mismatch",
    description: "LangChain guide references v0.1 but ecosystem map shows v0.2.",
    severity: "medium",
    sources: ["LangChain Guide", "Ecosystem Map"],
    resolved: false,
  },
  {
    id: "c3",
    title: "Deployment Cost Paradox",
    description: "Self-hosted section claims $0 but cloud section lists $500/mo.",
    severity: "high",
    sources: ["Self-Hosting", "Cloud Deploy"],
    resolved: true,
  },
];

const severityConfig: Record<Severity, { label: string; color: string; barColor: string }> = {
  high: { label: "High", color: "#e63946", barColor: "bg-[#e63946]" },
  medium: { label: "Medium", color: "#f77f00", barColor: "bg-[#f77f00]" },
  low: { label: "Low", color: "#4a7c59", barColor: "bg-[#4a7c59]" },
};

export default function ContradictionsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const total = contradictions.length;
  const resolved = contradictions.filter((c) => c.resolved).length;
  const open = total - resolved;

  return (
    <div className="min-h-screen bg-[#060606] p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Contradictions</h1>
        <p className="text-[13px] text-[#888] mt-1">
          {open} of {total} issues need resolution
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="q-card text-center">
          <div className="text-2xl font-bold text-[#e63946]">{total}</div>
          <div className="text-[11px] text-[#888] uppercase tracking-wider font-medium mt-1">Total</div>
        </div>
        <div className="q-card text-center">
          <div className="text-2xl font-bold text-[#f77f00]">{open}</div>
          <div className="text-[11px] text-[#888] uppercase tracking-wider font-medium mt-1">Open</div>
        </div>
        <div className="q-card text-center">
          <div className="text-2xl font-bold text-[#4a7c59]">{resolved}</div>
          <div className="text-[11px] text-[#888] uppercase tracking-wider font-medium mt-1">Resolved</div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {contradictions.map((c, i) => {
          const sev = severityConfig[c.severity];
          const isExpanded = expanded === c.id;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "q-card",
                c.resolved && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {c.resolved ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4a7c59] shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#e63946] shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[15px] font-semibold text-white">{c.title}</h3>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${sev.color}15`,
                          color: sev.color,
                        }}
                      >
                        {sev.label}
                      </span>
                      {c.resolved && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#4a7c59]/15 text-[#4a7c59]">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#888] mt-1">{c.description}</p>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-[#1a1a1a]"
                      >
                        <p className="text-[12px] text-[#555] font-medium mb-2 uppercase tracking-wider">
                          Conflicting Sources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {c.sources.map((s) => (
                            <span
                              key={s}
                              className="text-[12px] px-2 py-1 rounded bg-[#e63946]/10 text-[#e63946] border border-[#e63946]/20"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : c.id)}
                    className="q-btn-ghost text-[12px] py-2 px-3"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isExpanded ? "Hide" : "View"}
                  </button>
                  {!c.resolved && (
                    <button className="q-btn text-[12px] py-2 px-3">
                      Resolve
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
