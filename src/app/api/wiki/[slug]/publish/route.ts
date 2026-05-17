import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const wiki = await prisma.wiki.findUnique({ where: { slug } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const wikiId = wiki.id as string;

    const pages = await prisma.page.findMany({
      where: { wikiId },
      orderBy: { updatedAt: "desc" },
    });

    const settings = await prisma.publishSettings.findFirst({
      where: { wikiId },
    });

    return NextResponse.json({ wiki, pages, settings });
  } catch (error) {
    console.error("GET /api/wiki/[slug]/publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const wiki = await prisma.wiki.findUnique({ where: { slug } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const wikiId = wiki.id as string;

    // Update wiki published status
    const updatedWiki = await prisma.wiki.update({
      where: { id: wikiId },
      data: { isPublished: body.isPublished ?? !wiki.isPublished },
    });

    // Update publish settings if provided
    if (body.publicSlug !== undefined || body.publicTitle !== undefined) {
      const existing = await prisma.publishSettings.findFirst({ where: { wikiId } });

      if (existing) {
        await prisma.publishSettings.update({
          where: { id: existing.id as string },
          data: {
            publicSlug: body.publicSlug ?? existing.publicSlug,
            publicTitle: body.publicTitle ?? existing.publicTitle,
            publicDescription: body.publicDescription ?? existing.publicDescription,
            allowedPageSlugs: body.allowedPageSlugs ? JSON.stringify(body.allowedPageSlugs) : existing.allowedPageSlugs,
            hidePrivateSources: body.hidePrivateSources ?? existing.hidePrivateSources,
            showGeneratedLabel: body.showGeneratedLabel ?? existing.showGeneratedLabel,
          },
        });
      } else {
        await prisma.publishSettings.create({
          data: {
            wikiId,
            publicSlug: body.publicSlug || (wiki.slug as string),
            publicTitle: body.publicTitle || (wiki.name as string),
            publicDescription: body.publicDescription || "",
            allowedPageSlugs: body.allowedPageSlugs ? JSON.stringify(body.allowedPageSlugs) : "[]",
            hidePrivateSources: body.hidePrivateSources ?? true,
            showGeneratedLabel: body.showGeneratedLabel ?? true,
          },
        });
      }
    }

    // Update page public status if allowed pages provided
    if (body.allowedPageSlugs && Array.isArray(body.allowedPageSlugs)) {
      const allPages = await prisma.page.findMany({ where: { wikiId } });
      for (const page of allPages) {
        const shouldBePublic = body.allowedPageSlugs.includes(page.slug as string);
        if (page.isPublic !== shouldBePublic) {
          await prisma.page.update({
            where: { id: page.id as string },
            data: { isPublic: shouldBePublic },
          });
        }
      }
    }

    return NextResponse.json({ success: true, wiki: updatedWiki });
  } catch (error) {
    console.error("POST /api/wiki/[slug]/publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
