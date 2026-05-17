import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Link2, Quote, ExternalLink, Tag, AlertTriangle, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

type Props = {
  params: Promise<{ slug: string; pageSlug: string }>;
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
  h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-10 mb-5 text-foreground tracking-tight">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl font-semibold mt-8 mb-3 text-foreground flex items-center gap-2 before:w-1 before:h-5 before:rounded-full before:bg-primary">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg font-medium mt-6 mb-2 text-foreground/90">{children}</h3>,
  p: ({ children }: any) => <p className="text-[15px] leading-7 text-foreground/80 mb-4">{children}</p>,
  strong: ({ children }: any) => <strong className="font-semibold text-primary/90">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-foreground/70">{children}</em>,
  ul: ({ children }: any) => <ul className="list-disc list-inside space-y-1.5 mb-4 text-[15px] text-foreground/80 ml-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside space-y-1.5 mb-4 text-[15px] text-foreground/80 ml-1">{children}</ol>,
  li: ({ children }: any) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-primary/40 pl-4 py-1 my-4 italic text-foreground/60 text-[15px]">{children}</blockquote>
  ),
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !className;
    return isInline ? (
      <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-sm font-mono" {...props}>{children}</code>
    ) : (
      <pre className="rounded-lg bg-[#0d0a08] border border-border/50 p-4 overflow-x-auto my-4 text-sm">
        <code className={className} {...props}>{children}</code>
      </pre>
    );
  },
  a: ({ href, children }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-2">{children}</a>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-border/50">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-muted/50 text-muted-foreground">{children}</thead>,
  th: ({ children }: any) => <th className="px-4 py-2.5 text-left font-medium border-b border-border/50">{children}</th>,
  td: ({ children }: any) => <td className="px-4 py-2 border-b border-border/30 text-foreground/80">{children}</td>,
  hr: () => <hr className="my-6 border-border/30" />,
};

