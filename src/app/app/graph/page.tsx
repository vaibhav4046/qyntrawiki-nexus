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
  Search, BookOpen, Database, Lightbulb, Target, X, ChevronRight,
  Zap, Eye, Brain, GitBranch, Clock, Sparkles, ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ─── Demo Knowledge Graph Data (mirrors real DB schema) ─── */
interface NodeData {
  title: string;
  type: "page" | "source" | "entity" | "claim";
  summary: string;
  body: string;
  tags: string[];
  connections: string[];
}

const nodeContents: Record<string, NodeData> = {
  "page-hydradb": { title: "HydraDB", type: "page", summary: "Graph-vector database for AI agents.", body: "HydraDB combines vector search with graph traversal, enabling AI agents to retrieve contextually relevant information while understanding relationships.", tags: ["database", "vector"], connections: ["ent-hydradb", "src-hydradb", "page-context", "page-vector"] },
  "page-context": { title: "Context Graph", type: "page", summary: "Knowledge graphs powering agent memory.", body: "Context graphs represent working memory. Each node is information, edges are semantic relationships.", tags: ["graph", "memory"], connections: ["page-hydradb", "ent-hydradb", "page-contra"] },
  "page-llm": { title: "LLM Wiki Pattern", type: "page", summary: "Auto-generating wikis from sources.", body: "LLMs continuously ingest sources, extract entities and claims, compile into readable articles.", tags: ["llm", "wiki"], connections: ["ent-llm", "src-llm", "page-rag", "page-pkos"] },
  "page-vector": { title: "Vector Search Limits", type: "page", summary: "Why pure vectors aren't enough.", body: "Vector search cannot express complex relational queries, struggles with multi-hop reasoning.", tags: ["vector", "limits"], connections: ["ent-vector", "src-vector", "page-hydradb"] },
  "page-rag": { title: "RAG vs Wiki", type: "page", summary: "Stateful vs stateless retrieval.", body: "RAG is stateless per-query. Wikis accumulate knowledge over time. Best systems combine both.", tags: ["rag", "wiki"], connections: ["ent-llm", "page-llm"] },
  "page-pkos": { title: "Personal Knowledge OS", type: "page", summary: "Unified information management.", body: "Integrates notes, documents, bookmarks, conversations into a single queryable graph.", tags: ["personal", "os"], connections: ["page-llm", "page-student"] },
  "page-student": { title: "Student Job Agent", type: "page", summary: "Job matching for students.", body: "Uses personal knowledge graph of skills and projects to match with job requirements.", tags: ["jobs", "agents"], connections: ["page-hydradb", "page-pkos"] },
  "page-contra": { title: "Contradiction Detection", type: "page", summary: "Finding conflicting claims.", body: "LLMs compare claims across sources, flag inconsistencies for user resolution.", tags: ["quality", "claims"], connections: ["page-context", "claim-1"] },
  "src-hydradb": { title: "HydraDB Docs", type: "source", summary: "Official API documentation.", body: "HydraDB official docs. Hybrid vector-graph database for AI apps. Supports HNSW, graph traversal, full-text.", tags: ["source"], connections: ["page-hydradb", "ent-hydradb"] },
  "src-llm": { title: "LLM Paper", type: "source", summary: "Research paper on generative wikis.", body: "arXiv 2024: Generative Knowledge Bases. LLMs extract entities, relations, claims from documents.", tags: ["paper"], connections: ["page-llm", "ent-llm"] },
  "src-vector": { title: "Vector Blog", type: "source", summary: "Why vector search falls short.", body: "Pinecone blog by James Briggs. Vector search cannot answer relational questions without graph traversal.", tags: ["blog"], connections: ["page-vector", "ent-vector"] },
  "ent-hydradb": { title: "HydraDB", type: "entity", summary: "Company. Founded 2023.", body: "Builds unified vector-graph database. Query language mixes similarity search with path finding.", tags: ["company"], connections: ["page-hydradb", "page-context", "src-hydradb"] },
  "ent-vector": { title: "Vector Database", type: "entity", summary: "Technology category.", body: "Examples: Pinecone, Weaviate, Chroma, Milvus. Store embeddings and support ANN search.", tags: ["technology"], connections: ["page-vector", "src-vector"] },
  "ent-llm": { title: "LLM Wiki", type: "entity", summary: "Pattern for auto-generated wikis.", body: "Uses language models to transform unstructured documents into structured, interlinked articles.", tags: ["concept"], connections: ["page-llm", "page-rag", "src-llm"] },
  "claim-1": { title: "Graph-first", type: "claim", summary: "HydraDB prioritizes graph over vectors.", body: "Confidence: 92%. Architecture treats graph edges as first-class, not an afterthought.", tags: ["claim"], connections: ["page-hydradb", "page-contra"] },
  "claim-2": { title: "Vector Limits", type: "claim", summary: "Pure vector can't do relational queries.", body: "Confidence: 88%. Vector DBs alone cannot answer multi-hop questions without knowledge graphs.", tags: ["claim"], connections: ["page-vector"] },
  "claim-3": { title: "RAG Stateless", type: "claim", summary: "RAG doesn't accumulate knowledge.", body: "Confidence: 95%. Standard RAG retrieves per-query with no memory of past interactions.", tags: ["claim"], connections: ["page-rag"] },
};

