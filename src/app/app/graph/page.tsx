"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search, FileText, BookOpen, Database, Lightbulb, Target, X,
  ChevronRight, Zap, Eye, Brain, MapPin, Flame, Lock, Unlock,
  Crosshair, Skull, Trophy, ChevronDown, ChevronUp, FolderOpen,
  ArrowRight, Navigation, Compass,
} from "lucide-react";
import Link from "next/link";

/* ─── Map Tile Types ─── */
type Terrain = "jungle" | "base" | "water" | "mountain" | "road" | "empty";

interface MapTile {
  x: number;
  y: number;
  terrain: Terrain;
}

interface MapItem {
  id: string;
  x: number;
  y: number;
  title: string;
  type: "page" | "source" | "entity" | "claim" | "file";
  summary: string;
  body: string;
  tags: string[];
  status: "locked" | "unlocked" | "completed";
  loot: string; // e.g., "SPREAD GUN", "BARREL", "RAPID FIRE"
}

/* ─── Generate Map Grid ─── */
const MAP_WIDTH = 16;
const MAP_HEIGHT = 12;

const terrainColors: Record<Terrain, string> = {
  jungle: "#1a3a1a",
  base: "#2a2a2a",
  water: "#1a2a3a",
  mountain: "#3a2a1a",
  road: "#2a2a20",
  empty: "#0a0a0a",
};

function generateMap(): MapTile[] {
  const tiles: MapTile[] = [];
  // Simple procedural map
  const pattern: Terrain[][] = [
    ["mountain", "mountain", "empty", "empty", "jungle", "jungle", "jungle", "water", "water", "jungle", "jungle", "empty", "empty", "mountain", "mountain", "mountain"],
    ["mountain", "empty", "empty", "jungle", "jungle", "base", "jungle", "water", "water", "jungle", "base", "jungle", "empty", "empty", "mountain", "mountain"],
    ["empty", "empty", "jungle", "jungle", "road", "road", "road", "water", "water", "road", "road", "jungle", "jungle", "empty", "empty", "mountain"],
    ["empty", "jungle", "jungle", "road", "road", "empty", "empty", "water", "water", "empty", "road", "road", "jungle", "jungle", "empty", "empty"],
    ["jungle", "jungle", "base", "road", "empty", "empty", "empty", "water", "water", "empty", "empty", "road", "base", "jungle", "jungle", "empty"],
    ["jungle", "base", "road", "road", "empty", "empty", "empty", "water", "water", "empty", "empty", "empty", "road", "road", "base", "jungle"],
    ["jungle", "road", "road", "empty", "empty", "empty", "jungle", "water", "water", "jungle", "empty", "empty", "empty", "road", "road", "jungle"],
    ["road", "road", "empty", "empty", "empty", "jungle", "jungle", "water", "water", "jungle", "jungle", "empty", "empty", "empty", "road", "road"],
    ["empty", "empty", "empty", "empty", "jungle", "jungle", "base", "water", "water", "base", "jungle", "jungle", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "jungle", "jungle", "base", "road", "water", "water", "road", "base", "jungle", "jungle", "empty", "empty", "empty"],
    ["empty", "empty", "jungle", "jungle", "base", "road", "road", "water", "water", "road", "road", "base", "jungle", "jungle", "empty", "empty"],
    ["empty", "jungle", "jungle", "base", "road", "road", "empty", "water", "water", "empty", "road", "road", "base", "jungle", "jungle", "empty"],
  ];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      tiles.push({ x, y, terrain: pattern[y][x] });
    }
  }
  return tiles;
}

const mapTiles = generateMap();