export default async function PageArticlePage({ params }: Props) {
  const { slug, pageSlug } = await params;

  const wiki = prisma.wiki.findUnique({ where: { slug } });
  if (!wiki) notFound();

  const wikiId = wiki.id as string;

  const page = prisma.page.findFirst({ where: { wikiId, slug: pageSlug } });

  if (!page) notFound();

  const pageId = page.id as string;

  const rawCitations = prisma.citation.findMany({
    where: { pageId },
    orderBy: { createdAt: "asc" },
  });

  const citations = rawCitations.map(c => ({
    ...c,
    source: prisma.source.findFirst({ where: { id: c.sourceId as string } }),
  }));

  const toRelationsRaw = prisma.relation.findMany({
    where: { toPageId: pageId },
    orderBy: { weight: "desc" },
    take: 8,
  });

  const toRelations = toRelationsRaw.map(r => ({
    ...r,
    fromPage: prisma.page.findFirst({ where: { id: r.fromPageId as string } }),
  }));

  const fromRelationsRaw = prisma.relation.findMany({
    where: { fromPageId: pageId },
    orderBy: { weight: "desc" },
    take: 8,
  });

  const fromRelations = fromRelationsRaw.map(r => ({
    ...r,
    toPage: prisma.page.findFirst({ where: { id: r.toPageId as string } }),
  }));

  const pageClaims = prisma.claim.findMany({ where: { pageId } });
  const disputedClaims = pageClaims.filter(c => c.status === "disputed");

  const infobox = parseInfobox(page.infoboxJson as string | undefined);
  const infoboxEntries = Object.entries(infobox).filter(([, v]) => v);
  const contentMd = (page.contentMd as string) || "";

  const relatedPages: Array<{ slug: string; title: string; healthScore: number; relation: string }> = [];
  for (const r of toRelations) {
    const fp = r.fromPage as Record<string, unknown> | null;
    if (fp) {
      relatedPages.push({
        slug: fp.slug as string,
        title: fp.title as string,
        healthScore: (fp.healthScore as number) || 0,
        relation: "refers to this",
      });
    }
  }
  for (const r of fromRelations) {
    const tp = r.toPage as Record<string, unknown> | null;
    if (tp) {
      relatedPages.push({
        slug: tp.slug as string,
        title: tp.title as string,
        healthScore: (tp.healthScore as number) || 0,
        relation: "referenced by",
      });
    }
  }

  const dedupedRelated = relatedPages.filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i);

  const getHealthVariant = (score: number) => {
    if (score >= 0.8) return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
    if (score >= 0.5) return "text-yellow-400 bg-yellow-400/15 border-yellow-400/30";
    return "text-destructive bg-destructive/15 border-destructive/30";
  };

  const confScore = (page.confidenceScore as number) || 0;
  const healthScore = (page.healthScore as number) || 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/wiki/${slug}`} className="hover:text-foreground transition-colors">{wiki.name as string}</Link>
        <span>/</span>
        <Link href={`/wiki/${slug}/pages`} className="hover:text-foreground transition-colors">Pages</Link>
        <span>/</span>
        <span className="text-foreground truncate">{page.title as string}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Article */}
        <article className="flex-1 min-w-0">
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-8 md:p-10">
              {contentMd ? (
                <div className="prose prose-invert max-w-none">
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
                  <AlertTriangle className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium">No article content yet</p>
                  <p className="text-muted-foreground text-sm max-w-md">This page is awaiting compilation. Add sources and run the compilation pipeline to generate content.</p>
                  <Link href={`/wiki/${slug}/ingest`}>
                    <span className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                      Go to Ingest Lab <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              )}

              {/* Claims section */}
              {pageClaims.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border/30">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Claims ({pageClaims.length})
                  </h3>
                  <div className="space-y-2">
                    {pageClaims.map((claim) => (
                      <div
                        key={claim.id as string}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border text-sm",
                          claim.status === "disputed"
                            ? "bg-red-500/5 border-red-500/20"
                            : claim.status === "supported"
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-muted/30 border-border/50"
                        )}
                      >
                        <span className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          claim.status === "disputed" ? "bg-red-400" : claim.status === "supported" ? "bg-emerald-400" : "bg-amber-400"
                        )} />
                        <span className="text-foreground">
                          <strong>{claim.subject}</strong> {claim.predicate} <strong>{claim.object}</strong>
                        </span>
                        <span className="ml-auto text-xs font-mono text-muted-foreground">
                          {Math.round(((claim.confidence as number) || 0) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {disputedClaims.length > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-red-500/5 border border-red-500/15">
                  <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" /> {disputedClaims.length} Disputed Claim{disputedClaims.length !== 1 ? "s" : ""}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    These claims conflict with other sources. Review the Contradictions page for details.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-primary" /> Infobox
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{infobox.type || "Article"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(confScore * 100)}%` }} />
                  </div>
                  <span className="text-xs font-mono">{Math.round(confScore * 100)}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Sources cited</p>
                <p className="text-sm font-medium">{citations.length}</p>
              </div>
              {infoboxEntries
                .filter(([k]) => !["type"].includes(k))
                .map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                    <p className="text-sm font-medium truncate">{value}</p>
                  </div>
                ))}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", getHealthVariant(healthScore))}>
                    Health {Math.round(healthScore * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {citations.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Quote className="w-4 h-4 text-primary" /> Citations ({citations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {citations.map((citation, i) => {
                  const src = citation.source as Record<string, unknown> | null;
                  return (
                    <div key={citation.id as string} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-mono text-primary/70 mt-0.5">[{i + 1}]</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{src?.title as string || "Unknown source"}</p>
                          {citation.quote && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 italic">&ldquo;{citation.quote as string}&rdquo;</p>
                          )}
                          {src?.url && (
                            <a href={src.url as string} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                              <ExternalLink className="w-3 h-3" /> Source link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {dedupedRelated.length > 0 && (
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Link2 className="w-4 h-4 text-primary" /> Related Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dedupedRelated.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/wiki/${slug}/page/${rp.slug}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 hover:border-primary/30 transition-colors"
                  >
                    <span className="text-sm truncate">{rp.title}</span>
                    <span className={cn("ml-2 shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium", getHealthVariant(rp.healthScore))}>
                      {Math.round(rp.healthScore * 100)}%
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
