"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, FileText, BookOpen, Database, Lightbulb, Target, Lock, Unlock, Trophy, Eye, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

/* ─── Contra NES Pixel Art Sprite Data ─── */
// 2px per pixel, scaled up
const PIXEL = 2;

/* ─── Pixel Art: Player Soldier (Bill Rizer) ─── */
function PlayerSprite({ pose }: { pose: "idle" | "run" | "shoot" }) {
  const soldierPixels = [
    // Head & helmet (top rows)
    [0,0,"#111"],[1,0,"#111"],[2,0,"#111"],[3,0,"#111"],[4,0,"#111"],
    [0,1,"#111"],[1,1,"#fdbf60"],[2,1,"#fdbf60"],[3,1,"#fdbf60"],[4,1,"#111"],
    [0,2,"#fdbf60"],[1,2,"#111"],[2,2,"#fdbf60"],[3,2,"#111"],[4,2,"#fdbf60"],
    // Body & arms
    [0,3,"#fdbf60"],[1,3,"#fdbf60"],[2,3,"#fdbf60"],[3,3,"#fdbf60"],[4,3,"#fdbf60"],
    [0,4,"#111"],[1,4,"#e63946"],[2,4,"#e63946"],[3,4,"#e63946"],[4,4,"#111"],
    [0,5,"#111"],[1,5,"#e63946"],[2,5,"#e63946"],[3,5,"#e63946"],[4,5,"#111"],
    [0,6,"#fdbf60"],[1,6,"#e63946"],[2,6,"#111"],[3,6,"#e63946"],[4,6,"#fdbf60"],
    // Belt & legs
    [0,7,"#111"],[1,7,"#111"],[2,7,"#f77f00"],[3,7,"#111"],[4,7,"#111"],
    [0,8,"#e63946"],[1,8,"#e63946"],[2,8,"#e63946"],[3,8,"#e63946"],[4,8,"#e63946"],
    [0,9,"#e63946"],[1,9,"#111"],[2,9,"#e63946"],[3,9,"#111"],[4,9,"#e63946"],
    [0,10,"#4a7c59"],[1,10,"#4a7c59"],[2,10,"#4a7c59"],[3,10,"#4a7c59"],[4,10,"#4a7c59"],
    [0,11,"#4a7c59"],[1,11,"#4a7c59"],[2,11,"#4a7c59"],[3,11,"#4a7c59"],[4,11,"#4a7c59"],
  ];

  const gunPixels = pose === "shoot" ? [
    [5,5,"#4a7c59"],[6,5,"#4a7c59"],[7,5,"#4a7c59"],
    [5,6,"#f77f00"],[6,6,"#f77f00"],
  ] : [];

  const shadows = soldierPixels.map(([x,y,c]) => `${x*PIXEL}px ${y*PIXEL}px 0 ${c}`);
  const gunShadows = gunPixels.map(([x,y,c]) => `${x*PIXEL}px ${y*PIXEL}px 0 ${c}`);

  return (
    <div className="relative" style={{ width: (pose==="shoot"?8:5)*PIXEL, height: 12*PIXEL }}>
      <div className="absolute top-0 left-0" style={{
        width: PIXEL, height: PIXEL,
        boxShadow: shadows.join(", "),
      }} />
      {pose === "shoot" && (
        <div className="absolute top-0 left-0" style={{
          width: PIXEL, height: PIXEL,
          boxShadow: gunShadows.join(", "),
        }} />
      )}
    </div>
  );
}

