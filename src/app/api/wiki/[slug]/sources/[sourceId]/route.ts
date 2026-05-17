import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; sourceId: string }> }
) {
  try {
    const { slug, sourceId } = await params;

    const wiki = prisma.wiki.findUnique({ where: { slug } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const source = prisma.source.findFirst({
      where: { id: sourceId, wikiId: wiki.id as string },
    });

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    // Delete related data first
    prisma.citation.deleteMany({ where: { sourceId } });
    prisma.ingestJob.deleteMany({ where: { sourceId } });
    
    // Delete the source
    prisma.source.delete({ where: { id: sourceId } });

    // If there's an associated page with no other sources, optionally clean it up
    const pageId = source.pageId as string;
    if (pageId) {
      const otherSources = prisma.source.findMany({ where: { pageId } });
      if (otherSources.length === 0) {
        prisma.page.delete({ where: { id: pageId } });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/wiki/[slug]/sources/[sourceId] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
