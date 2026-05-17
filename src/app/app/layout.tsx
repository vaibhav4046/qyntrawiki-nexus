"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Plug, Upload, BookOpen, FolderOpen, GitBranch,
  MessageSquare, FolderTree, AlertTriangle, Globe, Menu, X,
  ChevronLeft, Sparkles, Brain, Bot, Settings, LogOut, User,
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
  const name = session?.user?.name || "User";
  const email = session?.user?.email || "";

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#e63946]/10 border border-[#e63946]/20 flex items-center justify-center text-[#e63946] text-xs font-bold shrink-0">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white truncate">{name}</p>
        <p className="text-[11px] text-[#555] truncate">{email}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-2 text-[#555] hover:text-[#e63946] transition-colors rounded-md hover:bg-[#e63946]/5"
        title="Sign out"
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
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#111] border border-[#222] p-2.5 text-white rounded-lg"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 shrink-0 bg-[#0c0c0c] border-r border-[#1a1a1a] flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1a1a1a]">
          <div className="w-8 h-8 rounded-lg bg-[#e63946] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white tracking-wide">QyntraWiki</p>
            <p className="text-[11px] text-[#e63946]">Nexus</p>
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
                  "flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-150",
                  active
                    ? "bg-[#e63946]/10 text-[#e63946]"
                    : "text-[#888] hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-[#e63946]" : "text-[#555]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-[#1a1a1a]">
          <AppUserSection />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {children}
      </main>
    </div>
  );
}