/* ─── Map Items (Files placed on map) ─── */
const mapItems: MapItem[] = [
  {
    id: "page-hydradb",
    x: 5, y: 1,
    title: "HydraDB Intel",
    type: "page",
    summary: "A graph-first vector database for AI agents.",
    body: "HydraDB combines vector search with graph traversal, enabling AI agents to retrieve contextually relevant information while understanding relationships between entities.",
    tags: ["database", "vector", "graph"],
    status: "unlocked",
    loot: "SPREAD GUN",
  },
  {
    id: "page-context",
    x: 10, y: 1,
    title: "Context Graph",
    type: "page",
    summary: "How knowledge graphs power agent memory.",
    body: "Context graphs represent the working memory of an AI agent. Each node is a piece of information, and edges represent semantic relationships.",
    tags: ["graph", "memory", "agents"],
    status: "unlocked",
    loot: "LASER RIFLE",
  },
  {
    id: "page-llm",
    x: 2, y: 4,
    title: "LLM Wiki Pattern",
    type: "page",
    summary: "Using LLMs to generate and maintain wikis automatically.",
    body: "The LLM Wiki pattern involves using language models to continuously ingest sources, extract entities and claims, and compile them into readable articles.",
    tags: ["llm", "wiki", "pattern"],
    status: "unlocked",
    loot: "MACHINE GUN",
  },
  {
    id: "page-vector",
    x: 13, y: 3,
    title: "Vector Limits",
    type: "page",
    summary: "Why pure vector search isn't enough for agents.",
    body: "Vector search based on cosine similarity has fundamental limitations: it cannot express complex relational queries, it struggles with multi-hop reasoning.",
    tags: ["vector", "search", "limitations"],
    status: "locked",
    loot: "FLAME THROWER",
  },
  {
    id: "page-rag",
    x: 3, y: 6,
    title: "RAG vs Wiki",
    type: "page",
    summary: "Retrieval Augmented Generation compared to structured wikis.",
    body: "RAG is stateless — each query starts from scratch. A wiki is stateful — it accumulates knowledge over time.",
    tags: ["rag", "wiki", "comparison"],
    status: "unlocked",
    loot: "RAPID FIRE",
  },
  {
    id: "page-pkos",
    x: 8, y: 8,
    title: "Personal Knowledge OS",
    type: "page",
    summary: "A unified system for managing personal information.",
    body: "A Personal Knowledge OS integrates notes, documents, bookmarks, and conversations into a single queryable graph.",
    tags: ["personal", "knowledge", "os"],
    status: "unlocked",
    loot: "BARRIER",
  },
  {
    id: "page-contra",
    x: 7, y: 4,
    title: "Contradiction Detection",
    type: "page",
    summary: "Finding conflicting claims in your knowledge base.",
    body: "As a knowledge base grows, contradictions naturally emerge. Contradiction detection uses LLMs to compare claims across sources.",
    tags: ["contradiction", "detection", "quality"],
    status: "unlocked",
    loot: "HOMING MISSILE",
  },
  {
    id: "src-hydradb",
    x: 4, y: 2,
    title: "HydraDB Docs",
    type: "source",
    summary: "Official documentation and API reference.",
    body: "Source: HydraDB official docs. HydraDB is a hybrid vector-graph database designed for AI applications.",
    tags: ["source", "docs"],
    status: "unlocked",
    loot: "AMMO BOX",
  },
  {
    id: "src-llm",
    x: 1, y: 5,
    title: "LLM Paper",
    type: "source",
    summary: "Research paper on automated wiki generation.",
    body: "Source: arXiv paper 2024. We present a system that uses LLMs to continuously extract entities, relations, and claims.",
    tags: ["paper", "research"],
    status: "locked",
    loot: "AMMO BOX",
  },
  {
    id: "ent-hydradb",
    x: 6, y: 2,
    title: "HydraDB Entity",
    type: "entity",
    summary: "Graph-vector database company.",
    body: "Type: Company. Founded: 2023. HydraDB builds a database that unifies vector search and graph traversal.",
    tags: ["company", "database"],
    status: "unlocked",
    loot: "SMART BOMB",
  },
  {
    id: "claim-1",
    x: 6, y: 5,
    title: "Claim: Graph-first",
    type: "claim",
    summary: "HydraDB prioritizes graph structure over pure vector search.",
    body: "Claim: HydraDB's architecture treats graph edges as first-class. Confidence: 92%.",
    tags: ["claim", "verified"],
    status: "completed",
    loot: "SPECIAL",
  },
  {
    id: "claim-2",
    x: 12, y: 4,
    title: "Claim: Vector Limits",
    type: "claim",
    summary: "Pure vector search cannot handle relational queries.",
    body: "Claim: Vector databases alone cannot answer multi-hop relational questions. Confidence: 88%.",
    tags: ["claim", "verified"],
    status: "completed",
    loot: "SPECIAL",
  },
];

