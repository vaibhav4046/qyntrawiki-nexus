"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  FileText, Database, Lightbulb, AlertTriangle, FolderOpen,
  GitBranch, MessageSquare, Plug, Upload, BookOpen, Globe,
  ArrowRight, Zap, Crosshair, Heart, Swords, Target,
  Shield, Radar, Flame, ChevronRight, Trophy, Skull,
  Lock, Unlock,
} from "lucide-react";

/* ─── Data ─── */
const wikiName = "AI Agent Memory";
const lives = 3;
const score = 124500;
const highScore = 250000;
const stage = 2;
const weapon = "SPREAD";

const stats = [
  { label: "PAGES", value: 9, icon: FileText, href: "/app/wiki", color: "#e63946", max: 20 },
  { label: "SOURCES", value: 8, icon: Database, href: "/app/import", color: "#f77f00", max: 20 },
  { label: "FILES", value: 7, icon: FolderOpen, href: "/app/files", color: "#a78bfa", max: 20 },
  { label: "ENTITIES", value: 18, icon: Lightbulb, href: "/app/graph", color: "#00b4d8", max: 50 },
  { label: "CLAIMS", value: 18, icon: MessageSquare, href: "/app/ask", color: "#34d399", max: 40 },
  { label: "THREATS", value: 2, icon: AlertTriangle, href: "/app/contradictions", color: "#e63946", max: 10 },
];

const stages = [
  { name: "JUNGLE ZONE", desc: "Connect external intel feeds", icon: Plug, href: "/app/connect", color: "#4a7c59", locked: false, cleared: true },
  { name: "WEAPON ROOM", desc: "Armory — import raw data", icon: Upload, href: "/app/import", color: "#f77f00", locked: false, cleared: true },
  { name: "INTEL ARCHIVES", desc: "Browse compiled wiki pages", icon: BookOpen, href: "/app/wiki", color: "#00b4d8", locked: false, cleared: false },
  { name: "TACTICAL MAP", desc: "Visualize knowledge network", icon: GitBranch, href: "/app/graph", color: "#e63946", locked: false, cleared: false },
  { name: "COMMS CENTER", desc: "Query your knowledge base", icon: MessageSquare, href: "/app/ask", color: "#ff69b4", locked: false, cleared: false },
  { name: "RECON SQUAD", desc: "AI structure suggestions", icon: FolderOpen, href: "/app/organize", color: "#a78bfa", locked: false, cleared: false },
];

const missionLog = [
  { title: "What are AI Agents?", status: "COMPLETE", xp: 500 },
  { title: "Memory Types", status: "COMPLETE", xp: 750 },
  { title: "Vector Databases", status: "IN PROGRESS", xp: 0 },
  { title: "Agent Frameworks", status: "LOCKED", xp: 0 },
  { title: "Deployment Patterns", status: "LOCKED", xp: 0 },
];

const squad = [
  { name: "Google Drive", status: "ACTIVE", icon: Globe },
  { name: "Notion", status: "ACTIVE", icon: Database },
  { name: "Local", status: "STANDBY", icon: FolderOpen },
  { name: "Slack", status: "OFFLINE", icon: MessageSquare },
  { name: "GitHub", status: "OFFLINE", icon: GitBranch },
  { name: "Microsoft", status: "OFFLINE", icon: Globe },
];

