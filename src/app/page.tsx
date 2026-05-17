"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Database, Sparkles, Shield, BookOpen,
  FolderOpen, GitBranch, MessageSquare, Globe, FileText,
  Check, X, Zap, Server, Users, Lock,
} from "lucide-react";
import KnowledgeTree from "@/components/KnowledgeTree";

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, target, { duration: 2, ease: "easeOut" });
    return controls.stop;
  }, [inView, target, count]);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(String(v)));
    return unsub;
  }, [rounded]);

  if (!inView) return <span ref={ref}>{prefix}0{suffix}</span>;
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* ─── Section Reveal ─── */
function SectionReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stats ─── */
const stats = [
  { value: 9, suffix: "+", label: "Connectors" },
  { value: 8, label: "Wiki Pages" },
  { value: 18, label: "Citations" },
  { value: 4, label: "Contradictions" },
];

const connectors = [
  { name: "Local Folder", desc: "Index any directory with permission", icon: FolderOpen },
  { name: "Google Drive", desc: "OAuth-ready connector", icon: Globe },
  { name: "Notion", desc: "Integration token or export", icon: FileText },
  { name: "LinkedIn Export", desc: "Import your profile archive", icon: Users },
  { name: "Instagram Export", desc: "Import your saved content", icon: FileText },
  { name: "Manual URL", desc: "Add any public link", icon: Sparkles },
  { name: "Demo Dataset", desc: "Pre-built AI memory encyclopedia", icon: Database },
];

const comparisonFeatures = [
  { label: "Persistent memory across sessions", with: true, without: false },
  { label: "Cited, traceable sources", with: true, without: false },
  { label: "Contradiction detection", with: true, without: false },
  { label: "Graph-based relationships", with: true, without: false },
  { label: "Wiki-style articles", with: true, without: false },
  { label: "Public publishing", with: true, without: false },
  { label: "1-click demo load", with: true, without: false },
];

