import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Sparkles,
  FileText,
  Hash,
  Calendar,
  ArrowRight,
  Globe,
  Lock,
} from "lucide-react";

export default async function PublicWikiHomePage({
  params,
}: {
  params: Promise<{ wikiSlug: string }>;
}) {
  const { wikiSlug } = await params;

  const wiki = await prisma.wiki.findFirst({
    where: { slug: wikiSlug },
  });

  if (!wiki) {
    notFound();
  }

  const wikiId = wiki.id as string;

  const pages = await prisma.page.findMany({
    where: { wikiId: wiki.id, isPublic: true },
    orderBy: { updatedAt: "desc" },
  });

  const publishSettings = await prisma.publishSettings.findFirst({
    where: { wikiId: wiki.id },
  });

  const sourceCount = await prisma.source.count({ where: { wikiId } });
  const entityCount = await prisma.entity.count({ where: { wikiId } });

  const publicTitle = (publishSettings?.publicTitle as string) || (wiki.name as string);
  const publicDescription =
    (publishSettings?.publicDescription as string) || (wiki.description as string);
  const showGeneratedLabel = (publishSettings?.showGeneratedLabel as boolean) ?? true;

  const pageData = pages.map((p) => ({
    id: p.id as string,
    title: p.title as string,
    slug: p.slug as string,
    summary: p.summary as string,
    healthScore: p.healthScore as number,
    updatedAt: p.updatedAt as string,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gradient-warm">
      <header className="border-b border-[rgba(234,88,12,0.12)] px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#f5f0eb] tracking-tight">
                {publicTitle}
              </h1>
              {publicDescription && (
                <p className="text-[#a89f91] text-sm mt-1.5 max-w-xl">
                  {publicDescription}
                </p>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#6b6560]">
              <Sparkles className="w-3.5 h-3.5 text-[#fb923c]" />
              <span>QyntraWiki</span>
            </div>
          </div>

          {showGeneratedLabel && (
            <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-[#6b6560] bg-[rgba(20,18,16,0.6)] border border-[rgba(107,101,96,0.15)] rounded-md px-3 py-1.5">
              <Lock className="w-3 h-3" />
              Generated from a private personal wiki
            </div>
          )}
        </div>
      </header>

      <div className="border-b border-[rgba(234,88,12,0.08)] px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center gap-6 text-xs text-[#6b6560]">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {pageData.length} page{pageData.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {sourceCount} source{sourceCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" />
            {entityCount} entit{entityCount === 1 ? "y" : "ies"}
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {pageData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <BookOpen className="w-16 h-16 text-[#6b6560]/30" />
            <p className="text-[#a89f91] text-lg font-medium">No public articles yet</p>
            <p className="text-[#6b6560] text-sm">
              This wiki has no published pages. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pageData.map((page) => (
              <Link
                key={page.id}
                href={`/p/${wikiSlug}/${page.slug}`}
                className={cn(
                  "group block p-5 rounded-lg border border-[rgba(107,101,96,0.15)]",
                  "hover:border-[rgba(245,158,11,0.25)] hover:bg-[rgba(245,158,11,0.02)]",
                  "transition-all duration-200"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[#f5f0eb] group-hover:text-[#fbbf24] transition-colors">
                    {page.title}
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-mono",
                        page.healthScore >= 0.7
                          ? "bg-emerald-500/10 text-emerald-400"
                          : page.healthScore >= 0.4
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {(page.healthScore * 100).toFixed(0)}%
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#6b6560] group-hover:text-[#fbbf24] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                {page.summary && (
                  <p className="text-sm text-[#a89f91] mt-2 line-clamp-2">
                    {page.summary}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-xs text-[#6b6560]">
                  <Calendar className="w-3 h-3" />
                  <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[rgba(234,88,12,0.08)] px-6 py-8 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6b6560]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fb923c]" />
            <span>Powered by QyntraWiki</span>
          </div>
          <span>
            {publicTitle} &mdash; Generated from {sourceCount} source
            {sourceCount !== 1 ? "s" : ""}
          </span>
        </div>
      </footer>
    </div>
  );
}
