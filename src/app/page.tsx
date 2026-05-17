"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Database, Sparkles, Shield, BookOpen, FolderOpen, GitBranch, MessageSquare, Globe, FileText, Check, X, Zap, Server, Users, Lock } from "lucide-react";
import KnowledgeTree from "@/components/KnowledgeTree";

/* ─── TypewriterText ─── */
function TypewriterText({ text, speed = 50, delay = 0, className = "" }: { text: string; speed?: number; delay?: number; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [started, displayed, text, speed]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((p) => !p), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {displayed}
      <span className={`inline-block w-[4px] h-[1em] bg-yellow-400 ml-0.5 ${showCursor ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}

/* ─── GlitchText ─── */
function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`glitch-text ${className}`} data-text={text}>
      {text}
    </span>
  );
}

/* ─── WaveText ─── */
function WaveText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`wave-text ${className}`}>
      {text.split("").map((char, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

/* ─── FloatingPellets ─── */
function FloatingPellets() {
  const pellets = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 3,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {pellets.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-yellow-400/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── GhostSprite ─── */
function GhostSprite({ color, size = 32, className = "" }: { color: string; size?: number; className?: string }) {
  return (
    <div className={`ghost-float ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill={color} className="w-full h-full drop-shadow-lg">
        <path d="M12 2C7.58 2 4 5.58 4 10v10c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3h2v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3h2v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V10c0-4.42-3.58-8-8-8z" />
        <circle cx="9" cy="9" r="2" fill="white" />
        <circle cx="15" cy="9" r="2" fill="white" />
        <circle cx="9" cy="9" r="1" fill="black" />
        <circle cx="15" cy="9" r="1" fill="black" />
      </svg>
    </div>
  );
}

/* ─── AnimatedCounter ─── */
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
  return <span ref={ref} className="tabular-nums">{prefix}{display}{suffix}</span>;
}

/* ─── Section Reveal ─── */
function SectionReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ─── */
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
  { title: "HydraDB", summary: "Graph-first context infrastructure for AI agents — replaces vector-only retrieval with intelligent recall pipeline.", tags: ["Product", "AI"], color: "text-yellow-400" },
  { title: "Context Graph", summary: "Persistent, evolving knowledge structure tracking entities, relationships, and temporal signals across documents.", tags: ["Concept"], color: "text-blue-400" },
  { title: "LLM Wiki", summary: "AI-maintained wiki that builds structured, interlinked articles with cross-references and automatic updates.", tags: ["Concept", "Pattern"], color: "text-green-400" },
];

const trustItems = [
  { icon: Shield, title: "Permission-first", desc: "Every connector requires explicit consent before accessing data.", color: "#ff0000", bg: "rgba(255,0,0,0.15)", border: "rgba(255,0,0,0.3)" },
  { icon: Server, title: "Local-first", desc: "Files stay local unless you enable HydraDB sync.", color: "#ffb8ff", bg: "rgba(255,184,255,0.15)", border: "rgba(255,184,255,0.3)" },
  { icon: Lock, title: "No scraping", desc: "LinkedIn & Instagram use export-import mode — never silent access.", color: "#00ffff", bg: "rgba(0,255,255,0.15)", border: "rgba(0,255,255,0.3)" },
  { icon: Check, title: "No data sold", desc: "Your data is yours. Zero third-party sharing.", color: "#ffb852", bg: "rgba(255,184,82,0.15)", border: "rgba(255,184,82,0.3)" },
];

