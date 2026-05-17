import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  FileText, Database, Lightbulb, AlertTriangle, FolderOpen,
  GitBranch, MessageSquare, Plug, Upload, BookOpen, ArrowRight, Zap,
} from "lucide-react";

export default async function AppDashboardPage() {
  const wiki = await prisma.wiki.findFirst({ where: { slug: "ai-agent-memory" } });
  const wikiId = (wiki?.id as string) || "demo-wiki";

  const pageCount = await prisma.page.count({ where: { wikiId } });
  const sourceCount = await prisma.source.count({ where: { wikiId } });
  const fileCount = await prisma.fileItem.count({ where: { wikiId } });
  const claimCount = await prisma.claim.count({ where: { wikiId } });
  const contradictionCount = await prisma.claim.count({ where: { wikiId, status: "disputed" } });
  const entityCount = await prisma.entity.count({ where: { wikiId } });

  const recentPages = await prisma.page.findMany({
    where: { wikiId }, orderBy: { updatedAt: "desc" }, take: 5,
  });

  const recentFiles = await prisma.fileItem.findMany({
    where: { wikiId }, orderBy: { createdAt: "desc" }, take: 5,
  });

  const connectors = await prisma.connector.findMany({ where: { wikiId } });
  const connectedCount = connectors.filter((c) => (c.status as string) === "connected").length;

  const stats = [
    { label: "Wiki Pages", value: pageCount, icon: FileText, href: "/app/wiki", color: "text-[#e63946]" },
    { label: "Sources", value: sourceCount, icon: Database, href: "/app/import", color: "text-[#f77f00]" },
    { label: "Files", value: fileCount, icon: FolderOpen, href: "/app/files", color: "text-[#a78bfa]" },
    { label: "Entities", value: entityCount, icon: Lightbulb, href: "/app/graph", color: "text-[#00b4d8]" },
    { label: "Claims", value: claimCount, icon: MessageSquare, href: "/app/ask", color: "text-[#4a7c59]" },
    { label: "Contradictions", value: contradictionCount, icon: AlertTriangle, href: "/app/contradictions", color: "text-[#e63946]" },
  ];

  const modules = [
    { label: "Connect Sources", desc: "Link Notion, Drive, local files", icon: Plug, href: "/app/connect", accent: "#e63946" },
    { label: "Import Data", desc: "Upload files, paste text, add URLs", icon: Upload, href: "/app/import", accent: "#f77f00" },
    { label: "Browse Wiki", desc: "Read compiled articles", icon: BookOpen, href: "/app/wiki", accent: "#00b4d8" },
    { label: "Explore Graph", desc: "Visualize knowledge network", icon: GitBranch, href: "/app/graph", accent: "#4a7c59" },
    { label: "Ask Questions", desc: "Query your knowledge base", icon: MessageSquare, href: "/app/ask", accent: "#ff69b4" },
    { label: "Organize", desc: "AI suggestions for structure", icon: FolderOpen, href: "/app/organize", accent: "#a78bfa" },
  ];

  return (
    <div className="min-h-screen bg-[#060606] p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-[13px] text-[#888] mt-1">
            AI Agent Memory wiki — {connectedCount}/{connectors.length} sources connected
          </p>
        </div>
        <Link href="/app/ask" className="btn w-fit">
          <Zap className="w-4 h-4" />
          Ask My Wiki
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <div className="card p-4 cursor-pointer h-full hover:border-[#2a2a2a]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">{stat.label}</span>
                  <Icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.href} href={mod.href} className="card p-4 flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${mod.accent}10` }}>
                  <Icon className="w-4 h-4" style={{ color: mod.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-white group-hover:text-[#e63946] transition-colors">{mod.label}</p>
                  <p className="text-[13px] text-[#666] mt-0.5">{mod.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#e63946] transition-colors shrink-0 mt-1" />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pages */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#e63946]" />
            Recent Wiki Pages
          </h2>
          {recentPages.length === 0 ? (
            <p className="text-[13px] text-[#666] py-6 text-center">No pages yet. Import sources to generate pages.</p>
          ) : (
            <div className="space-y-2">
              {recentPages.map((page) => (
                <Link key={page.id as string} href={`/app/wiki/${page.slug as string}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] hover:bg-[#111] transition-colors group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{page.title as string}</p>
                    <p className="text-[12px] text-[#666] truncate mt-0.5">{(page.summary as string)?.slice(0, 80)}...</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#555] group-hover:text-[#e63946] shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Connector Status */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Plug className="w-4 h-4 text-[#f77f00]" />
            Connector Status
          </h2>
          <div className="space-y-2">
            {connectors.map((conn) => {
              const isConnected = (conn.status as string) === "connected";
              return (
                <div key={conn.id as string} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full",
                      isConnected ? "bg-[#4a7c59] shadow-[0_0_6px_#4a7c59]" : "bg-[#666]"
                    )} />
                    <span className="text-[14px] text-white">{conn.name as string}</span>
                  </div>
                  <span className={cn("text-[11px] font-semibold uppercase tracking-wider",
                    isConnected ? "text-[#4a7c59]" : "text-[#666]"
                  )}>{isConnected ? "Active" : "Inactive"}</span>
                </div>
              );
            })}
          </div>
          {contradictionCount > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-[#e63946]/5 border border-[#e63946]/20">
              <p className="text-[13px] text-[#e63946] font-medium">{contradictionCount} contradictions detected</p>
              <p className="text-[12px] text-[#666] mt-1">Review in the Contradictions module to resolve conflicts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