/* ─── Pixel Art: Enemy Soldier ─── */
function EnemySprite({ variant }: { variant: "standing" | "shooting" }) {
  const pixels = variant === "standing" ? [
    [0,0,"#6b3a8f"],[1,0,"#6b3a8f"],[2,0,"#6b3a8f"],[3,0,"#6b3a8f"],
    [0,1,"#8b5a3c"],[1,1,"#e63946"],[2,1,"#e63946"],[3,1,"#8b5a3c"],
    [0,2,"#8b5a3c"],[1,2,"#6b3a8f"],[2,2,"#6b3a8f"],[3,2,"#8b5a3c"],
    [0,3,"#6b3a8f"],[1,3,"#6b3a8f"],[2,3,"#6b3a8f"],[3,3,"#6b3a8f"],
    [0,4,"#111"],[1,4,"#8b5a3c"],[2,4,"#8b5a3c"],[3,4,"#111"],
    [0,5,"#8b5a3c"],[1,5,"#111"],[2,5,"#8b5a3c"],[3,5,"#111"],
  ] : [
    [0,0,"#6b3a8f"],[1,0,"#6b3a8f"],[2,0,"#6b3a8f"],[3,0,"#6b3a8f"],
    [0,1,"#8b5a3c"],[1,1,"#e63946"],[2,1,"#e63946"],[3,1,"#8b5a3c"],
    [0,2,"#8b5a3c"],[1,2,"#6b3a8f"],[2,2,"#6b3a8f"],[3,2,"#8b5a3c"],
    [0,3,"#6b3a8f"],[1,3,"#6b3a8f"],[2,3,"#6b3a8f"],[3,3,"#6b3a8f"],
    [0,4,"#111"],[1,4,"#8b5a3c"],[2,4,"#8b5a3c"],[3,4,"#111"],
    [4,4,"#4a7c59"],[5,4,"#4a7c59"],
    [0,5,"#8b5a3c"],[1,5,"#111"],[2,5,"#8b5a3c"],[3,5,"#111"],
  ];

  const shadows = pixels.map(([x,y,c]) => `${x*PIXEL}px ${y*PIXEL}px 0 ${c}`);
  return (
    <div style={{ width: (variant==="shooting"?6:4)*PIXEL, height: 6*PIXEL }}>
      <div style={{ width: PIXEL, height: PIXEL, boxShadow: shadows.join(", ") }} />
    </div>
  );
}

/* ─── Pixel Art: Power-up Capsule (File) ─── */
function CapsuleSprite({ letter, color }: { letter: string; color: string }) {
  // Contra-style flashing capsule
  const capsulePixels = [
    [1,0,"#e63946"],[2,0,"#e63946"],[3,0,"#e63946"],
    [0,1,"#e63946"],[1,1,"#fff"],[2,1,color],[3,1,"#fff"],[4,1,"#e63946"],
    [0,2,"#e63946"],[1,2,color],[2,2,color],[3,2,color],[4,2,"#e63946"],
    [0,3,"#e63946"],[1,3,color],[2,3,color],[3,3,color],[4,3,"#e63946"],
    [1,4,"#e63946"],[2,4,"#e63946"],[3,4,"#e63946"],
  ];

  const shadows = capsulePixels.map(([x,y,c]) => `${x*PIXEL}px ${y*PIXEL}px 0 ${c}`);
  return (
    <div className="relative inline-block animate-pulse" style={{ width: 5*PIXEL, height: 5*PIXEL }}>
      <div style={{ width: PIXEL, height: PIXEL, boxShadow: shadows.join(", ") }} />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-[VT323] font-bold text-white z-10" style={{ marginTop: 2, marginLeft: 2 }}>
        {letter}
      </span>
    </div>
  );
}

/* ─── Pixel Art: Palm Tree ─── */
function PalmTreeSprite() {
  const trunk = [
    [2,8,"#8b5a3c"],[2,9,"#8b5a3c"],[2,10,"#8b5a3c"],[2,11,"#8b5a3c"],
  ];
  const leaves = [
    [0,4,"#4a7c59"],[1,4,"#4a7c59"],[2,4,"#2d5a3e"],[3,4,"#4a7c59"],[4,4,"#4a7c59"],
    [0,5,"#4a7c59"],[1,5,"#2d5a3e"],[2,5,"#2d5a3e"],[3,5,"#2d5a3e"],[4,5,"#4a7c59"],
    [0,6,"#4a7c59"],[1,6,"#4a7c59"],[2,6,"#4a7c59"],[3,6,"#4a7c59"],[4,6,"#4a7c59"],
    [1,7,"#2d5a3e"],[2,7,"#2d5a3e"],[3,7,"#2d5a3e"],
  ];
  const all = [...trunk, ...leaves];
  const shadows = all.map(([x,y,c]) => `${x*PIXEL}px ${y*PIXEL}px 0 ${c}`);
  return (
    <div style={{ width: 5*PIXEL, height: 12*PIXEL }}>
      <div style={{ width: PIXEL, height: PIXEL, boxShadow: shadows.join(", ") }} />
    </div>
  );
}

