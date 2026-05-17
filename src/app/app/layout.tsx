"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plug,
  Upload,
  BookOpen,
  FolderOpen,
  GitBranch,
  MessageSquare,
  FolderTree,
  AlertTriangle,
  Globe,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Connect", href: "/app/connect", icon: Plug },
  { label: "Import", href: "/app/import", icon: Upload },
  { label: "Wiki", href: "/app/wiki", icon: BookOpen },
  { label: "Files", href: "/app/files", icon: FolderOpen },
  { label: "Graph", href: "/app/graph", icon: GitBranch },
  { label: "Ask", href: "/app/ask", icon: MessageSquare },
  { label: "Organize", href: "/app/organize", icon: FolderTree },
  { label: "Contradictions", href: "/app/contradictions", icon: AlertTriangle },
  { label: "Publish", href: "/app/publish", icon: Globe },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app" || pathname === "/app/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden glass-panel p-2.5 text-[#f5f0eb]"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-60 shrink-0",
          "bg-[#0f0f0f]/95 backdrop-blur-xl",
          "border-r border-[rgba(234,88,12,0.1)]",
          "flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[rgba(234,88,12,0.1)]">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-[#f5f0eb] tracking-wider uppercase">
              QyntraWiki
            </p>
            <p className="text-[10px] text-[#6b6560]">Nexus</p>
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
                  "flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all duration-200 rounded-md",
                  active
                    ? "bg-[rgba(245,158,11,0.1)] text-[#fbbf24]"
                    : "text-[#a89f91] hover:text-[#f5f0eb] hover:bg-[rgba(245,158,11,0.05)]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active ? "text-[#fbbf24]" : "text-[#6b6560]"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[rgba(234,88,12,0.1)]">
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] text-[#6b6560] hover:text-[#f5f0eb] transition-colors uppercase tracking-wider"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Landing
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-60 min-w-0">
        {children}
      </main>
    </div>
  );
}
