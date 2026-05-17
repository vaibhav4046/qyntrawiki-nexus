"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Database, Sparkles, Shield, BookOpen, FolderOpen, GitBranch, MessageSquare, Globe, FileText, Check, X, Zap, Server, Users, Lock, Crosshair, Target, Flame, Swords, Gamepad2, ChevronRight } from "lucide-react";
import KnowledgeTree from "@/components/KnowledgeTree";

/* ─── ScrollProgress ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-[#e63946] origin-left z-50"
      style={{ scaleX }}
    />
  );
}

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
      <span className={`inline-block w-[4px] h-[1em] bg-[#e63946] ml-0.5 align-middle ${showCursor ? "opacity-100" : "opacity-0"}`} />
    </span>
  );
}

/* ─── FlameText ─── */
function FlameText({ text, className = "" }: { text: string; className?: string }) {
  return <span className={`gradient-flame ${className}`}>{text}</span>;
}

/* ─── SectionReveal ─── */
function SectionReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
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

/* ─── AnimatedCounter ─── */
function AnimatedCounter({ target, suffix = "", prefix = "", className = "" }: { target: number; suffix?: string; prefix?: string; className?: string }) {
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

  if (!inView) return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
  return <span ref={ref} className={`tabular-nums ${className}`}>{prefix}{display}{suffix}</span>;
}