/* ─── Pixel Art: Turret ─── */
function TurretSprite() {
  const pixels = [
    [0,3,"#666"],[1,3,"#666"],[2,3,"#666"],[3,3,"#666"],
    [1,2,"#888"],[2,2,"#888"],
    [1,1,"#e63946"],[2,1,"#e63946"],
    [2,0,"#e63946"],
  ];
  const shadows = pixels.map(([x,y,c]) => `${x*PIXEL}px ${y*PIXEL}px 0 ${c}`);
  return (
    <div style={{ width: 4*PIXEL, height: 4*PIXEL }}>
      <div style={{ width: PIXEL, height: PIXEL, boxShadow: shadows.join(", ") }} />
    </div>
  );
}

/* ─── File Data ─── */
interface FileItem {
  id: string;
  name: string;
  type: "doc" | "pdf" | "code";
  weapon: string;
  x: number; // percent left
  y: number; // percent from bottom
  color: string;
  summary: string;
  body: string;
  tags: string[];
  unlocked: boolean;
}

const files: FileItem[] = [
  { id: "f1", name: "HydraDB Overview", type: "doc", weapon: "S", x: 10, y: 22, color: "#e63946",
    summary: "Graph-vector database for AI agents", body: "HydraDB combines vector search with graph traversal, enabling AI agents to retrieve contextually relevant information while understanding relationships between entities. Unlike traditional vector DBs that only store embeddings, HydraDB maintains explicit edges between documents, entities, and claims.", tags: ["database", "vector", "graph"], unlocked: true },
  { id: "f2", name: "Context Graph Pattern", type: "doc", weapon: "L", x: 25, y: 22, color: "#00b4d8",
    summary: "Knowledge graphs powering agent memory", body: "Context graphs represent the working memory of an AI agent. Each node is a piece of information, and edges represent semantic relationships. When an agent processes a query, it traverses this graph to build a context window.", tags: ["graph", "memory"], unlocked: true },
  { id: "f3", name: "LLM Wiki Spec", type: "doc", weapon: "F", x: 40, y: 45, color: "#f77f00",
    summary: "Auto-generating wikis from sources", body: "The LLM Wiki pattern involves using language models to continuously ingest sources, extract entities and claims, and compile them into readable articles. This creates a self-updating knowledge base.", tags: ["llm", "wiki"], unlocked: true },
  { id: "f4", name: "Vector Search Limits", type: "pdf", weapon: "M", x: 55, y: 22, color: "#4a7c59",
    summary: "Why pure vectors aren't enough", body: "Vector search based on cosine similarity has fundamental limitations: it cannot express complex relational queries, it struggles with multi-hop reasoning, and it treats all dimensions equally.", tags: ["vector", "limits"], unlocked: false },
  { id: "f5", name: "RAG vs Wiki", type: "doc", weapon: "R", x: 70, y: 45, color: "#ff69b4",
    summary: "Stateful vs stateless retrieval", body: "RAG is stateless — each query starts from scratch. A wiki is stateful — it accumulates knowledge over time. The best systems combine both: RAG for freshness, wiki for depth.", tags: ["rag", "wiki"], unlocked: true },
  { id: "f6", name: "Agent Memory", type: "pdf", weapon: "S", x: 85, y: 22, color: "#e63946",
    summary: "Short and long-term memory", body: "Agents need both working memory (current context) and episodic memory (past interactions). Vector DBs store the former; knowledge graphs store the latter.", tags: ["memory", "agents"], unlocked: true },
  { id: "f7", name: "Contradiction Detection", type: "doc", weapon: "L", x: 33, y: 22, color: "#00b4d8",
    summary: "Finding conflicting claims", body: "As a knowledge base grows, contradictions naturally emerge. LLM-based claim comparison flags inconsistencies across sources for user resolution.", tags: ["quality", "claims"], unlocked: true },
  { id: "f8", name: "Deployment Guide", type: "pdf", weapon: "F", x: 48, y: 22, color: "#f77f00",
    summary: "Self-hosted vs cloud", body: "Cost analysis and infrastructure setup for running your own wiki. Covers Docker, Kubernetes, and serverless deployment patterns.", tags: ["deploy", "ops"], unlocked: true },
  { id: "f9", name: "API Reference", type: "code", weapon: "M", x: 62, y: 22, color: "#4a7c59",
    summary: "REST and GraphQL endpoints", body: "Complete API documentation with examples. Includes authentication, rate limiting, and webhook specifications.", tags: ["api", "docs"], unlocked: false },
  { id: "f10", name: "Job Agent", type: "doc", weapon: "R", x: 77, y: 22, color: "#ff69b4",
    summary: "Job matching system", body: "Using personal knowledge graph to match student skills with job requirements. Extracts and maps skill entities between profiles and listings.", tags: ["jobs", "matching"], unlocked: true },
  { id: "f11", name: "PK OS", type: "doc", weapon: "S", x: 18, y: 45, color: "#e63946",
    summary: "Personal Knowledge OS", body: "A unified system integrating notes, documents, bookmarks, and conversations into a single queryable graph with AI-powered suggestions.", tags: ["pkos", "productivity"], unlocked: true },
  { id: "f12", name: "Benchmarks", type: "pdf", weapon: "L", x: 92, y: 22, color: "#00b4d8",
    summary: "Performance data", body: "Query latency and throughput benchmarks comparing HydraDB against Pinecone, Neo4j, and Weaviate under various load patterns.", tags: ["perf", "data"], unlocked: false },
];

