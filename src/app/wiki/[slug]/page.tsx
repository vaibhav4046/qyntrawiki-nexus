import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Lightbulb, AlertTriangle, RefreshCw, ArrowRight, Plus, Database, GitBranch, Zap, Plug } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WikiDashboardPage({ params }: Props) {
  const { slug } = await params;

  const wiki = prisma.wiki.findUnique({ where: { slug } });
  if (!wiki) notFound();

  const wikiId = wiki.id as string;

  const pageCount = prisma.page.count({ where: { wikiId } });
  const sourceCount = prisma.source.count({ where: { wikiId } });
  const claimCount = prisma.claim.count({ where: { wikiId } });
  const contradictionCount = prisma.claim.count({ where: { wikiId, status: "disputed" } });

  const recentJobs = prisma.ingestJob.findMany({
    where: { wikiId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const jobsWithSource = recentJobs.map(job => ({
    ...job,
    source: prisma.source.findFirst({ where: { id: job.sourceId as string } }),
  }));

  const stats = [
    { label: "Total Pages", value: pageCount, icon: FileText, href: `/wiki/${slug}/pages`, color: "text-[#b794f6]" },
    { label: "Sources", value: sourceCount, icon: Database, href: `/wiki/${slug}/sources`, color: "text-[#00b4d8]" },
    { label: "Claims", value: claimCount, icon: Lightbulb, href: `/wiki/${slug}/graph`, color: "text-[#ffd500]" },
    { label: "Contradictions", value: contradictionCount, icon: AlertTriangle, href: `/wiki/${slug}/contradictions`, color: "text-[#ff2d92]" },
  ];

  const subPages = [
    { label: "Browse Pages", desc: "View all compiled wiki articles", icon: BookOpen, href: `/wiki/${slug}/pages` },
    { label: "Ingest Sources", desc: "Add URLs, files, or raw text", icon: Plus, href: `/wiki/${slug}/ingest` },
    { label: "Connectors", desc: "Connect Notion, Drive, LinkedIn, etc.", icon: Plug, href: `/wiki/${slug}/connectors` },
    { label: "Knowledge Graph", desc: "Explore entities and relationships", icon: GitBranch, href: `/wiki/${slug}/graph` },
    { label: "Contradictions", desc: "Review conflicting claims", icon: AlertTriangle, href: `/wiki/${slug}/contradictions` },
    { label: "Ask", desc: "Ask questions over your wiki", icon: Zap, href: `/wiki/${slug}/ask` },
  ];

  const statusColors: Record<string, string> = {
    queued: "text-[#4a3a6a] border-dotted border-[#4a3a6a]",
    processing: "text-[#00b4d8] border-dotted border-[#00b4d8]",
    completed: "text-[#00b4d8] border-dotted border-[#00b4d8]",
    failed: "text-[#ff2d92] border-dotted border-[#ff2d92]",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#e8d5f7]">{wiki.name as string}</h1>
        {wiki.description && <p className="mt-1.5 text-[#6b5b8a] max-w-2xl text-sm">{wiki.description as string}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <div className="jules-card p-4 hover:border-[rgba(139,92,246,0.5)] transition-colors cursor-pointer h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#6b5b8a] uppercase tracking-wider">{stat.label}</span>
                  <Icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <div className="text-2xl font-bold text-[#e8d5f7]">{stat.value}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="jules-card p-5">
          <h2 className="flex items-center gap-2 text-xs font-bold text-[#e8d5f7] mb-4 uppercase tracking-wider">
            <RefreshCw className="w-4 h-4 text-[#b794f6]" />
            Recent Compilation Jobs
          </h2>
          {recentJobs.length === 0 ? (
            <p className="text-xs text-[#4a3a6a] py-4 text-center">No compilation jobs yet. Add a source to get started.</p>
          ) : (
            <div className="space-y-2">
              {jobsWithSource.map((job) => (
                <div key={job.id as string} className="flex items-center justify-between bg-[rgba(139,92,246,0.05)] px-3 py-2 border border-dotted border-[rgba(139,92,246,0.1)]">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#e8d5f7] truncate">{(job.source as Record<string, unknown>)?.title as string || "Unknown source"}</p>
                    <p className="text-[10px] text-[#4a3a6a]">{(job.step as string) || "Waiting..."}</p>
                  </div>
                  <span className={cn("ml-2 shrink-0 px-2 py-0.5 text-[10px] font-medium uppercase border", statusColors[job.status as string] || statusColors.queued)}>
                    {job.status as string}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="jules-card p-5">
          <h2 className="flex items-center gap-2 text-xs font-bold text-[#e8d5f7] mb-4 uppercase tracking-wider">
            <ArrowRight className="w-4 h-4 text-[#b794f6]" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subPages.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-start gap-3 bg-[rgba(139,92,246,0.05)] px-3 py-3 border border-dotted border-[rgba(139,92,246,0.1)] hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.08)] transition-all"
                >
                  <Icon className="w-4 h-4 text-[#b794f6] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[#e8d5f7]">{item.label}</p>
                    <p className="text-[10px] text-[#4a3a6a]">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
