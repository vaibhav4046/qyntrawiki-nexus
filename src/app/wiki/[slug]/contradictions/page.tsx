import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, CheckCircle2, XCircle, MinusCircle, Scale } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

const statusBadge = (status: string) => {
  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium";
  switch (status) {
    case "disputed":
      return <span className={cn(base, "bg-red-500/10 text-red-400 border border-red-500/20")}><AlertTriangle className="w-3 h-3" /> Disputed</span>;
    case "supported":
      return <span className={cn(base, "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20")}><CheckCircle2 className="w-3 h-3" /> Supported</span>;
    case "refuted":
      return <span className={cn(base, "bg-red-500/10 text-red-400 border border-red-500/20")}><XCircle className="w-3 h-3" /> Refuted</span>;
    default:
      return <span className={cn(base, "bg-amber-500/10 text-amber-400 border border-amber-500/20")}><MinusCircle className="w-3 h-3" /> {status}</span>;
  }
};

export default async function ContradictionsPage({ params }: Props) {
  const { slug } = await params;

  const wiki = prisma.wiki.findUnique({ where: { slug } });
  if (!wiki) return null;
  const wikiId = wiki.id as string;

  const claims = prisma.claim.findMany({ where: { wikiId } });
  const disputed = claims.filter(c => (c.status as string) === "disputed");

  const claimsWithPages = disputed.map(c => ({
    ...c,
    page: prisma.page.findFirst({ where: { id: c.pageId as string } }) as Record<string, unknown> | null,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Scale className="w-7 h-7 text-primary" />
          Contradiction Ledger
        </h1>
        <p className="text-muted-foreground mt-1">
          {disputed.length} contradiction{disputed.length !== 1 ? "s" : ""} detected in {slug}
        </p>
      </div>

      {disputed.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400/50" />
            <p className="text-muted-foreground text-lg font-medium">No contradictions detected</p>
            <p className="text-muted-foreground text-sm">All claims in this wiki are consistent with each other</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {claimsWithPages.map((claim) => (
            <Card key={claim.id as string} className="glass-card border-red-500/10 hover:border-red-500/20 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">Contradicting Claims</CardTitle>
                  {statusBadge(claim.status as string)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 space-y-2">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Claim A</span>
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{claim.subject as string}</span>
                      <span className="text-muted-foreground"> {claim.predicate as string} </span>
                      <span className="text-foreground">{claim.object as string}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Confidence: {((claim.confidence as number) * 100).toFixed(0)}%</span>
                    </div>
                    {claim.page && (
                      <Link
                        href={`/wiki/${slug}/page/${claim.page.slug}`}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {claim.page.title as string}
                      </Link>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10 space-y-2">
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Claim B</span>
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{claim.subject as string}</span>
                      <span className="text-muted-foreground"> {claim.predicate as string} </span>
                      <span className="text-foreground">{claim.object as string}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Confidence: {((claim.confidence as number) * 100).toFixed(0)}%</span>
                    </div>
                    {claim.page && (
                      <Link
                        href={`/wiki/${slug}/page/${claim.page.slug}`}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {claim.page.title as string}
                      </Link>
                    )}
                  </div>
                </div>

                {claim.explanation && (
                  <div className="p-3 rounded-md bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      {claim.explanation as string}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
