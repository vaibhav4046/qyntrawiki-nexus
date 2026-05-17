import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Tag,
  Quote,
  Shield,
  AlertTriangle,
  BookOpen,
  Lock,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

type Props = {
  params: Promise<{ wikiSlug: string; pageSlug: string }>;
};

function parseInfobox(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold mt-8 mb-4 text-[#f5f5f5] tracking-tight border-b border-[rgba(255,235,59,0.15)] pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg font-semibold mt-6 mb-3 text-[#ffeb3b] flex items-center gap-2 before:w-1 before:h-5 before:rounded-full before:bg-[#ffeb3b]">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base font-medium mt-5 mb-2 text-[#ffca28]">{children}</h3>
  ),
  p: ({ children }: any) => (
    <p className="text-[15px] leading-7 text-[#a0a0a0] mb-4">{children}</p>
  ),
  strong: ({ children }: any) => (
    <strong className="font-semibold text-[#f5f5f5]">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-[#a0a0a0]/70">{children}</em>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-inside space-y-1.5 mb-4 text-[15px] text-[#a0a0a0] ml-1">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-4 text-[15px] text-[#a0a0a0] ml-1">
      {children}
    </ol>
  ),
  li: ({ children }: any) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-[rgba(255,235,59,0.4)] pl-4 py-1 my-4 italic text-[#a0a0a0]/60 text-[15px]">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !className;
    return isInline ? (
      <code
        className="px-1.5 py-0.5 rounded bg-[rgba(255,235,59,0.1)] text-[#ffeb3b] text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    ) : (
      <pre className="rounded-lg bg-[#0d0a08] border border-[rgba(107,101,96,0.15)] p-4 overflow-x-auto my-4 text-sm">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#ffca28] hover:underline underline-offset-2"
    >
      {children}
    </a>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-[rgba(107,101,96,0.15)]">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-[rgba(255,235,59,0.06)] text-[#a0a0a0]">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-2.5 text-left font-medium border-b border-[rgba(107,101,96,0.15)] text-[#ffeb3b]">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 border-b border-[rgba(107,101,96,0.1)] text-[#a0a0a0]">
      {children}
    </td>
  ),
  hr: () => <hr className="my-6 border-[rgba(107,101,96,0.15)]" />,
};

export default async function PublicWikiPagePage({ params }: Props) {
  const { wikiSlug, pageSlug } = await params;

  const wiki = await prisma.wiki.findFirst({
    where: { slug: wikiSlug },
  });

  if (!wiki) {
    notFound();
  }

  const wikiId = wiki.id as string;

  const page = await prisma.page.findFirst({
    where: { slug: pageSlug, wikiId, isPublic: true },
  });

  const publishSettings = await prisma.publishSettings.findFirst({
    where: { wikiId },
  });

  if (!page) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <div className="glass-card rounded-lg p-8 max-w-md w-full text-center">
          <Lock className="w-10 h-10 text-[#666666] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#f5f5f5] mb-2">
            This page is not publicly available.
          </h1>
          <p className="text-sm text-[#a0a0a0] mb-6">
            The page you are looking for is either private or does not exist in this wiki.
          </p>
          <Link
            href={`/p/${wikiSlug}`}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to wiki
          </Link>
        </div>
      </div>
    );
  }

  const pageId = page.id as string;

  const rawCitations = await prisma.citation.findMany({
    where: { pageId },
    orderBy: { createdAt: "asc" },
  });

  const sourceIds = [...new Set(rawCitations.map((c) => c.sourceId as string))];
  const allSources = await prisma.source.findMany({
    where: { id: { in: sourceIds } },
  });
  const sourceMap = new Map(allSources.map((s) => [s.id as string, s]));

  const citations: Array<Record<string, unknown> & { source?: Record<string, unknown> | null }> = rawCitations.map((c) => ({
    ...(c as Record<string, unknown>),
    source: sourceMap.get(c.sourceId as string) || null,
  }));

  const infobox = parseInfobox(page.infoboxJson as string | undefined);
  const infoboxEntries = Object.entries(infobox).filter(([, v]) => v);
  const contentMd = (page.contentMd as string) || "";
  const healthScore = (page.healthScore as number) || 0;
  const confScore = (page.confidenceScore as number) || 0;

  const hidePrivateSources =
    (publishSettings?.hidePrivateSources as boolean) ?? true;

  const publicTitle =
    (publishSettings?.publicTitle as string) || (wiki.name as string);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[rgba(255,235,59,0.12)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/p/${wikiSlug}`}
              className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#f5f5f5] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to wiki
            </Link>
          </div>
          <span className="text-xs text-[#666666]">{publicTitle}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Article */}
          <article className="flex-1 min-w-0">
            <div className="glass-card rounded-lg p-6 md:p-8 overflow-hidden">
              {contentMd ? (
                <div className="prose-wiki max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    components={markdownComponents}
                  >
                    {contentMd}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <AlertTriangle className="w-10 h-10 text-[#666666]/30" />
                  <p className="text-[#a0a0a0] font-medium">No article content yet</p>
                  <p className="text-[#666666] text-sm max-w-md">
                    This page is awaiting compilation.
                  </p>
                </div>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            {/* Infobox */}
            <div className="glass-card rounded-lg p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#f5f5f5] mb-4">
                <Tag className="w-4 h-4 text-[#ffeb3b]" /> Infobox
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-[#666666]">Type</p>
                  <p className="text-sm font-medium text-[#f5f5f5]">
                    {infobox.type || "Article"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#666666]">Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-[rgba(107,101,96,0.2)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#ffeb3b]"
                        style={{ width: `${Math.round(confScore * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[#f5f5f5]">
                      {Math.round(confScore * 100)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-[#666666]">Sources cited</p>
                  <p className="text-sm font-medium text-[#f5f5f5]">
                    {citations.length}
                  </p>
                </div>
                {infoboxEntries
                  .filter(([k]) => !["type"].includes(k))
                  .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-xs text-[#666666] capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-sm font-medium text-[#f5f5f5] truncate">
                        {value}
                      </p>
                    </div>
                  ))}
                <div className="pt-2 border-t border-[rgba(107,101,96,0.15)]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#a0a0a0]" />
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        healthScore >= 0.8
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                          : healthScore >= 0.5
                          ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
                          : "text-red-400 bg-red-500/10 border-red-500/30"
                      )}
                    >
                      Health {Math.round(healthScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Citations */}
            {citations.length > 0 && (
              <div className="glass-card rounded-lg p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#f5f5f5] mb-4">
                  <Quote className="w-4 h-4 text-[#ffeb3b]" /> Citations (
                  {citations.length})
                </h3>
                <div className="space-y-3">
                  {citations.map((citation, i) => {
                    const src = citation.source as Record<string, unknown> | null;
                    return (
                      <div
                        key={citation.id as string}
                        className="border-b border-[rgba(107,101,96,0.1)] pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-mono text-[#ffca28]/70 mt-0.5">
                            [{i + 1}]
                          </span>
                          <div className="min-w-0">
                            {!hidePrivateSources ? (
                              <>
                                <p className="text-sm font-medium text-[#f5f5f5] truncate">
                                  {src?.title as string || "Unknown source"}
                                </p>
                                {citation.quote && (
                                  <p className="text-xs text-[#a0a0a0] mt-0.5 line-clamp-2 italic">
                                    &ldquo;{citation.quote as string}&rdquo;
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-[#a0a0a0]">
                                Source details hidden
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Back link */}
            <Link
              href={`/p/${wikiSlug}`}
              className="glass-card rounded-lg p-4 flex items-center gap-3 group hover:border-[rgba(255,235,59,0.25)] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#ffeb3b]" />
              <span className="text-sm font-medium text-[#f5f5f5] group-hover:text-[#ffeb3b] transition-colors">
                Back to {publicTitle}
              </span>
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
