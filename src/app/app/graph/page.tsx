"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, {
  Background, Controls, MiniMap, Node, Edge,
  useNodesState, useEdgesState, Handle, Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import {
  Search, Filter, BookOpen, Database, FileText, Lightbulb,
  AlertTriangle, X, ArrowRight, ChevronRight, Zap, Eye,
  GitBranch, Clock, Target, FileCode, Sparkles, Brain,
} from "lucide-react";
import Link from "next/link";

/* ─── Node Content (mock file system) ─── */
interface NodeContent {
  title: string;
  type: "page" | "source" | "entity" | "claim" | "file";
  summary: string;
  body: string;
  tags: string[];
  lastModified: string;
  connections: string[]; // IDs of connected nodes
}

const nodeContents: Record<string, NodeContent> = {
  "page-hydradb": {
    title: "HydraDB",
    type: "page",
    summary: "A graph-first vector database for AI agents.",
    body: "HydraDB combines vector search with graph traversal, enabling AI agents to retrieve contextually relevant information while understanding relationships between entities. Unlike traditional vector DBs that only store embeddings, HydraDB maintains explicit edges between documents, entities, and claims.",
    tags: ["database", "vector", "graph", "ai"],
    lastModified: "2 hours ago",
    connections: ["ent-hydradb", "src-hydradb", "page-context", "page-vector"],
  },
  "page-context": {
    title: "Context Graph",
    type: "page",
    summary: "How knowledge graphs power agent memory.",
    body: "Context graphs represent the working memory of an AI agent. Each node is a piece of information, and edges represent semantic relationships. When an agent processes a query, it traverses this graph to build a context window that captures not just similarity, but relational proximity.",
    tags: ["graph", "memory", "agents"],
    lastModified: "5 hours ago",
    connections: ["page-hydradb", "ent-hydradb", "page-contra"],
  },
  "page-llm": {
    title: "LLM Wiki Pattern",
    type: "page",
    summary: "Using LLMs to generate and maintain wikis automatically.",
    body: "The LLM Wiki pattern involves using language models to continuously ingest sources, extract entities and claims, and compile them into readable articles. This creates a self-updating knowledge base that grows as new information arrives.",
    tags: ["llm", "wiki", "pattern"],
    lastModified: "1 day ago",
    connections: ["ent-llm", "src-llm", "page-rag", "page-pkos"],
  },
  "page-vector": {
    title: "Vector Search Limits",
    type: "page",
    summary: "Why pure vector search isn't enough for agents.",
    body: "Vector search based on cosine similarity has fundamental limitations: it cannot express complex relational queries, it struggles with multi-hop reasoning, and it treats all dimensions equally. Graph databases address these gaps by making relationships first-class citizens.",
    tags: ["vector", "search", "limitations"],
    lastModified: "3 hours ago",
    connections: ["ent-vector", "src-vector", "page-hydradb", "claim-2"],
  },
  "page-rag": {
    title: "RAG vs Wiki",
    type: "page",
    summary: "Retrieval Augmented Generation compared to structured wikis.",
    body: "RAG is stateless — each query starts from scratch. A wiki is stateful — it accumulates knowledge over time. RAG retrieves chunks; a wiki retrieves compiled, verified, interlinked articles. The best systems combine both: RAG for freshness, wiki for depth.",
    tags: ["rag", "wiki", "comparison"],
    lastModified: "6 hours ago",
    connections: ["ent-llm", "page-llm", "claim-3"],
  },
  "page-pkos": {
    title: "Personal Knowledge OS",
    type: "page",
    summary: "A unified system for managing personal information.",
    body: "A Personal Knowledge OS integrates notes, documents, bookmarks, and conversations into a single queryable graph. Unlike a note-taking app, it actively suggests connections, detects contradictions, and compiles summaries.",
    tags: ["personal", "knowledge", "os"],
    lastModified: "12 hours ago",
    connections: ["page-llm", "page-student"],
  },
  "page-student": {
    title: "Student Job Agent",
    type: "page",
    summary: "AI agent that helps students find relevant jobs.",
    body: "The Student Job Agent uses a personal knowledge graph of the student's skills, projects, and interests to match them with job opportunities. It reads job descriptions, extracts requirements, and maps them to the student's profile.",
    tags: ["agent", "jobs", "students"],
    lastModified: "2 days ago",
    connections: ["page-hydradb", "page-pkos"],
  },
  "page-contra": {
    title: "Contradiction Detection",
    type: "page",
    summary: "Finding conflicting claims in your knowledge base.",
    body: "As a knowledge base grows, contradictions naturally emerge. Contradiction detection uses LLMs to compare claims across sources, flag inconsistencies, and present them as 'boss encounters' for the user to resolve.",
    tags: ["contradiction", "detection", "quality"],
    lastModified: "1 hour ago",
    connections: ["page-context", "claim-1"],
  },
  "src-hydradb": {
    title: "HydraDB Overview",
    type: "source",
    summary: "Official documentation and API reference.",
    body: "Source: HydraDB official docs\nURL: https://hydradb.com/docs\nContent: HydraDB is a hybrid vector-graph database designed for AI applications. It supports HNSW vector indexing, property graph traversal, and full-text search in a single query.",
    tags: ["source", "docs"],
    lastModified: "3 days ago",
    connections: ["page-hydradb", "ent-hydradb"],
  },
  "src-llm": {
    title: "LLM Wiki Pattern",
    type: "source",
    summary: "Research paper on automated wiki generation.",
    body: "Source: arXiv paper 2024\nTitle: 'Generative Knowledge Bases'\nAuthors: Zhang et al.\nAbstract: We present a system that uses LLMs to continuously extract entities, relations, and claims from incoming documents, maintaining a self-updating knowledge graph.",
    tags: ["paper", "research"],
    lastModified: "1 week ago",
    connections: ["page-llm", "ent-llm"],
  },
  "src-vector": {
    title: "Vector Search Limits",
    type: "source",
    summary: "Blog post on why vector search falls short.",
    body: "Source: Pinecone blog\nAuthor: James Briggs\nContent: While vector search has revolutionized semantic retrieval, it lacks the ability to answer questions like 'What projects did person X work on before joining company Y?' — this requires graph traversal.",
    tags: ["blog", "vector"],
    lastModified: "4 days ago",
    connections: ["page-vector", "ent-vector"],
  },
  "ent-hydradb": {
    title: "HydraDB (Entity)",
    type: "entity",
    summary: "Graph-vector database company.",
    body: "Type: Company\nFounded: 2023\nDescription: HydraDB builds a database that unifies vector search and graph traversal. Their query language allows mixing similarity search with path finding in a single operation.",
    tags: ["company", "database"],
    lastModified: "1 day ago",
    connections: ["page-hydradb", "page-context", "src-hydradb"],
  },
  "ent-vector": {
    title: "Vector Database",
    type: "entity",
    summary: "Database category for similarity search.",
    body: "Type: Technology\nExamples: Pinecone, Weaviate, Chroma, Milvus\nDescription: Vector databases store high-dimensional embeddings and support approximate nearest neighbor search. They are essential for semantic retrieval in AI applications.",
    tags: ["technology", "database"],
    lastModified: "2 days ago",
    connections: ["page-vector", "src-vector"],
  },
  "ent-llm": {
    title: "LLM Wiki",
    type: "entity",
    summary: "Pattern for auto-generated wikis.",
    body: "Type: Concept\nRelated: Knowledge Graph, RAG, Agent Memory\nDescription: The LLM Wiki pattern uses language models to transform unstructured documents into structured, interlinked articles that form a browsable knowledge base.",
    tags: ["concept", "pattern"],
    lastModified: "5 days ago",
    connections: ["page-llm", "page-rag", "src-llm"],
  },
  "claim-1": {
    title: "Claim: HydraDB is graph-first",
    type: "claim",
    summary: "HydraDB prioritizes graph structure over pure vector search.",
    body: "Claim: HydraDB's architecture treats graph edges as first-class, not an afterthought on top of vectors.\nConfidence: 92%\nSources: HydraDB docs, architecture review\nStatus: Verified",
    tags: ["claim", "verified"],
    lastModified: "6 hours ago",
    connections: ["page-hydradb", "page-contra"],
  },
  "claim-2": {
    title: "Claim: Vector DB insufficient",
    type: "claim",
    summary: "Pure vector search cannot handle relational queries.",
    body: "Claim: Vector databases alone cannot answer multi-hop relational questions without external knowledge graphs.\nConfidence: 88%\nSources: Research paper, industry benchmarks\nStatus: Verified",
    tags: ["claim", "verified"],
    lastModified: "8 hours ago",
    connections: ["page-vector"],
  },
  "claim-3": {
    title: "Claim: RAG is stateless",
    type: "claim",
    summary: "RAG systems don't accumulate knowledge across sessions.",
    body: "Claim: Standard RAG retrieves documents per-query with no memory of previous interactions or accumulated insights.\nConfidence: 95%\nSources: Survey of 50 RAG implementations\nStatus: Verified",
    tags: ["claim", "verified"],
    lastModified: "10 hours ago",
    connections: ["page-rag"],
  },
};