function getBadgeClass(tag: string) {
  switch (tag) {
    case "Product": return "pixel-badge pixel-badge-yellow";
    case "AI": return "pixel-badge pixel-badge-blue";
    case "Concept": return "pixel-badge pixel-badge-green";
    case "Pattern": return "pixel-badge pixel-badge-pink";
    default: return "pixel-badge pixel-badge-yellow";
  }
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#000] text-[#f5f5f5] overflow-x-hidden font-[family-name:var(--font-sans)]">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#000] overflow-hidden border-b-[4px] border-[#2121de]">
        <div className="absolute inset-0 z-0 opacity-50">
          <KnowledgeTree />
        </div>
        <FloatingPellets />
        <div className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-[#000] to-transparent z-[1] pointer-events-none" />

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#ffeb3b]" />
              <span className="text-[20px] font-bold tracking-tight text-[#f5f5f5]">QyntraWiki</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/app" className="pixel-btn pixel-btn-ghost py-2.5 px-5">Open App</Link>
              <Link href="/app/connect" className="pixel-btn pixel-btn-yellow py-2.5 px-5">Start Now</Link>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center pt-16">
          {/* Pac-Man chomp */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-20 h-20 bg-[#ffeb3b] pac-chomp mx-auto mb-8"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="pixel-label mb-6">HydraDB WikiThon 2026</span>
          </motion.div>

          <h1 className="pixel-heading text-[10px] sm:text-[12px] leading-relaxed mb-6 max-w-4xl mx-auto text-[#f5f5f5]">
            <TypewriterText text="The Brain Behind Your " speed={50} delay={300} />
            <span className="gradient-pixel">
              <TypewriterText text="Personal Knowledge" speed={50} delay={1400} />
            </span>
          </h1>

          <p className="text-[20px] text-[#a0a0a0] max-w-2xl mx-auto mb-10 leading-relaxed">
            <TypewriterText
              text="A unified context layer to capture your entire working knowledge: files, notes, links, exports, cloud docs, and daily memory — compiled into a cited, searchable, HydraDB-powered personal wiki."
              speed={30}
              delay={2200}
            />
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/app" className="pixel-btn pixel-btn-solid px-8 py-3.5 glow-pulse">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/app" className="pixel-btn pixel-btn-yellow px-8 py-3.5 glow-pulse">
              Load Demo <Database className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.8 }}
            className="mt-6"
          >
            <span className="coin-insert text-[#ffeb3b] pixel-heading text-[8px] tracking-widest uppercase">
              INSERT COIN TO BEGIN
            </span>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="pixel-stat">
                <div className="pixel-stat-value">
                  <AnimatedCounter target={s.value} suffix={s.suffix || ""} />
                </div>
                <div className="pixel-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating ghost sprites in corners */}
        <div className="absolute top-28 left-8 z-10 hidden lg:block">
          <GhostSprite color="#ff0000" size={40} />
        </div>
        <div className="absolute top-28 right-8 z-10 hidden lg:block">
          <GhostSprite color="#ffb8ff" size={40} />
        </div>
        <div className="absolute bottom-28 left-12 z-10 hidden lg:block">
          <GhostSprite color="#00ffff" size={40} />
        </div>
        <div className="absolute bottom-28 right-12 z-10 hidden lg:block">
          <GhostSprite color="#ffb852" size={40} />
        </div>
      </section>

      {/* ── WHY QYNTRAWIKI ── */}
      <section className="relative z-10 px-6 py-24 bg-[#000]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="pixel-label">Why QyntraWiki</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#f5f5f5]">
            <GlitchText text="Similarity isn't relevance" />
          </h2>
          <p className="text-[20px] text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
            <WaveText text="Flat file storage returns what's close, not what's correct. QyntraWiki connects your tools and data, builds a structured graph, and delivers the exact context you need." />
          </p>
        </SectionReveal>

        {/* With / Without comparison */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionReveal delay={0.1}>
            <div className="pixel-card flip-in p-8" style={{ borderColor: "rgba(255,0,0,0.3)" }}>
              <h3 className="pixel-heading text-[9px] text-[#ff0000] mb-6">Without QyntraWiki</h3>
              <div className="space-y-3">
                {comparisonFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <X className="w-4 h-4 text-[#666666] shrink-0" />
                    <span className="text-[18px] text-[#666666]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <div className="pixel-card flip-in p-8 glow-pulse" style={{ borderColor: "rgba(255,235,59,0.6)" }}>
              <h3 className="pixel-heading text-[9px] text-[#ffeb3b] mb-6">With QyntraWiki</h3>
              <div className="space-y-3">
                {comparisonFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#4ade80] shrink-0" />
                    <span className="text-[18px] text-[#a0a0a0]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── CONNECTORS ── */}
      <section className="relative z-10 px-6 py-24 bg-[#0a0a0a]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="pixel-label">Connectors</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#f5f5f5]">
            Permission-first source connections
          </h2>
          <p className="text-[20px] text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
            Native connectors for your entire digital life. Every connector requires explicit consent.
          </p>
        </SectionReveal>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {connectors.map((c, i) => {
            const Icon = c.icon;
            return (
              <SectionReveal key={c.name} delay={i * 0.1}>
                <div className="pixel-card flip-in p-5 h-full" style={{ borderColor: "rgba(255,235,59,0.3)" }}>
                  <div className="w-9 h-9 bg-[rgba(255,235,59,0.1)] flex items-center justify-center mb-3 border-[4px] border-[rgba(255,235,59,0.2)]">
                    <Icon className="w-4 h-4 text-[#ffeb3b]" />
                  </div>
                  <h3 className="pixel-heading text-[8px] text-[#f5f5f5] mb-1">{c.name}</h3>
                  <p className="text-[16px] text-[#666666] leading-relaxed">{c.desc}</p>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </section>

      {/* ── WIKI PAGES ── */}
      <section className="relative z-10 px-6 py-24 bg-[#000]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="pixel-label">Personal Wiki</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#f5f5f5]">
            Auto-generated, cited encyclopedia
          </h2>
          <p className="text-[20px] text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
            Sources become Wikipedia-style articles with infoboxes, citations, backlinks, and contradiction tracking.
          </p>
        </SectionReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {wikiPages.map((p, i) => (
            <SectionReveal key={p.title} delay={i * 0.15}>
              <div className="pixel-card p-6 h-full">
                <h3 className="pixel-heading text-[9px] text-[#f5f5f5] mb-2">{p.title}</h3>
                <p className="text-[16px] text-[#666666] leading-relaxed mb-4">{p.summary}</p>
                <div className="flex gap-2 flex-wrap">
                  {p.tags.map((t) => (
                    <span key={t} className={getBadgeClass(t)}>{t}</span>
                  ))}
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* ── GRAPH + ASK ── */}
      <section className="relative z-10 px-6 py-24 bg-[#0a0a0a]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="pixel-label">Memory Graph</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#f5f5f5]">
            Visualize your knowledge network
          </h2>
          <p className="text-[20px] text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
            Explore pages, sources, entities, claims, and their relationships in an interactive graph.
            Ask natural language questions with cited answers.
          </p>
        </SectionReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionReveal delay={0.1}>
            <div className="pixel-card rainbow-border p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
              <GitBranch className="w-10 h-10 text-[#ffeb3b] mb-4" />
              <h3 className="pixel-heading text-[9px] text-[#f5f5f5] mb-2">HydraDB Memory Graph</h3>
              <p className="text-[16px] text-[#666666]">
                Pages, files, entities, claims, and contradictions become visible graph context.
              </p>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <div className="pixel-card rainbow-border p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
              <MessageSquare className="w-10 h-10 text-[#00ffff] mb-4" />
              <h3 className="pixel-heading text-[9px] text-[#f5f5f5] mb-2">Ask Your Wiki</h3>
              <p className="text-[16px] text-[#666666]">
                Ask questions with citations, related files, and context used transparency.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── PUBLISH ── */}
      <section className="relative z-10 px-6 py-24 bg-[#000]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="pixel-label">Publish</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#f5f5f5]">
            Share your knowledge publicly
          </h2>
          <p className="text-[20px] text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
            Publish selected pages while keeping private sources hidden.
            Share what you want, keep the rest private.
          </p>
        </SectionReveal>

        <div className="max-w-4xl mx-auto">
          <SectionReveal>
            <div className="pixel-card p-8 text-center glow-pulse">
              <Globe className="w-10 h-10 text-[#ffeb3b] mx-auto mb-4" />
              <h3 className="pixel-heading text-[9px] text-[#f5f5f5] mb-2">One-click publish</h3>
              <p className="text-[16px] text-[#666666] max-w-md mx-auto mb-6">
                Public routes show generated article content and public-safe citation labels.
                Raw private files stay hidden.
              </p>
              <Link href="/app/publish" className="pixel-btn pixel-btn-solid">
                Go to Publish <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="relative z-10 px-6 py-24 bg-[#0a0a0a]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-12">
          <span className="pixel-label">Trust</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#f5f5f5]">
            Built with privacy first
          </h2>
        </SectionReveal>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustItems.map((item, i) => {
            const I = item.icon;
            return (
              <SectionReveal key={item.title} delay={i * 0.1}>
                <div className="relative pt-8">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <GhostSprite color={item.color} size={36} />
                  </div>
                  <div
                    className="pixel-card p-5 text-center pt-10"
                    style={{ borderColor: item.border, backgroundColor: item.bg }}
                  >
                    <I className="w-7 h-7 mx-auto mb-3" style={{ color: item.color }} />
                    <h4 className="pixel-heading text-[8px] text-[#f5f5f5] mb-1">{item.title}</h4>
                    <p className="text-[14px] text-[#a0a0a0]">{item.desc}</p>
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 px-6 py-24 bg-[#000] overflow-hidden">
        <SectionReveal className="max-w-4xl mx-auto text-center">
          <div className="overflow-hidden mb-8">
            <motion.div
              className="flex whitespace-nowrap w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-[#ffeb3b] pixel-heading text-[8px] tracking-widest uppercase mx-4">
                YOUR KNOWLEDGE DESERVES A WIKI *** BUILD YOUR BRAIN *** &nbsp;&nbsp;&nbsp;
              </span>
              <span className="text-[#ffeb3b] pixel-heading text-[8px] tracking-widest uppercase mx-4">
                YOUR KNOWLEDGE DESERVES A WIKI *** BUILD YOUR BRAIN *** &nbsp;&nbsp;&nbsp;
              </span>
              <span className="text-[#ffeb3b] pixel-heading text-[8px] tracking-widest uppercase mx-4">
                YOUR KNOWLEDGE DESERVES A WIKI *** BUILD YOUR BRAIN *** &nbsp;&nbsp;&nbsp;
              </span>
              <span className="text-[#ffeb3b] pixel-heading text-[8px] tracking-widest uppercase mx-4">
                YOUR KNOWLEDGE DESERVES A WIKI *** BUILD YOUR BRAIN *** &nbsp;&nbsp;&nbsp;
              </span>
            </motion.div>
          </div>
          <h2 className="pixel-heading text-[10px] sm:text-[12px] leading-relaxed mb-6 text-[#f5f5f5]">
            Ready to build your<br />personal Wikipedia?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app/connect" className="pixel-btn pixel-btn-solid px-8 py-3.5 shake">
              Start Nexus Scan <Zap className="w-4 h-4" />
            </Link>
            <Link href="/app" className="pixel-btn pixel-btn-yellow px-8 py-3.5 shake">
              Load Demo <Database className="w-4 h-4" />
            </Link>
          </div>
        </SectionReveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t-[4px] border-[#2121de] px-6 py-10 bg-[#000]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#ffeb3b]" />
            <span className="text-[16px] font-bold text-[#f5f5f5]">QyntraWiki</span>
            <span className="text-[12px] text-[#666666]">Built for HydraDB WikiThon</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-[#666666]">
            <Link href="/app" className="hover:text-[#ffeb3b] transition-colors">App</Link>
            <a href="https://hydradb.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#ffeb3b] transition-colors">HydraDB</a>
            <a href="https://github.com/vaibhav4046/qyntrawiki-nexus" target="_blank" rel="noopener noreferrer" className="hover:text-[#ffeb3b] transition-colors">GitHub</a>
          </div>
          <span className="text-[12px] text-[#666666]">© 2026 QyntraWiki Nexus</span>
        </div>
      </footer>
    </main>
  );
}
