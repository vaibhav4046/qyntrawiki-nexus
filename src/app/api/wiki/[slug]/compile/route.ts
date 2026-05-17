import { NextRequest, NextResponse } from "next/server";
import { compileSource } from "@/lib/wiki-compiler";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { sourceId } = await req.json();

    if (!sourceId || typeof sourceId !== "string") {
      return NextResponse.json({ error: "sourceId is required" }, { status: 400 });
    }

    const result = await compileSource(sourceId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/wiki/[slug]/compile error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
