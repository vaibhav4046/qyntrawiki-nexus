import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Shield, ArrowUpRight } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WikiPagesPage({ params }: Props) {
  const { slug } = await params;

  const wiki = prisma.wiki.findUnique({ where: { slug } });

  if (!wiki) notFound();

  const wikiId = wiki.id as string;

  const pages = prisma.page.findMany({
    where: { wikiId },
    orderBy: { updatedAt: "desc" },
  });

  const getHealthVariant = (score: number) => {
    if (score >= 0.8) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    if (score >= 0.5) return "bg-yellow-400/15 text-yellow-400 border-yellow-400/30";
    return "bg-destructive/15 text-destructive border-destructive/30";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <p className="mt-1 text-muted-foreground">
          {pages.length} page{pages.length !== 1 ? "s" : ""} compiled for {wiki.name as string}
        </p>
      </div>

      {pages.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-muted-foreground">No pages yet. Ingest sources and compile to generate wiki pages.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <Link key={page.id as string} href={`/wiki/${slug}/page/${page.slug}`}>
              <Card className="glass-card hover:border-primary/30 transition-all h-full group">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                      {page.title as string}
                    </CardTitle>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                  </div>
                  {page.summary && (
                    <CardDescription className="line-clamp-2">{page.summary as string}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        getHealthVariant(page.healthScore as number)
                      )}
                    >
                      <Shield className="w-3 h-3" />
                      Health {Math.round((page.healthScore as number) * 100)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((page.confidenceScore as number) * 100)}% confidence
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