const wikiPages = [
  { title: "HydraDB", summary: "Graph-first context infrastructure for AI agents — replaces vector-only retrieval with intelligent recall pipeline.", tags: ["Product", "AI"], color: "text-amber-400" },
  { title: "Context Graph", summary: "Persistent, evolving knowledge structure tracking entities, relationships, and temporal signals across documents.", tags: ["Concept"], color: "text-blue-400" },
  { title: "LLM Wiki", summary: "AI-maintained wiki that builds structured, interlinked articles with cross-references and automatic updates.", tags: ["Concept", "Pattern"], color: "text-green-400" },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-primary text-primary overflow-x-hidden font-[family-name:var(--font-sans)]">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-50">
          <KnowledgeTree />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-[#080808] to-transparent z-[1] pointer-events-none" />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold tracking-tight">QyntraWiki</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/app" className="btn-secondary text-sm py-2.5 px-5">Open App</Link>
              <Link href="/app/connect" className="btn-primary text-sm py-2.5 px-5">Start Now</Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label mb-6">HydraDB WikiThon 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="h1 mb-6 max-w-4xl mx-auto"
          >
            The Brain Behind Your{" "}
            <span className="text-gradient">Personal Knowledge</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A unified context layer to capture your entire working knowledge:
            files, notes, links, exports, cloud docs, and daily memory —
            compiled into a cited, searchable, HydraDB-powered personal wiki.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/app" className="btn-primary text-base px-8 py-3.5">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/app" className="btn-secondary text-base px-8 py-3.5">
              Load Demo <Database className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-value text-amber-400">
                  <AnimatedCounter target={s.value} suffix={s.suffix || ""} />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY QYNTRAWIKI ── */}
      <section className="relative z-10 px-6 py-24">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="section-label">Why QyntraWiki</span>
          <h2 className="h2 mt-4 mb-4">Similarity isn't relevance.<br />Give your knowledge the right context.</h2>
          <p className="section-subtitle mx-auto">
            Flat file storage returns what's close, not what's correct.
            QyntraWiki connects your tools and data, builds a structured graph,
            and delivers the exact context you need.
          </p>
        </SectionReveal>

        {/* With / Without comparison */}
        <SectionReveal className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Without */}
            <div className="card p-8 border-red-500/10">
              <h3 className="text-lg font-semibold text-red-400 mb-6">Without QyntraWiki</h3>
              <div className="space-y-3">
                {comparisonFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <X className="w-4 h-4 text-red-500/40 shrink-0" />
                    <span className="text-sm text-tertiary">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* With */}
            <div className="card p-8 border-amber-500/20 bg-gradient-card">
              <h3 className="text-lg font-semibold text-amber-400 mb-6">With QyntraWiki</h3>
              <div className="space-y-3">
                {comparisonFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-sm text-secondary">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ── CONNECTORS ── */}
      <section className="relative z-10 px-6 py-24 bg-secondary">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="section-label">Connectors</span>
          <h2 className="h2 mt-4 mb-4">Permission-first source connections</h2>
          <p className="section-subtitle mx-auto">
            Native connectors for your entire digital life. Every connector requires explicit consent.
          </p>
        </SectionReveal>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {connectors.map((c, i) => {
            const Icon = c.icon;
            return (
              <SectionReveal key={c.name}>
                <div className="connector-card p-5 h-full">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-primary mb-1">{c.name}</h3>
                  <p className="text-xs text-tertiary leading-relaxed">{c.desc}</p>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </section>

      {/* ── WIKI PAGES ── */}
      <section className="relative z-10 px-6 py-24">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="section-label">Personal Wiki</span>
          <h2 className="h2 mt-4 mb-4">Auto-generated, cited encyclopedia</h2>
          <p className="section-subtitle mx-auto">
            Sources become Wikipedia-style articles with infoboxes, citations, backlinks, and contradiction tracking.
          </p>
        </SectionReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {wikiPages.map((p, i) => (
            <SectionReveal key={p.title}>
              <div className="card p-6 h-full">
                <h3 className="text-base font-semibold text-primary mb-2">{p.title}</h3>
                <p className="text-sm text-tertiary leading-relaxed mb-4">{p.summary}</p>
                <div className="flex gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="badge badge-amber">{t}</span>
                  ))}
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* ── GRAPH + ASK ── */}
      <section className="relative z-10 px-6 py-24 bg-secondary">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="section-label">Memory Graph</span>
          <h2 className="h2 mt-4 mb-4">Visualize your knowledge network</h2>
          <p className="section-subtitle mx-auto">
            Explore pages, sources, entities, claims, and their relationships in an interactive graph.
            Ask natural language questions with cited answers.
          </p>
        </SectionReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
            <GitBranch className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">HydraDB Memory Graph</h3>
            <p className="text-sm text-tertiary">
              Pages, files, entities, claims, and contradictions become visible graph context.
            </p>
          </div>
          <div className="card p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
            <MessageSquare className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">Ask Your Wiki</h3>
            <p className="text-sm text-tertiary">
              Ask questions with citations, related files, and context used transparency.
            </p>
          </div>
        </div>
      </section>

      {/* ── PUBLISH ── */}
      <section className="relative z-10 px-6 py-24">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="section-label">Publish</span>
          <h2 className="h2 mt-4 mb-4">Share your knowledge publicly</h2>
          <p className="section-subtitle mx-auto">
            Publish selected pages while keeping private sources hidden.
            Share what you want, keep the rest private.
          </p>
        </SectionReveal>

        <div className="max-w-4xl mx-auto">
          <div className="card p-8 text-center">
            <Globe className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">One-click publish</h3>
            <p className="text-sm text-tertiary max-w-md mx-auto mb-6">
              Public routes show generated article content and public-safe citation labels.
              Raw private files stay hidden.
            </p>
            <Link href="/app/publish" className="btn-primary">
              Go to Publish <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="relative z-10 px-6 py-24 bg-secondary">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-12">
          <span className="section-label">Trust</span>
          <h2 className="h2 mt-4 mb-4">Built with privacy first</h2>
        </SectionReveal>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: "Permission-first", desc: "Every connector requires explicit consent before accessing data." },
            { icon: Server, title: "Local-first", desc: "Files stay local unless you enable HydraDB sync." },
            { icon: Lock, title: "No scraping", desc: "LinkedIn & Instagram use export-import mode — never silent access." },
            { icon: Check, title: "No data sold", desc: "Your data is yours. Zero third-party sharing." },
          ].map((item) => {
            const I = item.icon;
            return (
              <div key={item.title} className="card p-5 text-center">
                <I className="w-7 h-7 text-amber-400 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-primary mb-1">{item.title}</h4>
                <p className="text-xs text-tertiary">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 py-24">
        <SectionReveal className="max-w-4xl mx-auto text-center">
          <h2 className="h2 mb-6">Ready to build your<br />personal Wikipedia?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app/connect" className="btn-primary text-base px-8 py-3.5">
              Start Nexus Scan <Zap className="w-4 h-4" />
            </Link>
            <Link href="/app" className="btn-secondary text-base px-8 py-3.5">
              Load Demo <Database className="w-4 h-4" />
            </Link>
          </div>
        </SectionReveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold">QyntraWiki</span>
            <span className="text-xs text-tertiary">Built for HydraDB WikiThon</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-tertiary">
            <Link href="/app" className="hover:text-primary transition-colors">App</Link>
            <a href="https://hydradb.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">HydraDB</a>
            <a href="https://github.com/vaibhav4046/qyntrawiki-nexus" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
          </div>
          <span className="text-xs text-muted">© 2026 QyntraWiki Nexus</span>
        </div>
      </footer>
    </main>
  );
}
