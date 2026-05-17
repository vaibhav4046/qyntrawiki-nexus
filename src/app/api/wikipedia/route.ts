import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const wikiSlug = searchParams.get("wikiSlug");

    if (!title) {
      return NextResponse.json({ error: "title query parameter is required" }, { status: 400 });
    }
    if (!wikiSlug) {
      return NextResponse.json({ error: "wikiSlug query parameter is required" }, { status: 400 });
    }

    const wiki = prisma.wiki.findUnique({ where: { slug: wikiSlug } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const encodedTitle = encodeURIComponent(title);
    const resp = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`
    );

    if (!resp.ok) {
      if (resp.status === 404) {
        return NextResponse.json({ error: `Wikipedia page "${title}" not found` }, { status: 404 });
      }
      return NextResponse.json(
        { error: `Wikipedia API error: ${resp.status}` },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const extract = data.extract || "";

    const source = prisma.source.create({
      data: {
        wikiId: wiki.id as string,
        type: "wikipedia",
        title: data.title || title,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodedTitle}`,
        rawText: extract.slice(0, 50000),
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        source,
        wikipedia: {
          title: data.title,
          extract: extract.slice(0, 500),
          pageUrl: data.content_urls?.desktop?.page,
          thumbnail: data.thumbnail?.source,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/wikipedia error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
