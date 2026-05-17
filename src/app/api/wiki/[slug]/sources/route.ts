import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const wiki = prisma.wiki.findUnique({ where: { slug } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const sources = prisma.source.findMany({
      where: { wikiId: wiki.id as string },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sources, { status: 200 });
  } catch (error) {
    console.error("GET /api/wiki/[slug]/sources error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
