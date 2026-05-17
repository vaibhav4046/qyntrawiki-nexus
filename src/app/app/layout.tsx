"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Plug, Upload, BookOpen, FolderOpen, GitBranch,
  MessageSquare, FolderTree, AlertTriangle, Globe, Menu, X,
  ChevronLeft, Sparkles, Brain, Bot, Settings, LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Connect", href: "/app/connect", icon: Plug },
  { label: "Import", href: "/app/import", icon: Upload },
  { label: "Files", href: "/app/files", icon: FolderOpen },
  { label: "Wiki", href: "/app/wiki", icon: BookOpen },
  { label: "Graph", href: "/app/graph", icon: GitBranch },
  { label: "Ask", href: "/app/ask", icon: MessageSquare },
  { label: "Study", href: "/app/study", icon: Brain },
  { label: "Organize", href: "/app/organize", icon: FolderTree },
  { label: "Agents", href: "/app/agents", icon: Bot },
  { label: "Contradictions", href: "/app/contradictions", icon: AlertTriangle },
  { label: "Publish", href: "/app/publish", icon: Globe },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

function AppUserSection() {
  const { data: session } = useSession();
  const name = session?.user?.name || "Soldier";
  const email = session?.user?.email || "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-sm bg-[#e63946] flex items-center justify-center text-white font-bold text-[13px] font-[VT323]">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#e0e0e0] truncate font-[VT323]">{name}</p>
        <p className="text-[11px] text-[#555] truncate">{email}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-2 text-[#555] hover:text-[#e63946] transition-colors rounded-sm hover:bg-[#e63946]/10"
        title="Abort Mission"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app" || pathname === "/app/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-[#060606]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden border border-[#e63946]/50 bg-[#080808] px-3 py-2 text-[#e63946] font-[VT323] text-[12px] uppercase tracking-wider rounded-sm"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 shrink-0 bg-[#080808]/95 border-r border-[#e63946]/30 flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#e63946]/30">
          <div className="w-8 h-8 rounded-sm bg-[#e63946] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#e0e0e0] tracking-wider uppercase font-[VT323]">QYNTRA</p>
            <p className="text-[12px] text-[#f77f00] font-[VT323]">OPERATION NEXUS</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-sm transition-all duration-150 font-[VT323]",
                  active
                    ? "bg-[#e63946]/10 text-[#e63946] border-l-2 border-[#e63946]"
                    : "text-[#888] hover:text-[#e0e0e0] hover:bg-white/5 border-l-2 border-transparent"
                )}
              >
                <span className={cn("w-3 text-[12px] shrink-0 transition-opacity",
                  active ? "opacity-100 text-[#e63946]" : "opacity-0 group-hover:opacity-100 text-[#f77f00]"
                )}>▶</span>
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-[#e63946]" : "text-[#555] group-hover:text-[#e0e0e0]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-[#e63946]/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#e63946] font-[VT323] uppercase tracking-wider">Lives</span>
            <div className="flex gap-1 ml-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-3 h-3 rounded-sm bg-[#e63946]" />
              ))}
            </div>
          </div>
          <AppUserSection />
          <Link
            href="/"
            className="flex items-center gap-2 text-[12px] text-[#555] hover:text-[#e0e0e0] transition-colors font-[VT323]"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Mission Briefing
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {children}
      </main>
    </div>
  );
}
