"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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
    description:
      "Vector DB article says 'persistent' but Agent article says 'ephemeral'.",
    severity: "high",
    sources: ["Vector DBs", "Agent Architecture"],
    resolved: false,
  },
  {
    id: "c2",
    title: "Framework Version Mismatch",
    description:
      "LangChain guide references v0.1 but ecosystem map shows v0.2.",
    severity: "medium",
    sources: ["LangChain Guide", "Ecosystem Map"],
    resolved: false,
  },
  {
    id: "c3",
    title: "Deployment Cost Paradox",
    description:
      "Self-hosted section claims $0 but cloud section lists $500/mo.",
    severity: "high",
    sources: ["Self-Hosting", "Cloud Deploy"],
    resolved: true,
  },
];

const bossNames: Record<string, string> = {
  c1: "CONFLICT TITAN",
  c2: "LOGIC GOLIATH",
  c3: "PARADOX SENTINEL",
};

const severityConfig: Record<
  Severity,
  { health: number; color: string; label: string; barColor: string }
> = {
  high: {
    health: 100,
    color: "#e63946",
    label: "EXTREME",
    barColor: "bg-[#e63946]",
  },
  medium: {
    health: 60,
    color: "#f77f00",
    label: "MODERATE",
    barColor: "bg-[#f77f00]",
  },
  low: {
    health: 30,
    color: "#4a7c59",
    label: "MINOR",
    barColor: "bg-[#4a7c59]",
  },
};

function BossSprite({ severity }: { severity: Severity }) {
  const color = severityConfig[severity].color;
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Central body */}
      <div
        className="absolute w-10 h-12"
        style={{ backgroundColor: color, opacity: 0.9 }}
      />
      {/* Side cannons */}
      <div
        className="absolute left-2 top-4 w-3 h-8"
        style={{ backgroundColor: color, opacity: 0.7 }}
      />
      <div
        className="absolute right-2 top-4 w-3 h-8"
        style={{ backgroundColor: color, opacity: 0.7 }}
      />
      {/* Top spike */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: `10px solid ${color}`,
          opacity: 0.9,
        }}
      />
      {/* Eye */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full"
        style={{
          boxShadow: `0 0 8px 2px ${color}`,
        }}
      >
        <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full" />
      </div>
      {/* Bottom base */}
      <div
        className="absolute bottom-2 w-14 h-3"
        style={{ backgroundColor: color, opacity: 0.5 }}
      />
    </div>
  );
}

export default function ContradictionsPage() {
  const [scannedId, setScannedId] = useState<string | null>(null);

  const totalThreats = contradictions.length;
  const resolvedThreats = contradictions.filter((c) => c.resolved).length;

  return (
    <div className="min-h-screen bg-black p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="font-[Press_Start_2P] text-2xl md:text-4xl text-[#e63946] mb-3 tracking-wider"
          >
            BOSS ENCOUNTER
          </motion.h1>
          <p className="font-[VT323] text-xl md:text-2xl text-[#a0a0a0] tracking-wide">
            THREATS DETECTED IN INTEL
          </p>
        </div>

        {/* Boss Rush Counter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-10 flex items-center justify-center gap-4"
        >
          <div className="border-2 border-[#e63946] px-6 py-3 bg-[#e63946]/10">
            <span className="font-[Press_Start_2P] text-[10px] text-[#e63946] block mb-1 text-center">
              BOSS RUSH COUNTER
            </span>
            <div className="flex items-center gap-3 font-[VT323] text-2xl">
              <span className="text-[#f77f00]">{resolvedThreats}</span>
              <span className="text-[#666]">/</span>
              <span className="text-[#e63946]">{totalThreats}</span>
              <span className="text-[#a0a0a0] text-lg ml-2">DEFEATED</span>
            </div>
          </div>
        </motion.div>

        {/* Boss Cards */}
        <div className="space-y-8">
          {contradictions.map((boss, index) => {
            const config = severityConfig[boss.severity];
            const isScanned = scannedId === boss.id;

            return (
              <motion.div
                key={boss.id}
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  delay: 0.5 + index * 0.3,
                  duration: 0.6,
                  type: "spring",
                }}
                className="relative"
              >
                {/* Warning siren flash */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.35, 0] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-lg border-4 border-[#e63946] pointer-events-none z-10"
                />

                <div className="relative bg-[#111] border-2 border-[#333] rounded-lg p-6 md:p-8 overflow-hidden">
                  {/* Defeated overlay */}
                  {boss.resolved && (
                    <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                      <span className="font-[Press_Start_2P] text-[#4a7c59] text-xl md:text-2xl transform -rotate-12 border-4 border-[#4a7c59] px-4 py-2">
                        DEFEATED
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    {/* Left: Sprite + Health */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <BossSprite severity={boss.severity} />

                      {/* Health Bar */}
                      <div className="w-24 space-y-1">
                        <div className="flex justify-between font-[Press_Start_2P] text-[8px]">
                          <span className="text-[#e63946]">HP</span>
                          <span style={{ color: config.color }}>
                            {config.label}
                          </span>
                        </div>
                        <div className="h-3 bg-[#222] border border-[#444] relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${config.health}%` }}
                            transition={{
                              delay: 0.8 + index * 0.3,
                              duration: 1,
                              ease: "easeOut",
                            }}
                            className={`h-full ${config.barColor}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Boss Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-[Press_Start_2P] text-sm md:text-base text-[#f5f5f5] mb-2 leading-relaxed">
                        {bossNames[boss.id]}
                      </h2>
                      <p className="font-[VT323] text-lg text-[#a0a0a0] mb-4">
                        {boss.title}
                      </p>

                      {/* Weakness Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="font-[Press_Start_2P] text-[8px] text-[#666] mr-1 self-center">
                          WEAKNESS:
                        </span>
                        {boss.sources.map((source) => (
                          <span
                            key={source}
                            className="px-2 py-1 border border-[#f77f00] text-[#f77f00] font-[VT323] text-sm rounded-sm"
                          >
                            {source}
                          </span>
                        ))}
                      </div>

                      {/* Scan Results */}
                      <AnimatePresence>
                        {isScanned && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mb-4"
                          >
                            <div className="p-3 bg-[#1a1a1a] border border-[#333] rounded font-[VT323] text-base text-[#ccc]">
                              {boss.description}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          disabled={boss.resolved}
                          className={`pixel-btn pixel-btn-red text-[10px] font-[Press_Start_2P] py-2 px-4 ${
                            boss.resolved
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          ATTACK
                        </button>
                        <button
                          onClick={() =>
                            setScannedId(isScanned ? null : boss.id)
                          }
                          className="pixel-btn pixel-btn-solid text-[10px] font-[Press_Start_2P] py-2 px-4"
                        >
                          {isScanned ? "CLOSE SCAN" : "SCAN"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
