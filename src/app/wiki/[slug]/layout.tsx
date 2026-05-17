"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, FileText, Upload, Database, GitBranch, AlertTriangle, MessageCircle, ChevronLeft, Menu, X, Plug, Zap } from "lucide-react";
import { useState } from "react";
import CommandPalette from "./CommandPalette";

const navItems = [
  { label: "Home", href: "", icon: Home },
  { label: "Pages", href: "/pages", icon: FileText },
  { label: "Ingest", href: "/ingest", icon: Upload },
  { label: "Sources", href: "/sources", icon: Database },
  { label: "Connectors", href: "/connectors", icon: Plug },
  { label: "Graph", href: "/graph", icon: GitBranch },
  { label: "Contradictions", href: "/contradictions", icon: AlertTriangle },
  { label: "Ask", href: "/ask", icon: Zap },
];

/* Mascot SVG */
function MascotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4C10 4 6 8 6 13C6 16 8 19 10 20C10 23 9 26 7 28C9 27 11 25 12 22C13 23 14 23 16 23C18 23 19 23 20 22C21 25 23 27 25 28C23 26 22 23 22 20C24 19 26 16 26 13C26 8 22 4 16 4Z" fill="#8b5cf6" />
      <circle cx="12.5" cy="12" r="1.5" fill="#150a26" />
      <circle cx="19.5" cy="12" r="1.5" fill="#150a26" />
    </svg>
  );
}

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params?.slug as string;

  const [mobileOpen, setMobileOpen] = useState(false);

  const basePath = `/wiki/${slug}`;

  const isActive = (itemHref: string) => {
    const full = itemHref === "" ? basePath : `${basePath}${itemHref}`;
    if (itemHref === "") {
      return pathname === basePath || pathname === `${basePath}/`;
    }
    return pathname.startsWith(full);
  };

  return (
    <div className="flex min-h-screen relative bg-[#150a26]">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#0c0618] border-2 border-dotted border-[rgba(139,92,246,0.3)] p-2.5 text-[#e8d5f7]"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-[#150a26]/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-56 shrink-0",
          "bg-[#0c0618] border-r-2 border-dotted border-[rgba(139,92,246,0.15)]",
          "flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b-2 border-dotted border-[rgba(139,92,246,0.1)]">
          <MascotIcon className="w-7 h-7" />
          <div className="min-w-0">
            <p className="text-xs font-bold truncate text-[#e8d5f7] tracking-wider uppercase">{slug}</p>
            <p className="text-[10px] text-[#4a3a6a]">Personalized Wiki</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const href = item.href === "" ? basePath : `${basePath}${item.href}`;
            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all duration-200 border border-dotted",
                  active
                    ? "bg-[rgba(139,92,246,0.1)] text-[#b794f6] border-[rgba(139,92,246,0.3)]"
                    : "text-[#6b5b8a] hover:text-[#e8d5f7] hover:bg-[rgba(139,92,246,0.05)] border-transparent"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-[#b794f6]" : "text-[#4a3a6a]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-5 py-4 border-t-2 border-dotted border-[rgba(139,92,246,0.1)]">
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] text-[#4a3a6a] hover:text-[#e8d5f7] transition-colors uppercase tracking-wider"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-56 p-6 sm:p-8 lg:p-10 min-w-0 relative z-10">
        {children}
      </main>

      {/* Global AI Agent */}
      <CommandPalette slug={slug} />
    </div>
  );
}