/* ─── NESMenuSelect ─── */
function NESMenuSelect({ options }: { options: string[] }) {
  const [selected, setSelected] = useState(0);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelected((prev) => (prev + 1) % options.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [options.length]);

  useEffect(() => {
    const interval = setInterval(() => setBlink((p) => !p), 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="nes-select inline-flex flex-col gap-2 text-left">
      {options.map((opt, i) => (
        <div key={opt} className="flex items-center gap-2">
          <ChevronRight className={`w-4 h-4 text-[#e63946] transition-opacity ${i === selected && blink ? "opacity-100" : "opacity-0"}`} />
          <span className={`pixel-heading text-[8px] tracking-widest ${i === selected ? "text-[#e0e0e0]" : "text-[#555]"}`}>{opt}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── PowerUpFloat ─── */
function PowerUpFloat({ icon: Icon, color, className = "", size = 24 }: { icon: React.ElementType; color: string; className?: string; size?: number }) {
  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icon className="drop-shadow-lg" style={{ width: size, height: size, color }} />
    </motion.div>
  );
}

/* ─── SoldierSilhouette ─── */
function SoldierSilhouette({ direction = "left" }: { direction?: "left" | "right" }) {
  const transform = direction === "right" ? "scaleX(-1)" : undefined;
  return (
    <svg width="80" height="120" viewBox="0 0 80 120" className="opacity-80" style={{ transform }}>
      <circle cx="40" cy="18" r="10" fill="#4a7c59" />
      <rect x="25" y="30" width="30" height="35" rx="2" fill="#2d4a3e" />
      <rect x="10" y="40" width="28" height="6" fill="#1a1a1a" />
      <rect x="5" y="36" width="8" height="14" fill="#1a1a1a" />
      <rect x="28" y="65" width="10" height="45" fill="#2d4a3e" />
      <rect x="42" y="65" width="10" height="45" fill="#2d4a3e" />
    </svg>
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
  { title: "HydraDB", summary: "Graph-first context infrastructure for AI agents — replaces vector-only retrieval with intelligent recall pipeline.", tags: ["Product", "AI"], color: "text-red-500" },
  { title: "Context Graph", summary: "Persistent, evolving knowledge structure tracking entities, relationships, and temporal signals across documents.", tags: ["Concept"], color: "text-blue-400" },
  { title: "LLM Wiki", summary: "AI-maintained wiki that builds structured, interlinked articles with cross-references and automatic updates.", tags: ["Concept", "Pattern"], color: "text-green-400" },
];

const trustItems = [
  { icon: Shield, title: "Perimeter Shield", desc: "Explicit consent before any data access.", color: "#e63946", bg: "rgba(230,57,70,0.15)", border: "rgba(230,57,70,0.3)", badge: "ARMOR +1" },
  { icon: Server, title: "Local Base", desc: "Files stay on-site unless sync is enabled.", color: "#4a7c59", bg: "rgba(74,124,89,0.15)", border: "rgba(74,124,89,0.3)", badge: "DEF +2" },
  { icon: Lock, title: "Lockdown", desc: "Export-only mode for sensitive networks.", color: "#f77f00", bg: "rgba(247,127,0,0.15)", border: "rgba(247,127,0,0.3)", badge: "SECURE" },
  { icon: Check, title: "Zero Leak", desc: "No third-party sharing. Ever.", color: "#00b4d8", bg: "rgba(0,180,216,0.15)", border: "rgba(0,180,216,0.3)", badge: "CLEAR" },
];

function getBadgeClass(tag: string) {
  switch (tag) {
    case "Product": return "pixel-badge pixel-badge-red";
    case "AI": return "pixel-badge pixel-badge-spread";
    case "Concept": return "pixel-badge pixel-badge-green";
    case "Pattern": return "pixel-badge pixel-badge-laser";
    default: return "pixel-badge pixel-badge-red";
  }
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#060606] text-[#e0e0e0] overflow-x-hidden font-[family-name:var(--font-sans)]">
      <ScrollProgress />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-[#060606] overflow-hidden border-b-4 border-[#4a7c59]">
        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#e63946]" />
              <span className="text-[20px] font-bold tracking-tight text-[#e0e0e0]">QYNTRA</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/app" className="pixel-btn pixel-btn-ghost text-[#e0e0e0]">START</Link>
              <Link href="/app/connect" className="pixel-btn pixel-btn-red text-[#e0e0e0]">OPTIONS</Link>
            </div>
          </div>
        </nav>

        {/* Soldiers */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block z-10">
          <SoldierSilhouette direction="right" />
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block z-10">
          <SoldierSilhouette direction="left" />
        </div>

        {/* Floating power-ups */}
        <PowerUpFloat icon={Target} color="#e63946" className="absolute top-24 left-[15%] z-10" size={28} />
        <PowerUpFloat icon={Crosshair} color="#f77f00" className="absolute top-32 right-[15%] z-10" size={28} />
        <PowerUpFloat icon={Swords} color="#00b4d8" className="absolute bottom-32 left-[25%] z-10" size={28} />
        <PowerUpFloat icon={Zap} color="#ff69b4" className="absolute bottom-24 right-[25%] z-10" size={28} />

        <div className="relative z-10 max-w-5xl mx-auto text-center pt-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="gradient-metal pixel-heading text-[12px] sm:text-[14px] leading-relaxed mb-2">
              QYNTRA WIKI
            </h1>
          </motion.div>

          {/* Flame swoosh */}
          <svg viewBox="0 0 240 24" className="mx-auto w-72 h-10 mb-6">
            <defs>
              <linearGradient id="flameSwoosh" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffeb3b" />
                <stop offset="50%" stopColor="#f77f00" />
                <stop offset="100%" stopColor="#e63946" />
              </linearGradient>
            </defs>
            <path d="M10,20 Q60,2 120,20 T230,20" stroke="url(#flameSwoosh)" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="pixel-heading text-[8px] sm:text-[10px] text-[#e0e0e0] mb-8 tracking-widest">
              OPERATION: PERSONAL KNOWLEDGE
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Link href="/app" className="pixel-btn pixel-btn-solid px-10 py-4 flame-flicker inline-flex items-center gap-2 text-[#060606]">
              PRESS START <Gamepad2 className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-6"
          >
            <span className="konami-blink pixel-heading text-[8px] text-[#e63946] tracking-widest uppercase block">
              INSERT COIN TO BEGIN
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="mt-6 flex justify-center"
          >
            <NESMenuSelect options={["1 PLAYER", "2 PLAYERS"]} />
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="pixel-stat">
                <div className="pixel-stat-value text-[#e63946]">
                  <AnimatedCounter target={s.value} suffix={s.suffix || ""} className="text-[#e63946]" />
                </div>
                <div className="pixel-stat-label text-[#4a7c59]">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MISSION BRIEFING ── */}
      <section className="relative z-10 px-6 py-24 bg-[#060606]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="pixel-label">Mission Briefing</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#e0e0e0]">
            <FlameText text="INTEL REQUIRED" />
          </h2>
          <p className="text-[20px] text-[#888] max-w-2xl mx-auto leading-relaxed">
            Without proper intel, you&apos;re walking into the jungle blind. With QyntraWiki, every operation is backed by verified data.
          </p>
        </SectionReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionReveal delay={0.1}>
            <div className="pixel-card p-8 pixel-border-red">
              <h3 className="pixel-heading text-[9px] text-[#e63946] mb-6">NO BACKUP</h3>
              <div className="space-y-3">
                {comparisonFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <X className="w-4 h-4 text-[#666] shrink-0" />
                    <span className="text-[18px] text-[#666]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <div className="pixel-card p-8 pixel-border-orange flame-flicker">
              <h3 className="pixel-heading text-[9px] text-[#f77f00] mb-6">QYNTRA SQUAD</h3>
              <div className="space-y-3">
                {comparisonFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#4a7c59] shrink-0" />
                    <span className="text-[18px] text-[#a0a0a0]">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── ARSENAL ── */}
      <section className="relative z-10 px-6 py-24 bg-[#0a0a0a]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="pixel-label">Arsenal</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#e0e0e0]">
            LOADOUT SELECTION
          </h2>
          <p className="text-[20px] text-[#888] max-w-2xl mx-auto leading-relaxed">
            Choose your gear. Every connector is a new weapon in your knowledge war.
          </p>
        </SectionReveal>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {connectors.map((c, i) => {
            const Icon = c.icon;
            return (
              <SectionReveal key={c.name} delay={i * 0.1}>
                <div className="pixel-card pixel-border-green p-5 h-full">
                  <div className="w-10 h-10 bg-[#2d4a3e] flex items-center justify-center mb-3 border-2 border-[#4a7c59]">
                    <Icon className="w-5 h-5 text-[#e63946]" />
                  </div>
                  <h3 className="pixel-heading text-[8px] text-[#e0e0e0] mb-1">{c.name}</h3>
                  <p className="text-[16px] text-[#888] leading-relaxed">{c.desc}</p>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </section>

      {/* ── TACTICAL MAP ── */}
      <section className="relative z-10 px-6 py-16 bg-[#080808] overflow-hidden">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-8">
          <span className="pixel-label">Tactical Map</span>
          <h2 className="pixel-heading text-[10px] sm:text-[12px] leading-relaxed mt-4 mb-2 text-[#e0e0e0]">
            SITUATION REPORT
          </h2>
          <p className="text-[18px] text-[#888] max-w-xl mx-auto">
            Real-time battlefield intelligence on your knowledge network.
          </p>
        </SectionReveal>
        <SectionReveal delay={0.2}>
          <div className="max-w-5xl mx-auto h-[400px] border-4 border-[#4a7c59] relative bg-[#050505]">
            <KnowledgeTree />
            <div className="absolute bottom-3 right-3 pixel-badge pixel-badge-red text-[6px]">
              INTERACTIVE
            </div>
          </div>
        </SectionReveal>
        <div className="max-w-5xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Pages", value: 8 },
            { label: "Sources", value: 7 },
            { label: "Entities", value: 12 },
            { label: "Claims", value: 24 },
          ].map((item) => (
            <div key={item.label} className="pixel-card pixel-border-green py-3 text-center">
              <div className="pixel-stat-value text-[#e63946]">
                <AnimatedCounter target={item.value} className="text-[#e63946]" />
              </div>
              <div className="pixel-stat-label text-[#4a7c59]">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTEL REPORTS ── */}
      <section className="relative z-10 px-6 py-24 bg-[#060606]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="pixel-label flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4a7c59]" /> Intel Reports
          </span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#e0e0e0]">
            CLASSIFIED DOSSIERS
          </h2>
          <p className="text-[20px] text-[#888] max-w-2xl mx-auto leading-relaxed">
            Auto-generated field reports with citations, cross-references, and contradiction alerts.
          </p>
        </SectionReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {wikiPages.map((p, i) => (
            <SectionReveal key={p.title} delay={i * 0.15}>
              <div className="pixel-card p-6 h-full pixel-border-green relative">
                <div className="absolute top-2 right-2">
                  <FolderOpen className="w-5 h-5 text-[#4a7c59]" />
                </div>
                <h3 className="pixel-heading text-[9px] text-[#e0e0e0] mb-2">{p.title}</h3>
                <p className="text-[16px] text-[#888] leading-relaxed mb-4">{p.summary}</p>
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

      {/* ── COMMS & RECON ── */}
      <section className="relative z-10 px-6 py-24 bg-[#0a0a0a]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-16">
          <span className="pixel-label">Comms & Recon</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#e0e0e0]">
            BATTLEFIELD AWARENESS
          </h2>
          <p className="text-[20px] text-[#888] max-w-2xl mx-auto leading-relaxed">
            Visualize the tactical network and send field inquiries with cited intel.
          </p>
        </SectionReveal>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionReveal delay={0.1}>
            <div className="pixel-card pixel-border-green p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
              <GitBranch className="w-10 h-10 text-[#e63946] mb-4" />
              <h3 className="pixel-heading text-[9px] text-[#e0e0e0] mb-2">Tactical Network</h3>
              <p className="text-[16px] text-[#888]">
                Pages, files, entities, claims, and contradictions mapped in real-time.
              </p>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <div className="pixel-card pixel-border-green p-6 flex flex-col items-center justify-center text-center min-h-[240px]">
              <MessageSquare className="w-10 h-10 text-[#00b4d8] mb-4" />
              <h3 className="pixel-heading text-[9px] text-[#e0e0e0] mb-2">Field Inquiry</h3>
              <p className="text-[16px] text-[#888]">
                Ask questions with citations, related files, and full context transparency.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── PERIMETER DEFENSE ── */}
      <section className="relative z-10 px-6 py-24 bg-[#080808]">
        <SectionReveal className="max-w-7xl mx-auto text-center mb-12">
          <span className="pixel-label">Perimeter Defense</span>
          <h2 className="pixel-heading text-[10px] sm:text-[11px] leading-relaxed mt-4 mb-4 text-[#e0e0e0]">
            BASE SECURITY
          </h2>
        </SectionReveal>

        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustItems.map((item, i) => {
            const I = item.icon;
            return (
              <SectionReveal key={item.title} delay={i * 0.1}>
                <div className="relative pt-8">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="pixel-badge pixel-badge-red text-[6px]">{item.badge}</span>
                  </div>
                  <div
                    className="pixel-card p-5 text-center pt-10 pixel-border-green"
                    style={{ backgroundColor: item.bg, borderColor: item.border }}
                  >
                    <I className="w-7 h-7 mx-auto mb-3" style={{ color: item.color }} />
                    <h4 className="pixel-heading text-[8px] text-[#e0e0e0] mb-1">{item.title}</h4>
                    <p className="text-[14px] text-[#888]">{item.desc}</p>
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </section>

      {/* ── DEPLOY NOW ── */}
      <section className="relative z-10 px-6 py-24 bg-[#060606] overflow-hidden">
        <SectionReveal className="max-w-4xl mx-auto text-center">
          <div className="overflow-hidden mb-8">
            <motion.div
              className="flex whitespace-nowrap w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-[#f77f00] pixel-heading text-[8px] tracking-widest uppercase mx-4">
                SPREAD GUN POWERED *** KNOWLEDGE IS AMMO *** &nbsp;&nbsp;&nbsp;
              </span>
              <span className="text-[#f77f00] pixel-heading text-[8px] tracking-widest uppercase mx-4">
                SPREAD GUN POWERED *** KNOWLEDGE IS AMMO *** &nbsp;&nbsp;&nbsp;
              </span>
              <span className="text-[#f77f00] pixel-heading text-[8px] tracking-widest uppercase mx-4">
                SPREAD GUN POWERED *** KNOWLEDGE IS AMMO *** &nbsp;&nbsp;&nbsp;
              </span>
              <span className="text-[#f77f00] pixel-heading text-[8px] tracking-widest uppercase mx-4">
                SPREAD GUN POWERED *** KNOWLEDGE IS AMMO *** &nbsp;&nbsp;&nbsp;
              </span>
            </motion.div>
          </div>
          <h2 className="pixel-heading text-[10px] sm:text-[12px] leading-relaxed mb-6 text-[#e0e0e0]">
            READY FOR DEPLOYMENT?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app/connect" className="pixel-btn pixel-btn-solid px-10 py-4 flame-flicker inline-flex items-center gap-2">
              PRESS START <Gamepad2 className="w-5 h-5" />
            </Link>
            <Link href="/app" className="pixel-btn pixel-btn-red px-8 py-3.5 inline-flex items-center gap-2">
              LOAD DEMO <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </SectionReveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t-4 border-[#4a7c59] px-6 py-10 bg-[#060606]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#e63946]" />
            <span className="text-[16px] font-bold text-[#e0e0e0]">QyntraWiki</span>
            <span className="text-[12px] text-[#555]">Built for HydraDB WikiThon</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-[#555]">
            <Link href="/app" className="hover:text-[#e63946] transition-colors">App</Link>
            <a href="https://hydradb.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#e63946] transition-colors">HydraDB</a>
            <a href="https://github.com/vaibhav4046/qyntrawiki-nexus" target="_blank" rel="noopener noreferrer" className="hover:text-[#e63946] transition-colors">GitHub</a>
          </div>
          <span className="text-[12px] text-[#555]">© 1988-2026 KONAMI...just kidding. QyntraWiki for HydraDB WikiThon</span>
        </div>
      </footer>
    </main>
  );
}
