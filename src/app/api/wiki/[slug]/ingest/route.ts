import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { type, title, rawText, content, url } = await req.json();

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const wiki = await prisma.wiki.findUnique({ where: { slug } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const source = await prisma.source.create({
      data: {
        wikiId: wiki.id as string,
        type: type || "text",
        title: title.trim(),
        rawText: (rawText || content || "").slice(0, 50000),
        url: url || "",
        status: "pending",
      },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error("POST /api/wiki/[slug]/ingest error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