/* ─── HUD Bar ─── */
function HUD() {
  return (
    <div className="bg-[#080808] border-b border-[#e63946]/50 px-5 py-2.5 flex items-center justify-between gap-4 overflow-x-auto font-[VT323]">
      <div className="flex items-center gap-5 min-w-fit">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-[#e63946] tracking-wider">SCORE</span>
          <span className="text-[17px] text-[#f5f5f5]">{score.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-[#f77f00] tracking-wider">HI</span>
          <span className="text-[17px] text-[#f77f00]">{highScore.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-5 min-w-fit">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-[#4a7c59] tracking-wider">STAGE</span>
          <span className="text-[17px] text-[#4a7c59]">{stage}-1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-[#e63946] tracking-wider">LIVES</span>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={cn("w-4 h-4", i < lives ? "text-[#e63946] fill-[#e63946]" : "text-[#333]")} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Swords className="w-4 h-4 text-[#f77f00]" />
          <span className="text-[13px] text-[#f77f00] tracking-wider">{weapon}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Progress Bar ─── */
function PowerUpBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between font-[VT323]">
        <span className="text-[13px] text-[#888] uppercase tracking-wider">{label}</span>
        <span className="text-[14px] text-[#f5f5f5]">{value}/{max}</span>
      </div>
      <div className="h-2.5 bg-[#1a1a1a] rounded-sm overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-sm" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

/* ─── Stage Card ─── */
function StageCard({ stage: s }: { stage: typeof stages[0] }) {
  const Icon = s.icon;
  return (
    <Link href={s.href}>
      <motion.div whileHover={{ scale: 1.02 }} className={cn(
        "relative border p-4 cursor-pointer h-full transition-colors group rounded-sm",
        s.locked ? "border-[#333] bg-[#0a0a0a] opacity-50" : s.cleared ? "border-[#4a7c59] bg-[#4a7c59]/5 hover:bg-[#4a7c59]/10" : "border-[#e63946] bg-[#e63946]/5 hover:bg-[#e63946]/10"
      )}>
        <div className="flex items-start justify-between mb-3">
          <Icon className="w-5 h-5" style={{ color: s.color }} />
          {s.cleared && <Trophy className="w-4 h-4 text-[#f77f00]" />}
          {s.locked && <Lock className="w-4 h-4 text-[#555]" />}
          {!s.cleared && !s.locked && <span className="text-[11px] font-[VT323] text-[#e63946]">ACTIVE</span>}
        </div>
        <h3 className="text-[13px] font-bold text-[#f5f5f5] font-[VT323] uppercase tracking-wider mb-1">{s.name}</h3>
        <p className="text-[13px] text-[#888] font-[VT323]">{s.desc}</p>
        {!s.locked && (
          <div className="mt-3 flex items-center gap-1 text-[12px] font-[VT323] text-[#888] group-hover:text-[#f77f00] transition-colors">
            <ChevronRight className="w-3.5 h-3.5" /> DEPLOY
          </div>
        )}
      </motion.div>
    </Link>
  );
}

/* ─── Mission Log Entry ─── */
function MissionLogEntry({ mission }: { mission: typeof missionLog[0] }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 border-l-2 rounded-sm transition-colors",
      mission.status === "COMPLETE" ? "border-[#4a7c59] bg-[#4a7c59]/5" : mission.status === "IN PROGRESS" ? "border-[#f77f00] bg-[#f77f00]/5" : "border-[#333] bg-[#111]/50 opacity-50"
    )}>
      <div className="flex items-center gap-2.5">
        {mission.status === "COMPLETE" && <Target className="w-4 h-4 text-[#4a7c59]" />}
        {mission.status === "IN PROGRESS" && <Crosshair className="w-4 h-4 text-[#f77f00]" />}
        {mission.status === "LOCKED" && <Lock className="w-4 h-4 text-[#555]" />}
        <span className="text-[14px] text-[#f5f5f5] font-[VT323]">{mission.title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-[11px] font-[VT323] uppercase tracking-wider",
          mission.status === "COMPLETE" ? "text-[#4a7c59]" : mission.status === "IN PROGRESS" ? "text-[#f77f00]" : "text-[#555]")}>
          {mission.status}
        </span>
        {mission.xp > 0 && <span className="text-[11px] text-[#f77f00] font-[VT323]">+{mission.xp}XP</span>}
      </div>
    </div>
  );
}

/* ─── Squad Member ─── */
function SquadMember({ member }: { member: typeof squad[0] }) {
  const Icon = member.icon;
  return (
    <div className={cn("p-3 border rounded-sm transition-all",
      member.status === "ACTIVE" ? "border-[#4a7c59] bg-[#4a7c59]/5" : member.status === "STANDBY" ? "border-[#f77f00] bg-[#f77f00]/5" : "border-[#222] bg-[#0a0a0a] opacity-40"
    )}>
      <div className="flex items-center gap-2.5">
        <div className={cn("w-2.5 h-2.5 rounded-full",
          member.status === "ACTIVE" ? "bg-[#4a7c59]" : member.status === "STANDBY" ? "bg-[#f77f00]" : "bg-[#333]"
        )} />
        <Icon className={cn("w-4 h-4",
          member.status === "ACTIVE" ? "text-[#4a7c59]" : member.status === "STANDBY" ? "text-[#f77f00]" : "text-[#555]"
        )} />
        <span className="text-[13px] text-[#f5f5f5] font-[VT323]">{member.name}</span>
      </div>
      <span className={cn("text-[11px] font-[VT323] uppercase tracking-wider mt-1 block",
        member.status === "ACTIVE" ? "text-[#4a7c59]" : member.status === "STANDBY" ? "text-[#f77f00]" : "text-[#555]"
      )}>{member.status}</span>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function AppDashboardPage() {
  return (
    <div className="min-h-screen bg-[#060606]">
      <HUD />
      <div className="px-5 sm:px-8 py-8 space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[16px] font-bold text-[#e0e0e0] font-[VT323] uppercase tracking-wider">
              OPERATION: {wikiName.toUpperCase()}
            </h1>
            <p className="mt-1 text-[13px] text-[#888] font-[VT323]">
              STAGE {stage}-1 /// SQUAD READY /// 2/6 CONNECTORS ACTIVE
            </p>
          </div>
          <Link href="/app/ask" className="inline-flex items-center gap-2 bg-[#e63946] hover:bg-[#ff2a3a] text-white px-4 py-2.5 rounded-sm text-[13px] font-semibold transition-colors">
            <Zap className="w-4 h-4" /> OPEN COMMS
          </Link>
        </div>

        {/* Power-Up Meters */}
        <div className="border border-[#333] rounded-sm p-5 bg-[#080808]">
          <h2 className="text-[13px] font-bold text-[#f77f00] uppercase tracking-wider mb-4 font-[VT323]">
            POWER-UP METERS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.map((s) => <PowerUpBar key={s.label} label={s.label} value={s.value} max={s.max} color={s.color} />)}
          </div>
        </div>

        {/* Stage Select */}
        <div>
          <h2 className="text-[13px] font-bold text-[#e63946] uppercase tracking-wider mb-3 font-[VT323] flex items-center gap-2">
            <Crosshair className="w-4 h-4" /> STAGE SELECT
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stages.map((s) => <StageCard key={s.name} stage={s} />)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mission Log */}
          <div className="border border-[#333] rounded-sm p-5 bg-[#080808]">
            <h2 className="text-[13px] font-bold text-[#00b4d8] uppercase tracking-wider mb-3 font-[VT323] flex items-center gap-2">
              <Radar className="w-4 h-4" /> MISSION LOG
            </h2>
            <div className="space-y-1.5">
              {missionLog.map((m) => <MissionLogEntry key={m.title} mission={m} />)}
            </div>
            <div className="mt-4 pt-4 border-t border-[#222]">
              <div className="flex items-center justify-between font-[VT323]">
                <span className="text-[13px] text-[#888]">TOTAL XP</span>
                <span className="text-[17px] text-[#f77f00]">1,250</span>
              </div>
              <div className="mt-2 h-2 bg-[#1a1a1a] rounded-sm overflow-hidden">
                <div className="h-full bg-[#f77f00] rounded-sm w-[45%]" />
              </div>
              <p className="text-[11px] text-[#555] mt-1 font-[VT323]">LEVEL 3 — NEXT: 2,000 XP</p>
            </div>
          </div>

          {/* Squad Status */}
          <div className="border border-[#333] rounded-sm p-5 bg-[#080808]">
            <h2 className="text-[13px] font-bold text-[#4a7c59] uppercase tracking-wider mb-3 font-[VT323] flex items-center gap-2">
              <Shield className="w-4 h-4" /> SQUAD STATUS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {squad.map((member) => <SquadMember key={member.name} member={member} />)}
            </div>
            <div className="mt-5 p-4 border border-[#e63946]/30 bg-[#e63946]/5 rounded-sm">
              <p className="text-[13px] text-[#e63946] font-[VT323]">
                <Flame className="w-3.5 h-3.5 inline mr-1.5" /> THREAT LEVEL: MEDIUM
              </p>
              <p className="text-[12px] text-[#888] mt-1 font-[VT323]">
                2 contradictions detected in intel. Deploy to Contradictions zone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
