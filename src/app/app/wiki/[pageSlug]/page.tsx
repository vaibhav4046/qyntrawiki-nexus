import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  GitBranch,
  History,
  Link as LinkIcon,
  MessageSquare,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

interface WikiPageProps {
  params: Promise<{ pageSlug: string }>;
}

function extractHeadings(markdown: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      headings.push({ level, text, id });
    }
  }
  return headings;
}

export default async function WikiArticlePage({ params }: WikiPageProps) {
  const { pageSlug } = await params;

  const page = await prisma.page.findFirst({
    where: { slug: pageSlug },
  });

  if (!page) {
    notFound();
  }

  const [citations, relatedPages, claims, sources, revisions] = await Promise.all([
    prisma.citation.findMany({ where: { pageId: page.id } }),
    prisma.page.findMany({ where: { wikiId: page.wikiId }, take: 6 }),
    prisma.claim.findMany({ where: { pageId: page.id } }),
    prisma.source.findMany({ where: { wikiId: page.wikiId } }),
    prisma.pageRevision.findMany({
      where: { pageId: page.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const infobox = JSON.parse(page.infoboxJson || "{}") as Record<string, unknown>;
  const headings = extractHeadings(page.contentMd || "");

  const typeLabel = (infobox.type as string) || "Article";
  const confidence = typeof infobox.confidence === "number" ? infobox.confidence : 0;
  const sourceCount = (infobox.sourceCount as number) ?? sources.length ?? 0;
  const healthScore = typeof infobox.healthScore === "number" ? infobox.healthScore : 0;
  const coverageScore = typeof infobox.coverageScore === "number" ? infobox.coverageScore : 0;

  const formatDate = (d: Date | string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Link
            href="/app/wiki"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#a0a0a0] transition-colors hover:text-[#f5f5f5]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Wiki
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#f5f5f5] sm:text-4xl">
            {page.title}
          </h1>
          <p className="mt-2 text-[#a0a0a0]">
            Last updated {formatDate(page.updatedAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* LEFT: Table of Contents */}
          <aside className="order-2 lg:order-1 lg:col-span-3">
            <div className="glass-card sticky top-24 rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-2 text-[#f5f5f5]">
                <BookOpen className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold uppercase tracking-wider">Contents</span>
              </div>
              {headings.length === 0 ? (
                <p className="text-sm text-[#666666]">No sections</p>
              ) : (
                <nav className="space-y-1">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-white/5 ${
                        h.level === 3 ? "pl-6 text-[#a0a0a0]" : "font-medium text-[#f5f5f5]"
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              )}
            </div>
          </aside>

          {/* CENTER: Article content */}
          <main className="order-1 lg:order-2 lg:col-span-6">
            <article className="glass-panel rounded-2xl p-6 sm:p-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    return (
                      <h2 id={id} className="mt-8 text-xl font-semibold text-[#f5f5f5] scroll-mt-28">
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ children }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    return (
                      <h3 id={id} className="mt-6 text-lg font-semibold text-[#f5f5f5] scroll-mt-28">
                        {children}
                      </h3>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mt-3 leading-7 text-[#a0a0a0]">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mt-3 list-disc space-y-1 pl-6 text-[#a0a0a0]">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mt-3 list-decimal space-y-1 pl-6 text-[#a0a0a0]">{children}</ol>
                  ),
                  li: ({ children }) => <li className="leading-7">{children}</li>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="font-medium text-red-500 underline underline-offset-4 transition-colors hover:text-orange-500"
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="mt-3 border-l-4 border-amber-400/60 bg-white/5 pl-4 italic text-[#a0a0a0]">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-sm font-mono text-[#f5f5f5]">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="mt-3 overflow-x-auto rounded-xl bg-black/30 p-4 text-sm text-[#f5f5f5]">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full border-collapse text-sm">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-white/10 px-3 py-2 text-left font-semibold text-[#f5f5f5]">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-white/5 px-3 py-2 text-[#a0a0a0]">{children}</td>
                  ),
                  hr: () => <hr className="my-6 border-white/10" />,
                }}
              >
                {page.contentMd || "_No content provided._"}
              </ReactMarkdown>
            </article>

            {/* BOTTOM: Citations */}
            {citations.length > 0 && (
              <section className="mt-8">
                <div className="glass-card rounded-2xl p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-semibold text-[#f5f5f5]">Citations</h2>
                  </div>
                  <ul className="space-y-3">
                    {citations.map((c, idx) => (
                      <li
                        key={c.id}
                        className="flex items-start gap-3 rounded-xl bg-white/5 p-3 text-sm text-[#a0a0a0]"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-xs font-bold text-red-500">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-[#f5f5f5]">{c.title || "Untitled citation"}</p>
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs text-red-500 hover:text-orange-500"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {c.url}
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* BOTTOM: Claims */}
            {claims.length > 0 && (
              <section className="mt-8">
                <div className="glass-card rounded-2xl p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-[#f5f5f5]">Claims</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {claims.map((claim) => (
                      <div
                        key={claim.id}
                        className="rounded-xl bg-white/5 p-4 text-sm text-[#a0a0a0]"
                      >
                        <p className="font-medium text-[#f5f5f5]">{claim.text}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`badge ${
                              claim.status === "VERIFIED"
                                ? "badge-green"
                                : claim.status === "DISPUTED"
                                ? "badge-red"
                                : "badge-amber"
                            }`}
                          >
                            {claim.status}
                          </span>
                          {typeof claim.confidence === "number" && (
                            <span className="text-xs text-[#666666]">
                              Confidence: {Math.round(claim.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* BOTTOM: Revisions */}
            {revisions.length > 0 && (
              <section className="mt-8">
                <div className="glass-card rounded-2xl p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-orange-500" />
                    <h2 className="text-lg font-semibold text-[#f5f5f5]">Recent Revisions</h2>
                  </div>
                  <div className="space-y-2">
                    {revisions.map((rev) => (
                      <div
                        key={rev.id}
                        className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <GitBranch className="h-4 w-4 text-[#666666]" />
                          <span className="text-[#f5f5f5]">{rev.editSummary || "No summary"}</span>
                        </div>
                        <span className="text-xs text-[#666666]">{formatDate(rev.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* BOTTOM: Related Pages */}
            {relatedPages.length > 0 && (
              <section className="mt-8">
                <div className="glass-card rounded-2xl p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-semibold text-[#f5f5f5]">Related Pages</h2>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedPages
                      .filter((rp) => rp.id !== page.id)
                      .map((rp) => (
                        <Link
                          key={rp.id}
                          href={`/app/wiki/${rp.slug}`}
                          className="group flex items-center gap-3 rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-[#666666] group-hover:text-red-500" />
                          <span className="text-sm font-medium text-[#a0a0a0] group-hover:text-[#f5f5f5]">
                            {rp.title}
                          </span>
                        </Link>
                      ))}
                  </div>
                </div>
              </section>
            )}
          </main>

          {/* RIGHT: Infobox */}
          <aside className="order-3 lg:col-span-3">
            <div className="glass-card sticky top-24 rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold uppercase tracking-wider text-[#f5f5f5]">
                  Infobox
                </span>
              </div>

              <div className="space-y-4">
                {/* Type badge */}
                <div>
                  <span className="badge badge-amber">{typeLabel}</span>
                </div>

                {/* Confidence */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-[#a0a0a0]">Confidence</span>
                    <span className="font-semibold text-[#f5f5f5]">{Math.round(confidence * 100)}%</span>
                  </div>
                  <div className="health-bar h-2 w-full rounded-full">
                    <div
                      className="health-bar-fill h-2 rounded-full transition-all"
                      style={{ width: `${Math.round(confidence * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Source count */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 text-[#a0a0a0]">
                    <BookOpen className="h-4 w-4" />
                    Sources
                  </div>
                  <span className="font-semibold text-[#f5f5f5]">{sourceCount}</span>
                </div>

                {/* Health score */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 text-[#a0a0a0]">
                    <Shield className="h-4 w-4" />
                    Health
                  </div>
                  <span className="font-semibold text-[#f5f5f5]">{Math.round(healthScore * 100)}%</span>
                </div>

                {/* Coverage score */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 text-[#a0a0a0]">
                    <TrendingUp className="h-4 w-4" />
                    Coverage
                  </div>
                  <span className="font-semibold text-[#f5f5f5]">{Math.round(coverageScore * 100)}%</span>
                </div>

                {/* Created / Updated */}
                <div className="space-y-2 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#666666]">
                      <Clock className="h-3.5 w-3.5" />
                      Created
                    </div>
                    <span className="text-[#a0a0a0]">{formatDate(page.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#666666]">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Updated
                    </div>
                    <span className="text-[#a0a0a0]">{formatDate(page.updatedAt)}</span>
                  </div>
                </div>

                {/* Citation / claim / source counts */}
                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                  <div className="rounded-lg bg-white/5 p-2 text-center">
                    <div className="text-xs text-[#666666]">Citations</div>
                    <div className="mt-0.5 text-sm font-bold text-[#f5f5f5]">{citations.length}</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2 text-center">
                    <div className="text-xs text-[#666666]">Claims</div>
                    <div className="mt-0.5 text-sm font-bold text-[#f5f5f5]">{claims.length}</div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2 text-center">
                    <div className="text-xs text-[#666666]">Revisions</div>
                    <div className="mt-0.5 text-sm font-bold text-[#f5f5f5]">{revisions.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