/* ─── Terrain Icon ─── */
function TerrainIcon({ terrain }: { terrain: Terrain }) {
  const config: Record<Terrain, { color: string; pattern: string }> = {
    jungle: { color: "#1a3a1a", pattern: "🌴" },
    base: { color: "#2a2a2a", pattern: "🏭" },
    water: { color: "#1a2a3a", pattern: "🌊" },
    mountain: { color: "#3a2a1a", pattern: "⛰️" },
    road: { color: "#2a2a20", pattern: "·" },
    empty: { color: "#0a0a0a", pattern: "" },
  };
  const c = config[terrain];
  return (
    <div className="w-full h-full flex items-center justify-center text-[8px] opacity-20 select-none"
      style={{ backgroundColor: c.color }}>
      {c.pattern}
    </div>
  );
}

/* ─── Item Marker ─── */
function ItemMarker({ item, isSelected, onClick }: { item: MapItem; isSelected: boolean; onClick: () => void }) {
  const typeColors: Record<string, { bg: string; glow: string }> = {
    page: { bg: "bg-[#e63946]", glow: "shadow-[#e63946]" },
    source: { bg: "bg-[#00b4d8]", glow: "shadow-[#00b4d8]" },
    entity: { bg: "bg-[#f77f00]", glow: "shadow-[#f77f00]" },
    claim: { bg: "bg-[#4a7c59]", glow: "shadow-[#4a7c59]" },
    file: { bg: "bg-[#a78bfa]", glow: "shadow-[#a78bfa]" },
  };
  const c = typeColors[item.type] || typeColors.page;

  return (
    <motion.button
      layoutId={`item-${item.id}`}
      onClick={onClick}
      className={cn(
        "absolute w-8 h-8 -ml-4 -mt-4 rounded-sm flex items-center justify-center transition-all z-10",
        c.bg,
        isSelected && `ring-2 ring-white shadow-lg shadow-[${c.glow}]`,
        item.status === "locked" && "opacity-50 grayscale",
        item.status === "completed" && "ring-2 ring-[#f77f00]"
      )}
      style={{
        left: `${(item.x / MAP_WIDTH) * 100}%`,
        top: `${(item.y / MAP_HEIGHT) * 100}%`,
      }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      {item.status === "locked" ? (
        <Lock className="w-4 h-4 text-white" />
      ) : item.status === "completed" ? (
        <Trophy className="w-4 h-4 text-[#f77f00]" />
      ) : (
        <FileText className="w-4 h-4 text-white" />
      )}
      {/* Label */}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white font-[VT323] whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded-sm">
        {item.title}
      </span>
    </motion.button>
  );
}

/* ─── Player Avatar ─── */
function PlayerAvatar({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="absolute w-6 h-6 -ml-3 -mt-3 z-20 pointer-events-none"
      style={{
        left: `${(x / MAP_WIDTH) * 100}%`,
        top: `${(y / MAP_HEIGHT) * 100}%`,
      }}
      animate={{
        left: `${(x / MAP_WIDTH) * 100}%`,
        top: `${(y / MAP_HEIGHT) * 100}%`,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="w-full h-full bg-[#e63946] rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-[#e63946]/50">
        <Crosshair className="w-3.5 h-3.5 text-white" />
      </div>
      {/* Vision cone */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] text-[#e63946] font-[VT323] whitespace-nowrap">
        YOU
      </div>
    </motion.div>
  );
}

/* ─── Detail Panel ─── */
function DetailPanel({ item, onClose, onOpenFile }: { item: MapItem; onClose: () => void; onOpenFile: () => void }) {
  const typeColors: Record<string, { border: string; text: string; icon: any }> = {
    page: { border: "border-[#e63946]", text: "text-[#e63946]", icon: BookOpen },
    source: { border: "border-[#00b4d8]", text: "text-[#00b4d8]", icon: Database },
    entity: { border: "border-[#f77f00]", text: "text-[#f77f00]", icon: Lightbulb },
    claim: { border: "border-[#4a7c59]", text: "text-[#4a7c59]", icon: Target },
    file: { border: "border-[#a78bfa]", text: "text-[#a78bfa]", icon: FileText },
  };
  const c = typeColors[item.type] || typeColors.page;
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="w-[380px] shrink-0 border-l border-[#1a1a1a] bg-[#080808] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className={cn("p-5 border-b", c.border)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", c.text)} />
            <span className={cn("text-[11px] font-[VT323] uppercase tracking-wider", c.text)}>{item.type}</span>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <h2 className="text-[18px] font-bold text-white font-[VT323]">{item.title}</h2>
        <p className="text-[13px] text-[#888] font-[VT323] mt-2">{item.summary}</p>

        {/* Loot badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 bg-[#f77f00]/10 border border-[#f77f00]/30 rounded-sm px-2.5 py-1">
          <Zap className="w-3 h-3 text-[#f77f00]" />
          <span className="text-[11px] text-[#f77f00] font-[VT323] font-semibold">{item.loot}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          {item.status === "locked" && (
            <span className="flex items-center gap-1 text-[11px] text-[#555] font-[VT323] border border-[#333] rounded-sm px-2 py-1">
              <Lock className="w-3 h-3" /> LOCKED
            </span>
          )}
          {item.status === "completed" && (
            <span className="flex items-center gap-1 text-[11px] text-[#f77f00] font-[VT323] border border-[#f77f00]/30 rounded-sm px-2 py-1">
              <Trophy className="w-3 h-3" /> COMPLETED
            </span>
          )}
          {item.status === "unlocked" && (
            <span className="flex items-center gap-1 text-[11px] text-[#4a7c59] font-[VT323] border border-[#4a7c59]/30 rounded-sm px-2 py-1">
              <Unlock className="w-3 h-3" /> UNLOCKED
            </span>
          )}
        </div>

        {/* Preview */}
        <div className="border border-[#222] rounded-sm p-4 bg-[#0a0a0a]">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-3.5 h-3.5 text-[#f77f00]" />
            <span className="text-[11px] text-[#f77f00] font-[VT323] uppercase tracking-wider">Intel Preview</span>
          </div>
          <p className="text-[13px] text-[#ccc] font-[VT323] leading-relaxed">{item.body}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-1 rounded-sm bg-[#1a1a1a] text-[#888] font-[VT323]">#{t}</span>
          ))}
        </div>

        {/* Open File Button */}
        <button
          onClick={onOpenFile}
          disabled={item.status === "locked"}
          className={cn(
            "w-full py-3 rounded-sm text-[14px] font-[VT323] font-semibold flex items-center justify-center gap-2 transition-colors",
            item.status === "locked"
              ? "bg-[#222] text-[#555] cursor-not-allowed"
              : "bg-[#e63946] hover:bg-[#ff2a3a] text-white"
          )}
        >
          {item.status === "locked" ? (
            <><Lock className="w-4 h-4" /> LOCKED - COMPLETE PREREQUISITES</>
          ) : (
            <><FolderOpen className="w-4 h-4" /> OPEN FILE</>
          )}
        </button>

        {/* Predicted next */}
        <div className="border-t border-[#1a1a1a] pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-[#f77f00]" />
            <span className="text-[12px] text-[#f77f00] font-[VT323] uppercase tracking-wider font-semibold">Nearby Intel</span>
          </div>
          <div className="space-y-2">
            {mapItems
              .filter((i) => i.id !== item.id && Math.abs(i.x - item.x) + Math.abs(i.y - item.y) <= 3)
              .slice(0, 3)
              .map((nearby) => (
                <button
                  key={nearby.id}
                  className="w-full text-left border border-[#222] rounded-sm p-2.5 hover:border-[#e63946]/40 hover:bg-[#e63946]/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#ccc] font-[VT323]">{nearby.title}</span>
                    <span className="text-[10px] text-[#555] font-[VT323]">{Math.abs(nearby.x - item.x) + Math.abs(nearby.y - item.y)} tiles</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Full File Modal ─── */
function FileModal({ item, onClose }: { item: MapItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0d0d0d] border border-[#e63946]/30 rounded-sm max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e63946] rounded-sm flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-white font-[VT323]">{item.title}</h2>
              <p className="text-[12px] text-[#888] font-[VT323]">{item.type.toUpperCase()} // {item.loot}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-invert max-w-none">
            <p className="text-[15px] text-[#ccc] font-[VT323] leading-relaxed whitespace-pre-wrap">{item.body}</p>
            <div className="mt-6 p-4 border border-[#f77f00]/20 bg-[#f77f00]/5 rounded-sm">
              <p className="text-[13px] text-[#f77f00] font-[VT323] font-semibold">RELATED INTEL</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.tags.map((t) => (
                  <span key={t} className="text-[12px] px-2.5 py-1 bg-[#1a1a1a] text-[#888] rounded-sm font-[VT323]">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1a1a1a] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#f77f00]" />
            <span className="text-[12px] text-[#f77f00] font-[VT323]">Loot: {item.loot}</span>
          </div>
          <button onClick={onClose} className="bg-[#e63946] hover:bg-[#ff2a3a] text-white px-5 py-2 rounded-sm text-[13px] font-[VT323] font-semibold transition-colors">
            Close File
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function MapPage() {
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [openFile, setOpenFile] = useState<MapItem | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [filter, setFilter] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const handleItemClick = useCallback((item: MapItem) => {
    setSelectedItem(item);
    setPlayerPos({ x: item.x, y: item.y });
    setVisited((prev) => new Set([...prev, item.id]));
  }, []);

  const filteredItems = useMemo(() => {
    if (!filter) return mapItems;
    return mapItems.filter((i) => i.type === filter);
  }, [filter]);

  const explorationPercent = Math.round((visited.size / mapItems.length) * 100);

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-white font-[VT323] uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#e63946]" /> Mission Map
          </h1>
          <p className="text-[13px] text-[#888] font-[VT323]">Explore the jungle. Collect intel. Unlock weapons.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Exploration % */}
          <div className="flex items-center gap-2 border border-[#f77f00]/30 bg-[#f77f00]/5 rounded-sm px-3 py-2">
            <MapPin className="w-4 h-4 text-[#f77f00]" />
            <div>
              <span className="text-[10px] text-[#f77f00] font-[VT323] uppercase tracking-wider block">Explored</span>
              <span className="text-[15px] text-white font-[VT323] font-bold">{explorationPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[#1a1a1a] shrink-0 flex items-center gap-2 flex-wrap">
        {[{ id: null, label: "All Intel" }, { id: "page", label: "Pages" }, { id: "source", label: "Sources" }, { id: "entity", label: "Entities" }, { id: "claim", label: "Claims" }].map((t) => (
          <button key={t.id ?? "all"} onClick={() => setFilter(t.id as string)}
            className={cn("text-[12px] font-[VT323] uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-all",
              filter === t.id ? "bg-[#e63946]/10 border-[#e63946]/30 text-[#e63946]" : "border-[#222] text-[#555] hover:text-[#888]")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Map + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Grid */}
        <div className="flex-1 relative overflow-auto bg-[#050505] p-4">
          <div className="relative" style={{ width: MAP_WIDTH * 64, height: MAP_HEIGHT * 64 }}>
            {/* Terrain tiles */}
            {mapTiles.map((tile) => (
              <div
                key={`${tile.x}-${tile.y}`}
                className="absolute border border-black/20"
                style={{
                  left: tile.x * 64,
                  top: tile.y * 64,
                  width: 64,
                  height: 64,
                }}
              >
                <TerrainIcon terrain={tile.terrain} />
              </div>
            ))}

            {/* Items */}
            {filteredItems.map((item) => (
              <ItemMarker
                key={item.id}
                item={item}
                isSelected={selectedItem?.id === item.id}
                onClick={() => handleItemClick(item)}
              />
            ))}

            {/* Player */}
            <PlayerAvatar x={playerPos.x} y={playerPos.y} />
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {selectedItem && (
            <DetailPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onOpenFile={() => setOpenFile(selectedItem)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* File Modal */}
      <AnimatePresence>
        {openFile && (
          <FileModal item={openFile} onClose={() => setOpenFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
