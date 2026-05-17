import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { BookOpen, ArrowRight, Star, FileText, AlertCircle } from "lucide-react";

export default async function WikiHomePage() {
  const wikiId = "demo-wiki";

  const pages = await prisma.page.findMany({
    where: { wikiId },
    orderBy: { updatedAt: "desc" },
  });

  const categories = [
    { name: "Concepts", count: pages.filter((p) => (p.infoboxJson as string)?.includes("Concept")).length },
    { name: "Products", count: pages.filter((p) => (p.infoboxJson as string)?.includes("Product")).length },
    { name: "Published", count: pages.filter((p) => p.isPublic).length },
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#f5f0eb]">Personal Wiki</h1>
        <p className="mt-1 text-sm text-[#a89f91]">
          {pages.length} compiled articles from your sources
        </p>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10">
        {/* Categories */}
        <div className="flex gap-3 mb-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="glass-card px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <span className="text-xs font-medium text-[#f5f0eb]">{cat.name}</span>
              <span className="text-[10px] text-[#6b6560]">{cat.count}</span>
            </div>
          ))}
        </div>

        {/* Pages grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pages.map((page) => {
            const infobox = JSON.parse((page.infoboxJson as string) || "{}");
            const health = (page.healthScore as number) || 0;
            return (
              <Link
                key={page.id as string}
                href={`/app/wiki/${page.slug as string}`}
                className="glass-card p-5 rounded-lg group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-[#fbbf24]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#f5f0eb] group-hover:text-[#fbbf24] transition-colors">
                        {page.title as string}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {infobox.type && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(245,158,11,0.1)] text-[#fbbf24] rounded">
                            {infobox.type}
                          </span>
                        )}
                        {page.isPublic && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(34,197,94,0.1)] text-green-400 rounded flex items-center gap-1">
                            <Star className="w-2.5 h-2.5" /> Public
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6b6560] group-hover:text-[#fbbf24] transition-colors" />
                </div>

                <p className="text-xs text-[#a89f91] leading-relaxed mb-3 line-clamp-2">
                  {page.summary as string}
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[#6b6560]">Health</span>
                      <span
                        className={cn(
                          "text-[10px] font-bold",
                          health > 0.8 ? "text-green-400" : health > 0.6 ? "text-amber-400" : "text-red-400"
                        )}
                      >
                        {Math.round(health * 100)}%
                      </span>
                    </div>
                    <div className="health-bar rounded-full">
                      <div
                        className="health-bar-fill rounded-full"
                        style={{ width: `${health * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#6b6560]">
                    <FileText className="w-3 h-3" />
                    <span className="text-[10px]">{infobox.sourceCount || 0} sources</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {pages.length === 0 && (
          <div className="empty-state py-12">
            <AlertCircle className="w-10 h-10 mb-4" />
            <p className="text-sm text-[#a89f91]">No wiki pages yet.</p>
            <p className="text-xs text-[#6b6560] mt-1">
              Import sources to automatically generate articles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
