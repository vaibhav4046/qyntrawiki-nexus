"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import KnowledgeTree from "@/components/KnowledgeTree";
import {
  Search,
  Filter,
  BookOpen,
  Database,
  FileText,
  Lightbulb,
  AlertTriangle,
  X,
  ArrowRight,
  GitBranch,
  TreePine,
} from "lucide-react";

// Demo graph data
const initialNodes: Node[] = [
  // Pages - amber
  { id: "page-hydradb", type: "default", position: { x: 0, y: 0 }, data: { label: "HydraDB", type: "page" }, style: { background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: 12, fontWeight: 700, width: 120, padding: 8 } },
  { id: "page-context", type: "default", position: { x: 200, y: -80 }, data: { label: "Context Graph", type: "page" }, style: { background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: 12, fontWeight: 700, width: 120, padding: 8 } },
  { id: "page-llm", type: "default", position: { x: -150, y: 100 }, data: { label: "LLM Wiki", type: "page" }, style: { background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: 12, fontWeight: 700, width: 120, padding: 8 } },
  { id: "page-vector", type: "default", position: { x: 150, y: 120 }, data: { label: "Vector Search Limits", type: "page" }, style: { background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: 12, fontWeight: 700, width: 140, padding: 8 } },
  { id: "page-rag", type: "default", position: { x: -100, y: -100 }, data: { label: "RAG vs Wiki", type: "page" }, style: { background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: 12, fontWeight: 700, width: 120, padding: 8 } },
  { id: "page-pkos", type: "default", position: { x: 300, y: 80 }, data: { label: "Personal Knowledge OS", type: "page" }, style: { background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: 12, fontWeight: 700, width: 140, padding: 8 } },
  { id: "page-student", type: "default", position: { x: -250, y: -20 }, data: { label: "Student Job Agent", type: "page" }, style: { background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: 12, fontWeight: 700, width: 130, padding: 8 } },
  { id: "page-contra", type: "default", position: { x: 80, y: 220 }, data: { label: "Contradiction Detection", type: "page" }, style: { background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", color: "#fbbf24", fontSize: 12, fontWeight: 700, width: 140, padding: 8 } },

  // Sources - blue
  { id: "src-hydradb", type: "default", position: { x: -80, y: -180 }, data: { label: "HydraDB Overview", type: "source" }, style: { background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#60a5fa", fontSize: 11, width: 120, padding: 6 } },
  { id: "src-llm", type: "default", position: { x: -280, y: 80 }, data: { label: "LLM Wiki Pattern", type: "source" }, style: { background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#60a5fa", fontSize: 11, width: 120, padding: 6 } },
  { id: "src-vector", type: "default", position: { x: 280, y: 180 }, data: { label: "Vector Search Limits", type: "source" }, style: { background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#60a5fa", fontSize: 11, width: 130, padding: 6 } },
  { id: "src-counter", type: "default", position: { x: 350, y: -60 }, data: { label: "Counter: Vector DBs", type: "source" }, style: { background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#60a5fa", fontSize: 11, width: 130, padding: 6 } },

  // Entities - orange
  { id: "ent-hydradb", type: "default", position: { x: 50, y: -140 }, data: { label: "HydraDB (Entity)", type: "entity" }, style: { background: "rgba(234, 88, 12, 0.2)", border: "1px solid rgba(234, 88, 12, 0.4)", color: "#fb923c", fontSize: 11, width: 110, padding: 6 } },
  { id: "ent-vector", type: "default", position: { x: 400, y: 40 }, data: { label: "Vector Database", type: "entity" }, style: { background: "rgba(234, 88, 12, 0.2)", border: "1px solid rgba(234, 88, 12, 0.4)", color: "#fb923c", fontSize: 11, width: 110, padding: 6 } },
  { id: "ent-llm", type: "default", position: { x: -200, y: -140 }, data: { label: "LLM Wiki", type: "entity" }, style: { background: "rgba(234, 88, 12, 0.2)", border: "1px solid rgba(234, 88, 12, 0.4)", color: "#fb923c", fontSize: 11, width: 90, padding: 6 } },

  // Claims - red
  { id: "claim-1", type: "default", position: { x: -50, y: 180 }, data: { label: "Claim: HydraDB is graph-first", type: "claim" }, style: { background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "#f87171", fontSize: 10, width: 140, padding: 5 } },
  { id: "claim-2", type: "default", position: { x: 250, y: -160 }, data: { label: "Claim: Vector DB insufficient", type: "claim" }, style: { background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "#f87171", fontSize: 10, width: 140, padding: 5 } },
  { id: "claim-3", type: "default", position: { x: -350, y: -100 }, data: { label: "Claim: RAG is stateless", type: "claim" }, style: { background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "#f87171", fontSize: 10, width: 130, padding: 5 } },
];

const initialEdges: Edge[] = [
  // Page relationships
  { id: "e1", source: "page-hydradb", target: "page-context", label: "BUILDS", style: { stroke: "rgba(245, 158, 11, 0.5)", strokeWidth: 2 }, labelStyle: { fill: "#fbbf24", fontSize: 10 } },
  { id: "e2", source: "page-hydradb", target: "page-vector", label: "CONTRASTS", style: { stroke: "rgba(220, 38, 38, 0.5)", strokeWidth: 2 }, labelStyle: { fill: "#f87171", fontSize: 10 } },
  { id: "e3", source: "page-llm", target: "page-hydradb", label: "USES", style: { stroke: "rgba(245, 158, 11, 0.5)", strokeWidth: 2 }, labelStyle: { fill: "#fbbf24", fontSize: 10 } },
  { id: "e4", source: "page-context", target: "page-contra", label: "ENABLES", style: { stroke: "rgba(245, 158, 11, 0.5)", strokeWidth: 2 }, labelStyle: { fill: "#fbbf24", fontSize: 10 } },
  { id: "e5", source: "page-rag", target: "page-llm", label: "COMPARES", style: { stroke: "rgba(245, 158, 11, 0.5)", strokeWidth: 2 }, labelStyle: { fill: "#fbbf24", fontSize: 10 } },
  { id: "e6", source: "page-rag", target: "page-vector", label: "REFERENCES", style: { stroke: "rgba(59, 130, 246, 0.5)", strokeWidth: 2 }, labelStyle: { fill: "#60a5fa", fontSize: 10 } },
  { id: "e7", source: "page-pkos", target: "page-llm", label: "USES", style: { stroke: "rgba(245, 158, 11, 0.5)", strokeWidth: 2 }, labelStyle: { fill: "#fbbf24", fontSize: 10 } },
  { id: "e8", source: "page-student", target: "page-hydradb", label: "USES", style: { stroke: "rgba(245, 158, 11, 0.5)", strokeWidth: 2 }, labelStyle: { fill: "#fbbf24", fontSize: 10 } },

  // Sources to pages
  { id: "e9", source: "src-hydradb", target: "page-hydradb", style: { stroke: "rgba(59, 130, 246, 0.4)", strokeWidth: 1.5 }, animated: true },
  { id: "e10", source: "src-llm", target: "page-llm", style: { stroke: "rgba(59, 130, 246, 0.4)", strokeWidth: 1.5 }, animated: true },
  { id: "e11", source: "src-vector", target: "page-vector", style: { stroke: "rgba(59, 130, 246, 0.4)", strokeWidth: 1.5 }, animated: true },
  { id: "e12", source: "src-counter", target: "page-vector", style: { stroke: "rgba(220, 38, 38, 0.4)", strokeWidth: 1.5, strokeDasharray: "5,5" }, animated: true },

  // Entities to pages
  { id: "e13", source: "ent-hydradb", target: "page-hydradb", style: { stroke: "rgba(234, 88, 12, 0.4)", strokeWidth: 1.5 } },
  { id: "e14", source: "ent-vector", target: "page-vector", style: { stroke: "rgba(234, 88, 12, 0.4)", strokeWidth: 1.5 } },
  { id: "e15", source: "ent-llm", target: "page-llm", style: { stroke: "rgba(234, 88, 12, 0.4)", strokeWidth: 1.5 } },

  // Claims to pages
  { id: "e16", source: "claim-1", target: "page-hydradb", style: { stroke: "rgba(34, 197, 94, 0.4)", strokeWidth: 1.5 } },
  { id: "e17", source: "claim-2", target: "page-vector", style: { stroke: "rgba(220, 38, 38, 0.4)", strokeWidth: 1.5, strokeDasharray: "5,5" } },
  { id: "e18", source: "claim-3", target: "page-rag", style: { stroke: "rgba(34, 197, 94, 0.4)", strokeWidth: 1.5 } },
];

const nodeTypes = [
  { id: "page", label: "Pages", color: "bg-amber-500", icon: BookOpen },
  { id: "source", label: "Sources", color: "bg-blue-500", icon: Database },
  { id: "entity", label: "Entities", color: "bg-orange-500", icon: Lightbulb },
  { id: "claim", label: "Claims", color: "bg-red-500", icon: AlertTriangle },
  { id: "file", label: "Files", color: "bg-emerald-500", icon: FileText },
];

export default function GraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [view, setView] = useState<"flow" | "tree">("flow");

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const filteredNodes = filter
    ? initialNodes.filter((n) => n.data.type === filter)
    : initialNodes;
  const filteredEdges = filter
    ? initialEdges.filter(
        (e) =>
          filteredNodes.find((n) => n.id === e.source) &&
          filteredNodes.find((n) => n.id === e.target)
      )
    : initialEdges;

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* Header */}
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-4 shrink-0">
        <h1 className="text-2xl font-bold text-[#f5f0eb]">Hydra Memory Graph</h1>
        <p className="mt-1 text-sm text-[#a89f91]">
          Explore pages, sources, entities, claims, and their relationships
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 sm:px-8 lg:px-10 pb-4 shrink-0 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            "text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all",
            !filter
              ? "bg-[rgba(245,158,11,0.2)] text-[#fbbf24]"
              : "text-[#6b6560] hover:text-[#a89f91]"
          )}
        >
          All
        </button>
        {nodeTypes.map((nt) => {
          const Icon = nt.icon;
          return (
            <button
              key={nt.id}
              onClick={() => setFilter(filter === nt.id ? null : nt.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all",
                filter === nt.id
                  ? "bg-[rgba(245,158,11,0.2)] text-[#fbbf24]"
                  : "text-[#6b6560] hover:text-[#a89f91]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {nt.label}
            </button>
          );
        })}
        <div className="flex items-center gap-2 ml-auto">
          <Search className="w-4 h-4 text-[#6b6560]" />
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-40 text-xs rounded py-1.5 px-3"
          />
        </div>
      </div>

      {/* View toggle */}
      <div className="px-6 sm:px-8 lg:px-10 pb-4 shrink-0 flex items-center gap-2">
        <button
          onClick={() => setView("flow")}
          className={cn(
            "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all",
            view === "flow"
              ? "bg-[rgba(245,158,11,0.2)] text-[#fbbf24]"
              : "text-[#6b6560] hover:text-[#a89f91]"
          )}
        >
          <GitBranch className="w-3.5 h-3.5" />
          Interactive Graph
        </button>
        <button
          onClick={() => setView("tree")}
          className={cn(
            "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all",
            view === "tree"
              ? "bg-[rgba(245,158,11,0.2)] text-[#fbbf24]"
              : "text-[#6b6560] hover:text-[#a89f91]"
          )}
        >
          <TreePine className="w-3.5 h-3.5" />
          Animated Tree
        </button>
      </div>

      {/* Graph */}
      <div className="flex-1 px-6 sm:px-8 lg:px-10 pb-6 min-h-[500px]">
        <div className="glass-panel rounded-lg h-full min-h-[500px] overflow-hidden relative">
          {view === "tree" ? (
            <div className="w-full h-full">
              <KnowledgeTree />
            </div>
          ) : (
          <ReactFlow
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="rgba(245, 158, 11, 0.1)" gap={20} size={1} />
            <Controls className="!bg-[#0f0f0f] !border-[rgba(234,88,12,0.2)] !text-[#a89f91]" />
            <MiniMap
              className="!bg-[#0f0f0f] !border-[rgba(234,88,12,0.2)]"
              maskColor="rgba(10, 10, 10, 0.8)"
              nodeColor={(n) => {
                if (n.data?.type === "page") return "rgba(245, 158, 11, 0.6)";
                if (n.data?.type === "source") return "rgba(59, 130, 246, 0.6)";
                if (n.data?.type === "entity") return "rgba(234, 88, 12, 0.6)";
                if (n.data?.type === "claim") return "rgba(220, 38, 38, 0.6)";
                return "rgba(107, 101, 96, 0.4)";
              }}
            />
           </ReactFlow>
          )}
        </div>
      </div>

      {/* Side panel for selected node */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 glass-panel rounded-lg p-5 max-w-sm w-full shadow-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  selectedNode.data?.type === "page" && "bg-amber-500",
                  selectedNode.data?.type === "source" && "bg-blue-500",
                  selectedNode.data?.type === "entity" && "bg-orange-500",
                  selectedNode.data?.type === "claim" && "bg-red-500"
                )}
              />
              <span className="text-xs font-bold text-[#f5f0eb] uppercase tracking-wider">
                {selectedNode.data?.type}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[#6b6560] hover:text-[#f5f0eb]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-sm font-bold text-[#f5f0eb] mb-2">
            {selectedNode.data?.label}
          </h3>
          <div className="flex gap-2">
            {selectedNode.data?.type === "page" && (
              <a
                href={`/app/wiki/${selectedNode.id.replace("page-", "")}`}
                className="text-xs text-[#fbbf24] hover:underline flex items-center gap-1"
              >
                View Article <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