/* ─── ReactFlow Nodes & Edges ─── */
const initialNodes: Node[] = [
  // Pages
  { id: "page-hydradb", type: "custom", position: { x: 0, y: 0 }, data: { label: "HydraDB", type: "page", id: "page-hydradb" } },
  { id: "page-context", type: "custom", position: { x: 200, y: -80 }, data: { label: "Context Graph", type: "page", id: "page-context" } },
  { id: "page-llm", type: "custom", position: { x: -150, y: 100 }, data: { label: "LLM Wiki", type: "page", id: "page-llm" } },
  { id: "page-vector", type: "custom", position: { x: 150, y: 120 }, data: { label: "Vector Limits", type: "page", id: "page-vector" } },
  { id: "page-rag", type: "custom", position: { x: -100, y: -100 }, data: { label: "RAG vs Wiki", type: "page", id: "page-rag" } },
  { id: "page-pkos", type: "custom", position: { x: 300, y: 80 }, data: { label: "PK OS", type: "page", id: "page-pkos" } },
  { id: "page-student", type: "custom", position: { x: -250, y: -20 }, data: { label: "Job Agent", type: "page", id: "page-student" } },
  { id: "page-contra", type: "custom", position: { x: 80, y: 220 }, data: { label: "Contradictions", type: "page", id: "page-contra" } },
  // Sources
  { id: "src-hydradb", type: "custom", position: { x: -80, y: -180 }, data: { label: "HydraDB Docs", type: "source", id: "src-hydradb" } },
  { id: "src-llm", type: "custom", position: { x: -280, y: 80 }, data: { label: "LLM Paper", type: "source", id: "src-llm" } },
  { id: "src-vector", type: "custom", position: { x: 280, y: 180 }, data: { label: "Vector Blog", type: "source", id: "src-vector" } },
  // Entities
  { id: "ent-hydradb", type: "custom", position: { x: 50, y: -140 }, data: { label: "HydraDB", type: "entity", id: "ent-hydradb" } },
  { id: "ent-vector", type: "custom", position: { x: 400, y: 40 }, data: { label: "Vector DB", type: "entity", id: "ent-vector" } },
  { id: "ent-llm", type: "custom", position: { x: -200, y: -140 }, data: { label: "LLM Wiki", type: "entity", id: "ent-llm" } },
  // Claims
  { id: "claim-1", type: "custom", position: { x: -50, y: 180 }, data: { label: "Graph-first", type: "claim", id: "claim-1" } },
  { id: "claim-2", type: "custom", position: { x: 250, y: -160 }, data: { label: "Vector limits", type: "claim", id: "claim-2" } },
  { id: "claim-3", type: "custom", position: { x: -350, y: -100 }, data: { label: "RAG stateless", type: "claim", id: "claim-3" } },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "page-hydradb", target: "page-context", label: "BUILDS", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e2", source: "page-hydradb", target: "page-vector", label: "CONTRASTS", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e3", source: "page-llm", target: "page-hydradb", label: "USES", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e4", source: "page-context", target: "page-contra", label: "ENABLES", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e5", source: "page-rag", target: "page-llm", label: "COMPARES", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e6", source: "page-rag", target: "page-vector", label: "REFERENCES", style: { stroke: "#00b4d8", strokeWidth: 1.5 } },
  { id: "e7", source: "page-pkos", target: "page-llm", label: "USES", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e8", source: "page-student", target: "page-hydradb", label: "USES", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e9", source: "src-hydradb", target: "page-hydradb", style: { stroke: "#00b4d8", strokeWidth: 1.5 }, animated: true },
  { id: "e10", source: "src-llm", target: "page-llm", style: { stroke: "#00b4d8", strokeWidth: 1.5 }, animated: true },
  { id: "e11", source: "src-vector", target: "page-vector", style: { stroke: "#00b4d8", strokeWidth: 1.5 }, animated: true },
  { id: "e13", source: "ent-hydradb", target: "page-hydradb", style: { stroke: "#f77f00", strokeWidth: 1.5 } },
  { id: "e14", source: "ent-vector", target: "page-vector", style: { stroke: "#f77f00", strokeWidth: 1.5 } },
  { id: "e15", source: "ent-llm", target: "page-llm", style: { stroke: "#f77f00", strokeWidth: 1.5 } },
  { id: "e16", source: "claim-1", target: "page-hydradb", style: { stroke: "#4a7c59", strokeWidth: 1.5 } },
  { id: "e17", source: "claim-2", target: "page-vector", style: { stroke: "#e63946", strokeWidth: 1.5, strokeDasharray: "5,5" } },
  { id: "e18", source: "claim-3", target: "page-rag", style: { stroke: "#4a7c59", strokeWidth: 1.5 } },
];

