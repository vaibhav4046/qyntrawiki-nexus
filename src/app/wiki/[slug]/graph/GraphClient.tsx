"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
  Background, Controls, MiniMap, Node, Edge,
  useNodesState, useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box } from "lucide-react";

interface GraphEntity {
  id: string;
  name: string;
  type: string;
  description?: string;
  pageId?: string;
}

interface GraphRelation {
  id: string;
  fromPageId: string;
  toPageId: string;
  relationType: string;
  weight: number;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
}

interface Props {
  slug: string;
  initialEntities: GraphEntity[];
  initialRelations: GraphRelation[];
  initialPages: PageData[];
}

const nodeColors: Record<string, string> = {
  Product: "#ffeb3b",
  Concept: "#a78bfa",
  Person: "#00e5ff",
  Organization: "#34d399",
  Location: "#f472b6",
  Event: "#ffca28",
  unknown: "#6b7280",
};

function entityNodeColor(type: string): string {
  return nodeColors[type] || nodeColors.unknown;
}

export default function GraphClient({ slug, initialEntities, initialRelations, initialPages }: Props) {
  const router = useRouter();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!initialEntities.length && !initialPages.length) return { nodes: [], edges: [] };

    const pageMap = new Map(initialPages.map((p) => [p.id, p]));
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const placed = new Set<string>();

    initialPages.forEach((p, i) => {
      const color = "#ffeb3b";
      nodes.push({
        id: p.id,
        type: "default",
        position: { x: (i % 4) * 260, y: Math.floor(i / 4) * 140 },
        data: {
          label: p.title,
          pageSlug: p.slug,
          nodeType: "page",
        },
        style: {
          background: "rgba(21,18,14,0.9)",
          border: `2px solid ${color}`,
          borderRadius: "8px",
          padding: "10px 16px",
          color: "#f5efe6",
          fontSize: "13px",
          fontWeight: 600,
          boxShadow: `0 0 20px ${color}33, 0 0 40px ${color}11`,
          minWidth: 120,
        },
      });
      placed.add(p.id);
    });

    initialEntities.forEach((e, i) => {
      const color = entityNodeColor(e.type);
      nodes.push({
        id: e.id,
        type: "default",
        position: {
          x: 100 + (i % 5) * 220,
          y: 300 + Math.floor(i / 5) * 110,
        },
        data: {
          label: e.name,
          pageSlug: e.pageId ? pageMap.get(e.pageId)?.slug : null,
          nodeType: "entity",
          entityType: e.type,
        },
        style: {
          background: "rgba(21,18,14,0.85)",
          border: `1.5px solid ${color}`,
          borderRadius: "6px",
          padding: "8px 14px",
          color: "#f5efe6",
          fontSize: "12px",
          boxShadow: `0 0 12px ${color}22`,
          minWidth: 100,
        },
      });
      placed.add(e.id);
    });

    initialRelations.forEach((rel) => {
      const from = placed.has(rel.fromPageId) ? rel.fromPageId : null;
      const to = placed.has(rel.toPageId) ? rel.toPageId : null;
      if (!from && !to) return;

      const sourceId = from || rel.fromPageId;
      const targetId = to || rel.toPageId;

      edges.push({
        id: rel.id,
        source: sourceId,
        target: targetId,
        label: rel.relationType,
        animated: true,
        style: {
          stroke: "#ffeb3b44",
          strokeWidth: Math.max(1, rel.weight * 2),
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#ffeb3b66",
        },
        labelStyle: { fill: "#a89b8c", fontSize: 10 },
        labelBgStyle: { fill: "rgba(13,10,8,0.8)" },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 3,
      });
    });

    return { nodes, edges };
  }, [initialEntities, initialPages, initialRelations]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  function onNodeClick(_event: React.MouseEvent, node: Node) {
    const pageSlug = node.data?.pageSlug as string | undefined;
    if (pageSlug) {
      router.push(`/wiki/${slug}/page/${pageSlug}`);
    }
  }

  if (initialEntities.length === 0 && initialPages.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Graph</h1>
        <p className="text-muted-foreground mb-8">Knowledge graph for {slug}</p>
        <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border rounded-lg">
          <Box className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-muted-foreground text-lg font-medium">No graph data yet</p>
          <p className="text-muted-foreground text-sm">Add sources and compile them to populate the knowledge graph</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center gap-4 flex-shrink-0">
        <h1 className="text-lg font-bold tracking-tight">Graph</h1>
        <span className="text-sm text-muted-foreground">{slug}</span>
        <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            {initialNodes.filter((n) => n.data?.nodeType === "page").length} pages
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
            {initialNodes.filter((n) => n.data?.nodeType === "entity").length} entities
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-0.5 bg-primary/40 inline-block" />
            {initialEdges.length} relations
          </span>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
          style={{ background: "#0d0a08" }}
        >
          <Background color="#2d261e" gap={24} size={1} />
          <Controls
            className="[&>button]:!bg-card [&>button]:!border-border [&>button]:!text-muted-foreground [&>button]:hover:!bg-accent"
            style={{ borderRadius: "8px", overflow: "hidden" }}
          />
          <MiniMap
            nodeColor={(node: Node) => {
              if (node.data?.nodeType === "entity") {
                return entityNodeColor(node.data?.entityType || "unknown");
              }
              return "#ffeb3b";
            }}
            style={{ background: "rgba(21,18,14,0.9)", border: "1px solid #2d261e", borderRadius: "8px" }}
            maskColor="rgba(13,10,8,0.6)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
