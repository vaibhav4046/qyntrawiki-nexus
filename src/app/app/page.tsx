import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  FileText,
  Database,
  Lightbulb,
  AlertTriangle,
  FolderOpen,
  GitBranch,
  MessageSquare,
  Plug,
  Upload,
  BookOpen,
  Globe,
  FolderTree,
  ArrowRight,
  Zap,
} from "lucide-react";

export default async function AppDashboardPage() {
  // For demo, we show the demo wiki stats
  const wiki = await prisma.wiki.findFirst({ where: { slug: "ai-agent-memory" } });
  const wikiId = (wiki?.id as string) || "demo-wiki";

  const pageCount = await prisma.page.count({ where: { wikiId } });
  const sourceCount = await prisma.source.count({ where: { wikiId } });
  const fileCount = await prisma.fileItem.count({ where: { wikiId } });
  const claimCount = await prisma.claim.count({ where: { wikiId } });
  const contradictionCount = await prisma.claim.count({ where: { wikiId, status: "disputed" } });
  const entityCount = await prisma.entity.count({ where: { wikiId } });

  const recentPages = await prisma.page.findMany({
    where: { wikiId },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const recentFiles = await prisma.fileItem.findMany({
    where: { wikiId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const connectors = await prisma.connector.findMany({ where: { wikiId } });
  const connectedCount = connectors.filter((c) => (c.status as string) === "connected").length;

  const stats = [
    { label: "Wiki Pages", value: pageCount, icon: FileText, href: "/app/wiki", color: "text-[#fbbf24]" },
    { label: "Sources", value: sourceCount, icon: Database, href: "/app/import", color: "text-[#fb923c]" },
    { label: "Files", value: fileCount, icon: FolderOpen, href: "/app/files", color: "text-[#a78bfa]" },
    { label: "Entities", value: entityCount, icon: Lightbulb, href: "/app/graph", color: "text-[#60a5fa]" },
    { label: "Claims", value: claimCount, icon: MessageSquare, href: "/app/ask", color: "text-[#34d399]" },
    { label: "Contradictions", value: contradictionCount, icon: AlertTriangle, href: "/app/contradictions", color: "text-[#f87171]" },
  ];

  const quickActions = [
    { label: "Connect Sources", desc: "Link Notion, Drive, local files", icon: Plug, href: "/app/connect", color: "from-amber-500/20 to-orange-500/20" },
    { label: "Import Data", desc: "Upload files, paste text, add URLs", icon: Upload, href: "/app/import", color: "from-orange-500/20 to-red-500/20" },
    { label: "Browse Wiki", desc: "Read compiled articles", icon: BookOpen, href: "/app/wiki", color: "from-blue-500/20 to-purple-500/20" },
    { label: "Explore Graph", desc: "Visualize knowledge network", icon: GitBranch, href: "/app/graph", color: "from-emerald-500/20 to-teal-500/20" },
    { label: "Ask Questions", desc: "Query your knowledge base", icon: MessageSquare, href: "/app/ask", color: "from-violet-500/20 to-fuchsia-500/20" },
    { label: "Organize", desc: "AI suggestions for structure", icon: FolderTree, href: "/app/organize", color: "from-pink-500/20 to-rose-500/20" },
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f5f0eb]">QyntraWiki Nexus</h1>
            <p className="mt-1 text-sm text-[#a89f91]">
              AI Agent Memory Encyclopedia — {connectedCount}/{connectors.length} connectors active
            </p>
          </div>
          <Link
            href="/app/ask"
            className="btn-primary hidden sm:flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Ask My Wiki
          </Link>
        </div>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <div className="glass-card p-4 cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#6b6560] uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <Icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <div className="text-2xl font-bold text-[#f5f0eb]">{stat.value}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="section-title">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="glass-card p-4 flex items-start gap-3 group"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br",
                      action.color
                    )}
                  >
                    <Icon className="w-4 h-4 text-[#f5f0eb]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f5f0eb] group-hover:text-[#fbbf24] transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-[#6b6560] mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6b6560] group-hover:text-[#fbbf24] transition-colors shrink-0 mt-1" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Pages */}
          <div className="glass-panel rounded-lg p-5">
            <h2 className="section-title flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Recent Wiki Pages
            </h2>
            {recentPages.length === 0 ? (
              <div className="empty-state py-6">
                <p className="text-sm">No pages yet. Import sources to generate pages.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPages.map((page) => (
                  <Link
                    key={page.id as string}
                    href={`/app/wiki/${page.slug as string}`}
                    className="flex items-center justify-between p-3 rounded-md bg-[rgba(245,158,11,0.03)] hover:bg-[rgba(245,158,11,0.08)] transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#f5f0eb] truncate">
                        {page.title as string}
                      </p>
                      <p className="text-xs text-[#6b6560] truncate mt-0.5">
                        {(page.summary as string)?.slice(0, 80)}...
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#6b6560] group-hover:text-[#fbbf24] shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Files */}
          <div className="glass-panel rounded-lg p-5">
            <h2 className="section-title flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Recent Files
            </h2>
            {recentFiles.length === 0 ? (
              <div className="empty-state py-6">
                <p className="text-sm">No files imported yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentFiles.map((file) => (
                  <Link
                    key={file.id as string}
                    href="/app/files"
                    className="flex items-center justify-between p-3 rounded-md bg-[rgba(167,139,250,0.03)] hover:bg-[rgba(167,139,250,0.08)] transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#f5f0eb] truncate">
                        {file.name as string}
                      </p>
                      <p className="text-xs text-[#6b6560] truncate mt-0.5">
                        {file.path as string} · {Math.round((file.sizeBytes as number) / 1024)}KB
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#6b6560] group-hover:text-[#a78bfa] shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Connector Status */}
        <div className="glass-panel rounded-lg p-5">
          <h2 className="section-title flex items-center gap-2">
            <Plug className="w-4 h-4" />
            Connector Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {connectors.map((conn) => {
              const isConnected = (conn.status as string) === "connected";
              return (
                <div
                  key={conn.id as string}
                  className={cn(
                    "p-3 rounded-md border transition-all",
                    isConnected
                      ? "bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.2)]"
                      : "bg-[rgba(107,101,96,0.05)] border-[rgba(107,101,96,0.15)]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isConnected ? "bg-green-500" : "bg-[#6b6560]"
                      )}
                    />
                    <span className="text-xs font-medium text-[#f5f0eb]">
                      {conn.name as string}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      isConnected ? "text-green-400" : "text-[#6b6560]"
                    )}
                  >
                    {isConnected ? "Active" : "Inactive"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