/* ─── Custom Node Component ─── */
function CustomNode({ data }: { data: any }) {
  const typeColors: Record<string, { bg: string; border: string; text: string; icon: any }> = {
    page: { bg: "bg-[#e63946]/10", border: "border-[#e63946]/40", text: "text-[#e63946]", icon: BookOpen },
    source: { bg: "bg-[#00b4d8]/10", border: "border-[#00b4d8]/40", text: "text-[#00b4d8]", icon: Database },
    entity: { bg: "bg-[#f77f00]/10", border: "border-[#f77f00]/40", text: "text-[#f77f00]", icon: Lightbulb },
    claim: { bg: "bg-[#4a7c59]/10", border: "border-[#4a7c59]/40", text: "text-[#4a7c59]", icon: Target },
  };

  const config = typeColors[data.type] || typeColors.page;
  const Icon = config.icon;

  return (
    <div className={cn("px-3 py-2 rounded-md border min-w-[120px] cursor-pointer transition-all hover:scale-105", config.bg, config.border)}>
      <Handle type="target" position={Position.Top} className="!bg-[#333] !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <Icon className={cn("w-3.5 h-3.5 shrink-0", config.text)} />
        <span className={cn("text-[12px] font-semibold truncate", config.text)}>{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#333] !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

/* ─── Predicted Next Node Card ─── */
function PredictedNode({ nodeId, onClick, index }: { nodeId: string; onClick: () => void; index: number }) {
  const content = nodeContents[nodeId];
  if (!content) return null;

  const typeColors: Record<string, string> = {
    page: "text-[#e63946]",
    source: "text-[#00b4d8]",
    entity: "text-[#f77f00]",
    claim: "text-[#4a7c59]",
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="w-full text-left border border-[#222] bg-[#0a0a0a] rounded-sm p-3 hover:border-[#e63946]/40 hover:bg-[#e63946]/5 transition-all group"
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-3 h-3 text-[#f77f00]" />
        <span className="text-[10px] text-[#f77f00] font-[VT323] uppercase tracking-wider">Predicted</span>
      </div>
      <p className={cn("text-[13px] font-semibold font-[VT323]", typeColors[content.type])}>{content.title}</p>
      <p className="text-[12px] text-[#888] font-[VT323] mt-1 line-clamp-2">{content.summary}</p>
      <div className="flex items-center gap-1 mt-2 text-[#555] group-hover:text-[#e63946] transition-colors">
        <ChevronRight className="w-3 h-3" />
        <span className="text-[11px] font-[VT323]">Explore</span>
      </div>
    </motion.button>
  );
}

/* ─── Main Page ─── */
export default function GraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const selectedContent = selectedNode ? nodeContents[selectedNode.data.id] : null;

  // Predict next nodes based on selected node's connections
  const predictedNodes = useMemo(() => {
    if (!selectedContent) {
      // Default: suggest pages with most connections
      return Object.entries(nodeContents)
        .filter(([_, c]) => c.type === "page")
        .sort((a, b) => b[1].connections.length - a[1].connections.length)
        .slice(0, 3)
        .map(([id]) => id);
    }
    return selectedContent.connections.slice(0, 4);
  }, [selectedContent]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setHistory((prev) => [node.data.id, ...prev].slice(0, 10));
  }, []);

  const navigateToNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.data.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setHistory((prev) => [nodeId, ...prev].slice(0, 10));
    }
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    let filtered = filter ? initialNodes.filter((n) => n.data.type === filter) : initialNodes;
    if (searchQuery) {
      filtered = filtered.filter((n) =>
        n.data.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [filter, searchQuery]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return initialEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [filteredNodes]);

  const typeFilters = [
    { id: "page", label: "Pages", color: "#e63946", icon: BookOpen },
    { id: "source", label: "Sources", color: "#00b4d8", icon: Database },
    { id: "entity", label: "Entities", color: "#f77f00", icon: Lightbulb },
    { id: "claim", label: "Claims", color: "#4a7c59", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a1a1a] shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-white font-[VT323] uppercase tracking-wider">Tactical Map</h1>
          <p className="text-[13px] text-[#888] font-[VT323]">Click any node to explore. The system predicts what you need next.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0a0a0a] border border-[#222] rounded-sm pl-9 pr-3 py-2 text-[13px] text-white font-[VT323] w-48 focus:outline-none focus:border-[#e63946]/50"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[#1a1a1a] shrink-0 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter(null)}
          className={cn("text-[12px] font-[VT323] uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-all",
            !filter ? "bg-[#e63946]/10 border-[#e63946]/30 text-[#e63946]" : "border-[#222] text-[#555] hover:text-[#888]")}
        >
          All
        </button>
        {typeFilters.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(filter === t.id ? null : t.id)}
            className={cn("flex items-center gap-1.5 text-[12px] font-[VT323] uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-all",
              filter === t.id ? "bg-[#e63946]/10 border-[#e63946]/30 text-[#e63946]" : "border-[#222] text-[#555] hover:text-[#888]")}
          >
            <t.icon className="w-3.5 h-3.5" style={{ color: t.color }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph Area */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="rgba(230,57,70,0.05)" gap={24} size={1} />
            <Controls className="!bg-[#0a0a0a] !border-[#222] !text-[#888] !rounded-sm" />
            <MiniMap
              className="!bg-[#0a0a0a] !border-[#222] !rounded-sm"
              maskColor="rgba(6,6,6,0.85)"
              nodeColor={(n) => {
                const colors: Record<string, string> = { page: "#e63946", source: "#00b4d8", entity: "#f77f00", claim: "#4a7c59" };
                return colors[n.data?.type] || "#555";
              }}
            />
          </ReactFlow>
        </div>

        {/* Right Sidebar — Node Detail + Predictions */}
        <AnimatePresence>
          {selectedNode && selectedContent && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[380px] shrink-0 border-l border-[#1a1a1a] bg-[#080808] flex flex-col overflow-hidden"
            >
              {/* Node Detail Header */}
              <div className="p-5 border-b border-[#1a1a1a]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          selectedContent.type === "page" ? "#e63946" :
                          selectedContent.type === "source" ? "#00b4d8" :
                          selectedContent.type === "entity" ? "#f77f00" : "#4a7c59"
                      }}
                    />
                    <span className="text-[11px] text-[#888] font-[VT323] uppercase tracking-wider">{selectedContent.type}</span>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-[#555] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-[18px] font-bold text-white font-[VT323] leading-tight">{selectedContent.title}</h2>
                <p className="text-[13px] text-[#888] font-[VT323] mt-2">{selectedContent.summary}</p>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="text-[14px] text-[#ccc] font-[VT323] leading-relaxed whitespace-pre-wrap">
                  {selectedContent.body}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedContent.tags.map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-1 rounded-sm bg-[#1a1a1a] text-[#888] font-[VT323]">#{tag}</span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#555] font-[VT323]">
                  <Clock className="w-3 h-3" />
                  Modified {selectedContent.lastModified}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {selectedContent.type === "page" && (
                    <Link href={`/app/wiki/${selectedNode.data.id.replace("page-", "")}`} className="flex-1">
                      <span className="flex items-center justify-center gap-2 bg-[#e63946] hover:bg-[#ff2a3a] text-white px-4 py-2.5 rounded-sm text-[13px] font-[VT323] font-semibold transition-colors">
                        <BookOpen className="w-4 h-4" /> Read Full Article
                      </span>
                    </Link>
                  )}
                  <button className="flex items-center justify-center gap-2 border border-[#333] text-[#888] hover:text-white hover:border-[#555] px-4 py-2.5 rounded-sm text-[13px] font-[VT323] transition-colors">
                    <Eye className="w-4 h-4" /> Sources
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-[#1a1a1a] pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-[#f77f00]" />
                    <span className="text-[12px] text-[#f77f00] font-[VT323] uppercase tracking-wider font-semibold">Predicted Next</span>
                  </div>
                  <div className="space-y-2">
                    {predictedNodes.map((nodeId, i) => (
                      <PredictedNode key={nodeId} nodeId={nodeId} index={i} onClick={() => navigateToNode(nodeId)} />
                    ))}
                  </div>
                </div>

                {/* History */}
                {history.length > 1 && (
                  <div className="border-t border-[#1a1a1a] pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GitBranch className="w-4 h-4 text-[#555]" />
                      <span className="text-[12px] text-[#555] font-[VT323] uppercase tracking-wider font-semibold">Your Path</span>
                    </div>
                    <div className="space-y-1.5">
                      {history.slice(1, 6).map((id, i) => {
                        const c = nodeContents[id];
                        if (!c) return null;
                        return (
                          <button
                            key={`${id}-${i}`}
                            onClick={() => navigateToNode(id)}
                            className="w-full text-left flex items-center gap-2 text-[12px] text-[#888] hover:text-[#e63946] font-[VT323] transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" />
                            {c.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