/* ─── Enemy Data ─── */
interface Enemy { x: number; y: number; variant: "standing" | "shooting"; direction: number; }
const enemies: Enemy[] = [
  { x: 20, y: 24, variant: "standing", direction: 1 },
  { x: 45, y: 24, variant: "shooting", direction: -1 },
  { x: 60, y: 47, variant: "standing", direction: 1 },
  { x: 82, y: 24, variant: "shooting", direction: -1 },
  { x: 35, y: 24, variant: "standing", direction: 1 },
];

/* ─── File Modal ─── */
function FileModal({ file, onClose }: { file: FileItem; onClose: () => void }) {
  const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
    doc: { icon: BookOpen, color: "#e63946", label: "Document" },
    pdf: { icon: FileText, color: "#f77f00", label: "PDF" },
    code: { icon: Database, color: "#00b4d8", label: "Code" },
  };
  const config = typeConfig[file.type] || typeConfig.doc;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#080808] border-2 border-[#e63946] max-w-xl w-full max-h-[80vh] flex flex-col relative"
        style={{ imageRendering: "pixelated" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#e63946]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#e63946]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#e63946]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#e63946]" />

        {/* Header */}
        <div className="p-5 border-b border-[#e63946]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 flex items-center justify-center" style={{ borderColor: file.color }}>
              <Icon className="w-5 h-5" style={{ color: file.color }} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-white font-[VT323]">{file.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[#888] font-[VT323] uppercase">{config.label}</span>
                <span className="text-[10px] text-[#f77f00] font-[VT323] font-bold">WEAPON: {file.weapon}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="border border-[#222] bg-[#0a0a0a] p-4 mb-4">
            <p className="text-[13px] text-[#ccc] font-[VT323] leading-relaxed">{file.body}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {file.tags.map((t) => (
              <span key={t} className="text-[11px] px-2 py-1 bg-[#1a1a1a] text-[#888] border border-[#222] font-[VT323]">#{t}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e63946]/30 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#f77f00]" />
            <span className="text-[12px] text-[#f77f00] font-[VT323]">ACQUIRED: {file.weapon} WEAPON</span>
          </div>
          <button onClick={onClose} className="bg-[#e63946] hover:bg-[#ff2a3a] text-white px-5 py-2 text-[13px] font-[VT323] font-semibold transition-colors">
            CLOSE
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Side Panel ─── */
function SidePanel({ file, onOpen, onClose }: { file: FileItem; onOpen: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="w-[320px] shrink-0 border-l-2 border-[#e63946] bg-[#060606] flex flex-col"
    >
      <div className="p-4 border-b-2 border-[#e63946] flex items-center justify-between">
        <span className="text-[12px] text-[#e63946] font-[VT323] uppercase tracking-wider font-bold">Intel Acquired</span>
        <button onClick={onClose} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 border border-[#e63946] bg-[#e63946]/10 flex items-center justify-center">
            <CapsuleSprite letter={file.weapon} color={file.color} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white font-[VT323]">{file.name}</p>
            <p className="text-[11px] text-[#888] font-[VT323]">{file.type.toUpperCase()}</p>
          </div>
        </div>
        <p className="text-[13px] text-[#888] font-[VT323] mt-2">{file.summary}</p>
        <button
          onClick={onOpen}
          className="w-full mt-4 bg-[#e63946] hover:bg-[#ff2a3a] text-white py-2.5 text-[13px] font-[VT323] font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" /> OPEN FILE
        </button>
        {!file.unlocked && (
          <div className="mt-3 p-2.5 border border-[#f77f00]/30 bg-[#f77f00]/5 text-center">
            <Lock className="w-4 h-4 text-[#f77f00] mx-auto mb-1" />
            <p className="text-[11px] text-[#f77f00] font-[VT323]">LOCKED - DEFEAT GUARD TO UNLOCK</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function ContraMapPage() {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [openFile, setOpenFile] = useState<FileItem | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 5, y: 24 });
  const [playerPose, setPlayerPose] = useState<"idle" | "run" | "shoot">("idle");
  const [acquired, setAcquired] = useState<Set<string>>(new Set());
  const [explosions, setExplosions] = useState<{ id: string; x: number; y: number }[]>([]);
  const gameRef = useRef<HTMLDivElement>(null);

  const handleFileClick = useCallback((file: FileItem) => {
    setPlayerPose("run");
    setPlayerPos({ x: file.x, y: file.y });
    
    setTimeout(() => {
      setPlayerPose("shoot");
      setExplosions((prev) => [...prev, { id: file.id, x: file.x, y: file.y }]);
      setAcquired((prev) => new Set([...prev, file.id]));
      setTimeout(() => setExplosions((prev) => prev.filter((e) => e.id !== file.id)), 600);
      setTimeout(() => {
        setPlayerPose("idle");
        setSelectedFile(file);
      }, 300);
    }, 400);
  }, []);

  const unlockedCount = acquired.size;
  const totalCount = files.length;
  const percent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col">
      {/* HUD */}
      <div className="bg-[#080808] border-b-2 border-[#e63946] px-4 py-2 flex items-center justify-between font-[VT323] shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-[#e63946] block">1P SCORE</span>
            <span className="text-[14px] text-white">{unlockedCount * 5000}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#f77f00] block">HI SCORE</span>
            <span className="text-[14px] text-[#f77f00]">{totalCount * 5000}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-[#e63946] block">REST</span>
            <div className="flex gap-1">
              {[1,2,3].map((i) => (
                <div key={i} className="w-2.5 h-2.5 bg-[#e63946]" style={{
                  boxShadow: `${PIXEL}px 0 0 #fdbf60, ${PIXEL*2}px 0 0 #fdbf60, 0 ${PIXEL}px 0 #e63946, ${PIXEL}px ${PIXEL}px 0 #e63946, ${PIXEL*2}px ${PIXEL}px 0 #e63946`
                }} />
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[#4a7c59] block">STAGE</span>
            <span className="text-[14px] text-[#4a7c59]">1</span>
          </div>
          <div>
            <span className="text-[10px] text-[#f77f00] block">WEAPON</span>
            <span className="text-[10px] text-[#f77f00]">SPREAD</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex overflow-hidden">
        <div ref={gameRef} className="flex-1 relative overflow-hidden select-none" style={{ background: "linear-gradient(180deg, #1a2a3a 0%, #2a3a4a 30%, #1a3a1a 70%, #0d1a0d 100%)" }}>
          {/* Parallax Mountains */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(0,0,0,0.1) 80px, rgba(0,0,0,0.1) 82px)`,
          }} />

          {/* Bridge */}
          <div className="absolute left-1/4 right-1/4 top-[55%] h-3 bg-[#8b5a3c] border-t border-[#a67c52]" />
          <div className="absolute left-1/4 right-1/4 top-[55%] h-8 flex items-end gap-8 justify-center opacity-30">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="w-1 h-full bg-[#5a3a1c]" />
            ))}
          </div>

          {/* Water under bridge */}
          <div className="absolute left-1/4 right-1/4 top-[58%] bottom-[20%] bg-[#1a3a4a]/40" />

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-[22%] bg-[#2d3a1e] border-t-2 border-[#4a5a2e]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#3a4a2e]" />
          </div>

          {/* Trees */}
          <div className="absolute left-[5%] bottom-[20%]"><PalmTreeSprite /></div>
          <div className="absolute left-[15%] bottom-[22%]"><PalmTreeSprite /></div>
          <div className="absolute left-[50%] bottom-[20%]"><PalmTreeSprite /></div>
          <div className="absolute left-[75%] bottom-[22%]"><PalmTreeSprite /></div>
          <div className="absolute right-[5%] bottom-[20%]"><PalmTreeSprite /></div>

          {/* Bridge trees */}
          <div className="absolute left-[35%] bottom-[42%]"><PalmTreeSprite /></div>
          <div className="absolute left-[65%] bottom-[42%]"><PalmTreeSprite /></div>

          {/* Turrets */}
          <div className="absolute left-[28%] bottom-[22%]"><TurretSprite /></div>
          <div className="absolute left-[72%] bottom-[42%]"><TurretSprite /></div>

          {/* Enemies */}
          {enemies.map((enemy, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${enemy.x}%`, bottom: `${enemy.y}%` }}
              animate={{ x: [0, enemy.direction * 20, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
            >
              <EnemySprite variant={enemy.variant} />
            </motion.div>
          ))}

          {/* File Capsules */}
          {files.map((file) => (
            <motion.button
              key={file.id}
              className="absolute z-20 group"
              style={{ left: `${file.x}%`, bottom: `${file.y}%` }}
              onClick={() => handleFileClick(file)}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: parseInt(file.id.slice(1)) * 0.2 }}
              whileHover={{ scale: 1.3 }}
            >
              <div className="relative">
                <CapsuleSprite letter={file.weapon} color={file.color} />
                {/* Label */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-white font-[VT323] bg-black/80 px-1.5 py-0.5">{file.name}</span>
                </div>
                {/* Acquired indicator */}
                {acquired.has(file.id) && (
                  <div className="absolute -top-1 -right-1">
                    <Trophy className="w-3 h-3 text-[#f77f00]" />
                  </div>
                )}
              </div>
            </motion.button>
          ))}

          {/* Explosions */}
          <AnimatePresence>
            {explosions.map((exp) => (
              <motion.div
                key={exp.id}
                className="absolute z-30 pointer-events-none"
                style={{ left: `${exp.x}%`, bottom: `${exp.y}%` }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [1, 2, 2.5], opacity: [1, 0.8, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-8 h-8 rounded-full" style={{
                  background: "radial-gradient(circle, #ff9500 0%, #e63946 40%, transparent 70%)",
                  boxShadow: "0 0 20px #f77f00, 0 0 40px #e63946",
                }} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Player */}
          <motion.div
            className="absolute z-40"
            animate={{ left: `${playerPos.x}%`, bottom: `${playerPos.y}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
          >
            <PlayerSprite pose={playerPose} />
          </motion.div>

          {/* Progress bar at bottom */}
          <div className="absolute bottom-2 left-4 right-4 z-50">
            <div className="flex items-center justify-between mb-1 font-[VT323]">
              <span className="text-[11px] text-[#f77f00]">MISSION PROGRESS</span>
              <span className="text-[11px] text-white">{unlockedCount}/{totalCount} Intel</span>
            </div>
            <div className="h-2 bg-[#1a1a1a] border border-[#333]">
              <motion.div
                className="h-full bg-[#e63946]"
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {selectedFile && (
            <SidePanel
              file={selectedFile}
              onOpen={() => setOpenFile(selectedFile)}
              onClose={() => setSelectedFile(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* File Modal */}
      <AnimatePresence>
        {openFile && (
          <FileModal file={openFile} onClose={() => setOpenFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
