"use client";

import React, { useMemo } from "react";
import KnowledgeTree from "@/components/KnowledgeTree";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  Folder,
  Cloud,
  FileText,
  Link2,
  Database,
  Globe,
  Image as ImageIcon,
  Layers,
  Shield,
  Check,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Send,
  User,
  Bot,
  Share2,
  Code,
  ExternalLink,
  BookOpen,
  Zap,
  Sparkles,
  ArrowRight,
  ChevronRight,
  GitBranch,
  Clock,
  AlertCircle,
  RefreshCw,
  HardDrive,
  Briefcase,
  Rss,
  Lock,
  Unlock,
} from "lucide-react";

/* ─── Seeded PRNG for deterministic SSR/client parity ─── */
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/* ─── Reusable scroll-reveal wrapper ─── */
function SectionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating warm particles ─── */
function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const s1 = seededRandom(i * 1 + 1);
        const s2 = seededRandom(i * 2 + 101);
        const s3 = seededRandom(i * 3 + 201);
        const s4 = seededRandom(i * 4 + 301);
        const s5 = seededRandom(i * 5 + 401);
        return {
          id: i,
          size: s1 * 4 + 2,
          left: s2 * 100,
          top: s3 * 100,
          delay: s4 * 5,
          duration: s5 * 4 + 4,
          color: ["#f59e0b", "#ea580c", "#fb923c", "#dc2626", "#fbbf24"][
            Math.floor(s1 * 5)
          ],
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Hero background network graph ─── */
function HeroNetworkGraph() {
  const nodes = useMemo(
    () => [
      { x: 12, y: 18, r: 3 },
      { x: 22, y: 32, r: 2 },
      { x: 34, y: 14, r: 4 },
      { x: 48, y: 28, r: 3 },
      { x: 62, y: 16, r: 2 },
      { x: 74, y: 34, r: 3 },
      { x: 86, y: 20, r: 2 },
      { x: 18, y: 52, r: 2 },
      { x: 38, y: 58, r: 3 },
      { x: 58, y: 52, r: 4 },
      { x: 78, y: 58, r: 2 },
      { x: 28, y: 74, r: 3 },
      { x: 54, y: 78, r: 2 },
      { x: 70, y: 70, r: 3 },
      { x: 44, y: 42, r: 3 },
      { x: 66, y: 42, r: 2 },
    ],
    []
  );

  const edges = useMemo(
    () => [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [0, 7],
      [7, 8],
      [8, 9],
      [9, 10],
      [1, 8],
      [2, 14],
      [3, 14],
      [3, 9],
      [4, 9],
      [7, 11],
      [11, 12],
      [12, 13],
      [9, 13],
      [14, 15],
      [15, 9],
      [11, 8],
    ],
    []
  );

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {edges.map((e, i) => (
        <line
          key={`e-${i}`}
          x1={nodes[e[0]].x}
          y1={nodes[e[0]].y}
          x2={nodes[e[1]].x}
          y2={nodes[e[1]].y}
          stroke="rgba(245,158,11,0.15)"
          strokeWidth="0.2"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={`n-${i}`}
          cx={n.x}
          cy={n.y}
          r={n.r * 0.35}
          fill="rgba(245,158,11,0.5)"
          className="graph-node"
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}
    </svg>
  );
}

/* ─── Connector data ─── */
const connectors = [
  {
    name: "Local Folder",
    desc: "Sync markdown, PDFs, and text files from any directory.",
    icon: Folder,
    badge: "Local",
    badgeClass: "badge-amber",
  },
  {
    name: "Google Drive",
    desc: "Permission-first OAuth import of Docs & Sheets.",
    icon: Cloud,
    badge: "OAuth",
    badgeClass: "badge-blue",
  },
  {
    name: "Notion",
    desc: "Pull pages and databases with granular access.",
    icon: Layers,
    badge: "OAuth",
    badgeClass: "badge-blue",
  },
  {
    name: "LinkedIn Export",
    desc: "Import your profile, posts, and connections archive.",
    icon: Briefcase,
    badge: "Export file",
    badgeClass: "badge-green",
  },
  {
    name: "Instagram Export",
    desc: "Parse your data export into cited media pages.",
    icon: ImageIcon,
    badge: "Export file",
    badgeClass: "badge-green",
  },
  {
    name: "Manual URL",
    desc: "Add any public link as a cited source.",
    icon: Link2,
    badge: "Manual",
    badgeClass: "badge-amber",
  },
  {
    name: "Demo Dataset",
    desc: "Instantly load a pre-built demo wiki.",
    icon: Database,
    badge: "Built-in",
    badgeClass: "badge-amber",
  },
];

/* ─── Wiki article mockups ─── */
const wikiArticles = [
  {
    title: "Jane Doe",
    subtitle: "Person · Auto-generated",
    widths: ["100%", "92%", "85%", "78%"],
    infobox: [
      { label: "Born", value: "1990" },
      { label: "Occupation", value: "Engineer" },
      { label: "Known for", value: "HydraDB" },
    ],
  },
  {
    title: "HydraDB",
    subtitle: "Technology · Auto-generated",
    widths: ["100%", "94%", "80%", "88%"],
    infobox: [
      { label: "Developer", value: "Qyntra" },
      { label: "Type", value: "Graph DB" },
      { label: "License", value: "MIT" },
    ],
  },
  {
    title: "WikiThon 2026",
    subtitle: "Event · Auto-generated",
    widths: ["100%", "90%", "82%", "76%"],
    infobox: [
      { label: "Date", value: "May 2026" },
      { label: "Location", value: "Global" },
      { label: "Theme", value: "Knowledge" },
    ],
  },
];

/* ─── File browser mock data ─── */
const files = [
  { name: "resume.md", type: "md", size: "12 KB", date: "May 15, 2026" },
  { name: "project-notes.md", type: "md", size: "8 KB", date: "May 14, 2026" },
  { name: "linkedin-export.zip", type: "zip", size: "4.2 MB", date: "May 10, 2026" },
  { name: "meeting-transcript.txt", type: "txt", size: "24 KB", date: "May 12, 2026" },
  { name: "research.pdf", type: "pdf", size: "1.1 MB", date: "May 8, 2026" },
  { name: "photo-archive", type: "folder", size: "--", date: "Apr 30, 2026" },
];

/* ─── Graph section SVG ─── */
function MemoryGraph() {
  const nodes = [
    { id: "p1", x: 150, y: 80, r: 18, label: "Page", color: "#f59e0b" },
    { id: "p2", x: 320, y: 60, r: 14, label: "Page", color: "#f59e0b" },
    { id: "s1", x: 80, y: 180, r: 12, label: "Source", color: "#ea580c" },
    { id: "s2", x: 260, y: 200, r: 12, label: "Source", color: "#ea580c" },
    { id: "e1", x: 200, y: 140, r: 16, label: "Entity", color: "#fb923c" },
    { id: "e2", x: 380, y: 150, r: 14, label: "Entity", color: "#fb923c" },
    { id: "c1", x: 140, y: 260, r: 10, label: "Claim", color: "#dc2626" },
    { id: "c2", x: 300, y: 280, r: 10, label: "Claim", color: "#dc2626" },
    { id: "c3", x: 420, y: 240, r: 10, label: "Claim", color: "#dc2626" },
  ];
  const edges = [
    ["p1", "e1"],
    ["p2", "e1"],
    ["p2", "e2"],
    ["s1", "e1"],
    ["s2", "e1"],
    ["s2", "e2"],
    ["e1", "c1"],
    ["e1", "c2"],
    ["e2", "c2"],
    ["e2", "c3"],
  ];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox="0 0 480 320" className="w-full h-auto">
      {edges.map(([a, b], i) => (
        <line
          key={`l-${i}`}
          x1={nodeMap.get(a)!.x}
          y1={nodeMap.get(a)!.y}
          x2={nodeMap.get(b)!.x}
          y2={nodeMap.get(b)!.y}
          stroke="rgba(245,158,11,0.2)"
          strokeWidth="1.5"
        />
      ))}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill="rgba(20,18,16,0.8)"
            stroke={n.color}
            strokeWidth="2"
            className="graph-node"
          />
          <text
            x={n.x}
            y={n.y + n.r + 14}
            textAnchor="middle"
            fill="#a89f91"
            fontSize="10"
            fontFamily="monospace"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Chat mockup ─── */
const chatMessages = [
  {
    from: "user" as const,
    text: "What projects did I work on in 2024?",
  },
  {
    from: "bot" as const,
    text: "Based on your notes and LinkedIn export, you worked on three major projects in 2024:\n\n1. HydraDB core refactor (source: resume.md)\n2. WikiThon landing page (source: project-notes.md)\n3. QyntraWiki Nexus prototype (source: github.com/...)",
  },
];

/* ─── Main page ─── */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-[#f5f0eb] overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-gradient-hero overflow-hidden">
        {/* Animated Knowledge Tree Background */}
        <div className="absolute inset-0 z-0 opacity-60">
          <KnowledgeTree />
        </div>
        {/* Gradient overlay to fade bottom of tree */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent z-[1] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full"
          >
            <Sparkles className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#fb923c]">
              HydraDB WikiThon 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6"
          >
            Your own Wikipedia,{" "}
            <span className="gradient-text">built from your life.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-[#a89f91] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Connect files, notes, links, exports, and cloud knowledge.
            QyntraWiki Nexus compiles them into a cited, searchable,
            HydraDB-powered personal wiki.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/app"
              className="btn-primary rounded-sm inline-flex items-center gap-2"
            >
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/app"
              className="btn-secondary rounded-sm inline-flex items-center gap-2"
            >
              Load Demo <Database className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#6b6560]"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#ea580c] to-transparent" />
        </motion.div>
      </section>

      {/* ── CONNECTORS ── */}
      <section className="relative px-6 py-24 bg-gradient-warm">
        <div className="max-w-6xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <div className="section-title">Integrations</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Permission-first{" "}
                <span className="gradient-text">connectors</span>
              </h2>
              <p className="text-[#a89f91] max-w-xl mx-auto">
                Your data stays under your control. Every connector asks before
                it reads.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {connectors.map((c, i) => (
              <SectionReveal key={c.name} delay={i * 0.08}>
                <div className="glass-card rounded-lg p-5 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.15)] flex items-center justify-center">
                      <c.icon className="w-5 h-5 text-[#f59e0b]" />
                    </div>
                    <span className={`badge ${c.badgeClass}`}>{c.badge}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#f5f0eb] mb-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-[#a89f91] leading-relaxed flex-1">
                    {c.desc}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WIKI PAGES ── */}
      <section className="relative px-6 py-24 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <div className="section-title">Output</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Auto-generated{" "}
                <span className="gradient-text">wiki pages</span>
              </h2>
              <p className="text-[#a89f91] max-w-xl mx-auto">
                Wikipedia-style articles with infoboxes, inline citations, and
                backlink navigation.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {wikiArticles.map((article, i) => (
              <SectionReveal key={article.title} delay={i * 0.12}>
                <div className="glass-card rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="p-4 border-b border-[rgba(234,88,12,0.1)]">
                    <h3 className="text-lg font-bold text-[#f5f0eb]">
                      {article.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-wider text-[#6b6560] mt-1">
                      {article.subtitle}
                    </p>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="infobox mb-4 rounded">
                      <div className="infobox-header">{article.title}</div>
                      <table className="w-full text-xs">
                        <tbody>
                          {article.infobox.map((row) => (
                            <tr
                              key={row.label}
                              className="border-b border-[rgba(107,101,96,0.1)] last:border-0"
                            >
                              <td className="py-1.5 pr-3 text-[#6b6560] font-medium">
                                {row.label}
                              </td>
                              <td className="py-1.5 text-[#a89f91]">
                                {row.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="space-y-2">
                      {article.widths.map((w, li) => (
                        <div
                          key={li}
                          className={`h-2 rounded ${
                            li === 0
                              ? "bg-[rgba(245,158,11,0.15)]"
                              : "bg-[rgba(107,101,96,0.15)]"
                          }`}
                          style={{ width: w }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-[rgba(234,88,12,0.1)] flex items-center gap-2 text-[10px] text-[#6b6560]">
                    <BookOpen className="w-3 h-3" />
                    <span>Read article</span>
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILE BROWSER ── */}
      <section className="relative px-6 py-24 bg-gradient-warm">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <div className="section-title">Browse</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Personal <span className="gradient-text">file browser</span>
              </h2>
              <p className="text-[#a89f91] max-w-xl mx-auto">
                Search, filter, and preview every file that feeds your wiki.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="glass-panel rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-[rgba(234,88,12,0.1)]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6560]" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full pl-9 pr-4 py-2 rounded text-sm"
                    readOnly
                  />
                </div>
                <button className="btn-ghost rounded-sm inline-flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
                <button className="btn-ghost rounded-sm inline-flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(107,101,96,0.15)] text-[#6b6560] text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-semibold">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Size
                      </th>
                      <th className="text-left px-4 py-3 font-semibold">
                        Modified
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f) => (
                      <tr
                        key={f.name}
                        className="border-b border-[rgba(107,101,96,0.08)] hover:bg-[rgba(245,158,11,0.03)] transition-colors"
                      >
                        <td className="px-4 py-3 flex items-center gap-2 text-[#f5f0eb]">
                          {f.type === "folder" ? (
                            <Folder className="w-4 h-4 text-[#f59e0b]" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#fb923c]" />
                          )}
                          {f.name}
                        </td>
                        <td className="px-4 py-3 text-[#a89f91] uppercase text-xs">
                          {f.type}
                        </td>
                        <td className="px-4 py-3 text-[#a89f91]">{f.size}</td>
                        <td className="px-4 py-3 text-[#6b6560] text-xs">
                          {f.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── GRAPH ── */}
      <section className="relative px-6 py-24 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <div className="section-title">Memory</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                HydraDB <span className="gradient-text">memory graph</span>
              </h2>
              <p className="text-[#a89f91] max-w-xl mx-auto">
                Every page, source, entity, and claim is a node. Relationships
                are edges.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="glass-panel rounded-lg p-6 md:p-10 flex flex-col items-center">
              <MemoryGraph />
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
                {[
                  { label: "Page", color: "#f59e0b" },
                  { label: "Source", color: "#ea580c" },
                  { label: "Entity", color: "#fb923c" },
                  { label: "Claim", color: "#dc2626" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-[rgba(255,255,255,0.1)]"
                      style={{ backgroundColor: l.color }}
                    />
                    <span className="text-[#a89f91] uppercase tracking-wider font-semibold">
                      {l.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── ASK ── */}
      <section className="relative px-6 py-24 bg-gradient-warm">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <div className="section-title">Ask</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ask your own <span className="gradient-text">knowledge</span>
              </h2>
              <p className="text-[#a89f91] max-w-xl mx-auto">
                Natural language queries over your personal wiki, with cited,
                verifiable answers.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="glass-panel rounded-lg overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(234,88,12,0.1)]">
                <MessageSquare className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#a89f91]">
                  Qyntra Assistant
                </span>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-[#6b6560]">
                  <Zap className="w-3 h-3 text-[#f59e0b]" /> HydraDB-powered
                </span>
              </div>
              <div className="p-4 space-y-4 bg-[rgba(10,10,10,0.4)]">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      msg.from === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.from === "user"
                          ? "bg-[rgba(234,88,12,0.15)] border border-[rgba(234,88,12,0.2)]"
                          : "bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.2)]"
                      }`}
                    >
                      {msg.from === "user" ? (
                        <User className="w-4 h-4 text-[#fb923c]" />
                      ) : (
                        <Bot className="w-4 h-4 text-[#f59e0b]" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-3 text-sm leading-relaxed max-w-[80%] ${
                        msg.from === "user"
                          ? "bg-[rgba(234,88,12,0.1)] border border-[rgba(234,88,12,0.15)] text-[#f5f0eb]"
                          : "bg-[rgba(25,22,18,0.8)] border border-[rgba(107,101,96,0.15)] text-[#a89f91]"
                      }`}
                    >
                      {msg.text.split("\n").map((line, li) => (
                        <p key={li} className={li > 0 ? "mt-1" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-[rgba(234,88,12,0.1)] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask anything about your data..."
                  className="flex-1 rounded text-sm"
                  readOnly
                />
                <button className="w-9 h-9 rounded bg-gradient-to-br from-[#ea580c] to-[#dc2626] flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.3)]">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── PUBLISH ── */}
      <section className="relative px-6 py-24 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="text-center mb-16">
              <div className="section-title">Publish</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Publish <span className="gradient-text">selected pages</span>
              </h2>
              <p className="text-[#a89f91] max-w-xl mx-auto">
                Curate a public-facing wiki from your private knowledge. Share
                what matters.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="glass-panel rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(234,88,12,0.1)] bg-[rgba(234,88,12,0.05)]">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#f59e0b]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#a89f91]">
                    Public Wiki Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-green">
                    <Check className="w-3 h-3" /> Live
                  </span>
                  <button className="btn-primary rounded-sm text-[10px] py-1.5 px-3 inline-flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> Publish
                  </button>
                </div>
              </div>
              <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold text-[#f5f0eb]">
                      Jane Doe
                    </h3>
                    <span className="badge badge-amber text-[10px]">
                      Public
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-full rounded bg-[rgba(245,158,11,0.12)]" />
                    <div className="h-3 w-[92%] rounded bg-[rgba(107,101,96,0.12)]" />
                    <div className="h-3 w-[88%] rounded bg-[rgba(107,101,96,0.12)]" />
                    <div className="h-3 w-[95%] rounded bg-[rgba(107,101,96,0.12)]" />
                    <div className="h-3 w-[80%] rounded bg-[rgba(107,101,96,0.12)]" />
                  </div>
                  <div className="mt-6 flex items-center gap-4 text-[10px] uppercase tracking-wider text-[#6b6560]">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> 12 pages
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" /> 48 sources
                    </span>
                    <span className="flex items-center gap-1">
                      <Rss className="w-3 h-3" /> RSS feed
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-64 flex-shrink-0">
                  <div className="infobox rounded h-full">
                    <div className="infobox-header">Page Info</div>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#6b6560]">Visibility</span>
                        <span className="text-[#fbbf24] font-semibold">
                          Public
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b6560]">Last edited</span>
                        <span className="text-[#a89f91]">May 15, 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b6560]">Citations</span>
                        <span className="text-[#a89f91]">24</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6b6560]">Backlinks</span>
                        <span className="text-[#a89f91]">7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative px-6 py-16 border-t border-[rgba(234,88,12,0.1)] bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-[#ea580c]" />
              <span className="text-lg font-bold tracking-tight text-[#f5f0eb]">
                QyntraWiki <span className="gradient-text">Nexus</span>
              </span>
            </div>
            <p className="text-xs text-[#6b6560]">Built for HydraDB WikiThon</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-wider text-[#a89f91]">
            <Link
              href="/app"
              className="hover:text-[#fbbf24] transition-colors inline-flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" /> App
            </Link>
            <a
              href="https://hydradb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#fbbf24] transition-colors inline-flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" /> HydraDB
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#fbbf24] transition-colors inline-flex items-center gap-1"
            >
              <Code className="w-3.5 h-3.5" /> GitHub
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-[rgba(107,101,96,0.1)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#6b6560] uppercase tracking-widest">
          <span>© 2026 QyntraWiki Nexus</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ea580c]" /> Powered by
            HydraDB
          </span>
        </div>
      </footer>
    </main>
  );
}
