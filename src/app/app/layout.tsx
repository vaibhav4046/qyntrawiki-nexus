"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
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
  Brain,
  Bot,
  Settings,
  LogOut,
  User,
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
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-[#e63946] flex items-center justify-center text-black font-bold text-[10px] font-[Press_Start_2P]">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#e0e0e0] truncate font-[VT323]">{name}</p>
        <p className="text-[8px] text-[#555] truncate">{email}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-1.5 text-[#555] hover:text-[#e63946] transition-colors"
        title="Abort Mission"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

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
    <div className="flex min-h-screen bg-black">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden glass-panel p-2.5 text-white"
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
          "bg-[#080808]/95 backdrop-blur-xl",
          "border-r-[3px] border-[#e63946]",
          "flex flex-col",
          "transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b-[3px] border-[#e63946]">
          <div className="w-8 h-8 bg-[#e63946] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold truncate text-[#e0e0e0] tracking-wider uppercase font-[Press_Start_2P]">
              QYNTRA
            </p>
            <p className="text-[10px] text-[#f77f00] font-[VT323]">OPERATION NEXUS</p>
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
                  "flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all duration-200 font-[VT323]",
                  active
                    ? "bg-[#e63946]/10 text-[#e63946] border-l-[3px] border-[#e63946]"
                    : "text-[#888] hover:text-[#e0e0e0] hover:bg-[#e63946]/5 border-l-[3px] border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active ? "text-red-500" : "text-gray-600"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-5 py-3 border-t-[3px] border-[#e63946] space-y-2">
          <AppUserSection />
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] text-[#555] hover:text-[#e0e0e0] transition-colors uppercase tracking-wider font-[VT323]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Mission Briefing
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