/* ─── Force-directed layout positions ─── */
const initialNodes: Node[] = [
  { id: "page-hydradb", type: "custom", position: { x: 400, y: 300 }, data: { label: "HydraDB", type: "page", id: "page-hydradb" } },
  { id: "page-context", type: "custom", position: { x: 600, y: 200 }, data: { label: "Context Graph", type: "page", id: "page-context" } },
  { id: "page-llm", type: "custom", position: { x: 200, y: 400 }, data: { label: "LLM Wiki", type: "page", id: "page-llm" } },
  { id: "page-vector", type: "custom", position: { x: 600, y: 450 }, data: { label: "Vector Limits", type: "page", id: "page-vector" } },
  { id: "page-rag", type: "custom", position: { x: 150, y: 250 }, data: { label: "RAG vs Wiki", type: "page", id: "page-rag" } },
  { id: "page-pkos", type: "custom", position: { x: 350, y: 550 }, data: { label: "PK OS", type: "page", id: "page-pkos" } },
  { id: "page-student", type: "custom", position: { x: 500, y: 650 }, data: { label: "Job Agent", type: "page", id: "page-student" } },
  { id: "page-contra", type: "custom", position: { x: 750, y: 350 }, data: { label: "Contradictions", type: "page", id: "page-contra" } },
  { id: "src-hydradb", type: "custom", position: { x: 350, y: 150 }, data: { label: "HydraDB Docs", type: "source", id: "src-hydradb" } },
  { id: "src-llm", type: "custom", position: { x: 50, y: 450 }, data: { label: "LLM Paper", type: "source", id: "src-llm" } },
  { id: "src-vector", type: "custom", position: { x: 750, y: 550 }, data: { label: "Vector Blog", type: "source", id: "src-vector" } },
  { id: "ent-hydradb", type: "custom", position: { x: 500, y: 100 }, data: { label: "HydraDB", type: "entity", id: "ent-hydradb" } },
  { id: "ent-vector", type: "custom", position: { x: 800, y: 450 }, data: { label: "Vector DB", type: "entity", id: "ent-vector" } },
  { id: "ent-llm", type: "custom", position: { x: 100, y: 350 }, data: { label: "LLM Wiki", type: "entity", id: "ent-llm" } },
  { id: "claim-1", type: "custom", position: { x: 550, y: 400 }, data: { label: "Graph-first", type: "claim", id: "claim-1" } },
  { id: "claim-2", type: "custom", position: { x: 700, y: 500 }, data: { label: "Vector limits", type: "claim", id: "claim-2" } },
  { id: "claim-3", type: "custom", position: { x: 100, y: 200 }, data: { label: "RAG stateless", type: "claim", id: "claim-3" } },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "page-hydradb", target: "page-context", label: "builds", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e2", source: "page-hydradb", target: "page-vector", label: "contrasts", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e3", source: "page-llm", target: "page-hydradb", label: "uses", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e4", source: "page-context", target: "page-contra", label: "enables", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e5", source: "page-rag", target: "page-llm", label: "compares", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e6", source: "page-rag", target: "page-vector", label: "references", style: { stroke: "#00b4d8", strokeWidth: 1.5 } },
  { id: "e7", source: "page-pkos", target: "page-llm", label: "uses", style: { stroke: "#e63946", strokeWidth: 1.5 } },
  { id: "e8", source: "page-student", target: "page-hydradb", label: "uses", style: { stroke: "#e63946", strokeWidth: 1.5 } },
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

/* ─── Custom Node ─── */
const typeConfig: Record<string, { bg: string; border: string; text: string; icon: any }> = {
  page: { bg: "bg-[#e63946]/10", border: "border-[#e63946]/30", text: "text-[#e63946]", icon: BookOpen },
  source: { bg: "bg-[#00b4d8]/10", border: "border-[#00b4d8]/30", text: "text-[#00b4d8]", icon: Database },
  entity: { bg: "bg-[#f77f00]/10", border: "border-[#f77f00]/30", text: "text-[#f77f00]", icon: Lightbulb },
  claim: { bg: "bg-[#4a7c59]/10", border: "border-[#4a7c59]/30", text: "text-[#4a7c59]", icon: Target },
};

function CustomNode({ data }: { data: any }) {
  const config = typeConfig[data.type] || typeConfig.page;
  const Icon = config.icon;
  return (
    <div className={cn("px-3 py-2 rounded-lg border cursor-pointer transition-all hover:scale-105", config.bg, config.border)}>
      <Handle type="target" position={Position.Top} className="!bg-[#333] !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <Icon className={cn("w-3.5 h-3.5 shrink-0", config.text)} />
        <span className={cn("text-[12px] font-medium truncate", config.text)}>{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#333] !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

/* ─── Predicted Card ─── */
function PredictedCard({ nodeId, onClick, index }: { nodeId: string; onClick: () => void; index: number }) {
  const content = nodeContents[nodeId];
  if (!content) return null;
  const colors: Record<string, string> = { page: "text-[#e63946]", source: "text-[#00b4d8]", entity: "text-[#f77f00]", claim: "text-[#4a7c59]" };

  return (
    <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
      onClick={onClick} className="w-full text-left card p-3 hover:border-[#e63946]/30 transition-all group">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-3 h-3 text-[#f77f00]" />
        <span className="text-[10px] text-[#f77f00] uppercase tracking-wider font-medium">Suggested</span>
      </div>
      <p className={cn("text-[13px] font-medium", colors[content.type])}>{content.title}</p>
      <p className="text-[12px] text-[#888] mt-1 line-clamp-2">{content.summary}</p>
      <div className="flex items-center gap-1 mt-2 text-[#555] group-hover:text-[#e63946] transition-colors">
        <ChevronRight className="w-3 h-3" />
        <span className="text-[11px]">Explore</span>
      </div>
    </motion.button>
  );
}

/* ─── Main Page ─── */
export default function GraphPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedContent = selectedNode ? nodeContents[selectedNode.data.id] : null;

  const predictedNodes = useMemo(() => {
    if (!selectedContent) {
      return Object.entries(nodeContents).filter(([_, c]) => c.type === "page").slice(0, 3).map(([id]) => id);
    }
    return selectedContent.connections.slice(0, 4);
  }, [selectedContent]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const navigateToNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.data.id === nodeId);
    if (node) setSelectedNode(node);
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    let f = filter ? nodes.filter((n) => n.data.type === filter) : [...nodes];
    if (searchQuery) f = f.filter((n) => n.data.label.toLowerCase().includes(searchQuery.toLowerCase()));
    return f;
  }, [filter, searchQuery, nodes]);

  const filteredEdges = useMemo(() => {
    const ids = new Set(filteredNodes.map((n) => n.id));
    return edges.filter((e) => ids.has(e.source) && ids.has(e.target));
  }, [filteredNodes, edges]);

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
          <h1 className="text-lg font-semibold text-white">Knowledge Graph</h1>
          <p className="text-[13px] text-[#888]">Click any node to explore. The system predicts what you need next.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search nodes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0a0a0a] border border-[#222] rounded-lg pl-9 pr-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#e63946]/50 w-48" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-[#1a1a1a] shrink-0 flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilter(null)}
          className={cn("text-[12px] uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all font-medium",
            !filter ? "bg-[#e63946]/10 border-[#e63946]/30 text-[#e63946]" : "border-[#222] text-[#555] hover:text-[#888]")}>
          All
        </button>
        {typeFilters.map((t) => (
          <button key={t.id} onClick={() => setFilter(filter === t.id ? null : t.id)}
            className={cn("flex items-center gap-1.5 text-[12px] uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all font-medium",
              filter === t.id ? "bg-[#e63946]/10 border-[#e63946]/30 text-[#e63946]" : "border-[#222] text-[#555] hover:text-[#888]")}>
            <t.icon className="w-3.5 h-3.5" style={{ color: t.color }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph */}
        <div className="flex-1 relative">
          <ReactFlow nodes={filteredNodes} edges={filteredEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick} nodeTypes={nodeTypes} fitView attributionPosition="bottom-right">
            <Background color="rgba(230,57,70,0.05)" gap={24} size={1} />
            <Controls className="!bg-[#0a0a0a] !border-[#222] !text-[#888] !rounded-lg" />
            <MiniMap className="!bg-[#0a0a0a] !border-[#222] !rounded-lg" maskColor="rgba(6,6,6,0.85)"
              nodeColor={(n) => ({ page: "#e63946", source: "#00b4d8", entity: "#f77f00", claim: "#4a7c59" }[n.data?.type as string] || "#555")} />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {selectedNode && selectedContent && (
            <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[380px] shrink-0 border-l border-[#1a1a1a] bg-[#080808] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-[#1a1a1a]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{
                      backgroundColor: selectedContent.type === "page" ? "#e63946" : selectedContent.type === "source" ? "#00b4d8" : selectedContent.type === "entity" ? "#f77f00" : "#4a7c59"
                    }} />
                    <span className="text-[11px] text-[#888] uppercase tracking-wider">{selectedContent.type}</span>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <h2 className="text-[18px] font-semibold text-white">{selectedContent.title}</h2>
                <p className="text-[13px] text-[#888] mt-2">{selectedContent.summary}</p>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="text-[14px] text-[#ccc] leading-relaxed whitespace-pre-wrap">{selectedContent.body}</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedContent.tags.map((t) => <span key={t} className="text-[11px] px-2 py-1 rounded bg-[#1a1a1a] text-[#888]">#{t}</span>)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#555]">
                  <Clock className="w-3 h-3" /> Recently updated
                </div>
                <div className="flex gap-2">
                  {selectedContent.type === "page" && (
                    <Link href={`/app/wiki/${selectedNode.data.id.replace("page-", "")}`} className="flex-1">
                      <span className="flex items-center justify-center gap-2 bg-[#e63946] hover:bg-[#ff2a3a] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors">
                        <BookOpen className="w-4 h-4" /> Read Article
                      </span>
                    </Link>
                  )}
                  <button className="flex items-center justify-center gap-2 border border-[#333] text-[#888] hover:text-white hover:border-[#555] px-4 py-2.5 rounded-lg text-[13px] transition-colors">
                    <Eye className="w-4 h-4" /> Sources
                  </button>
                </div>

                {/* Predicted */}
                <div className="border-t border-[#1a1a1a] pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-[#f77f00]" />
                    <span className="text-[12px] text-[#f77f00] uppercase tracking-wider font-semibold">Predicted Next</span>
                  </div>
                  <div className="space-y-2">
                    {predictedNodes.map((nodeId, i) => (
                      <PredictedCard key={nodeId} nodeId={nodeId} index={i} onClick={() => navigateToNode(nodeId)} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
