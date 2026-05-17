import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { googleProvider } from "@/lib/oauth/google";
import { microsoftProvider } from "@/lib/oauth/microsoft";
import { notionProvider } from "@/lib/oauth/notion";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Find stored token
  const tokenRecord = await prisma.oauthToken.findFirst({
    where: { provider: id },
  });

  if (!tokenRecord) {
    return NextResponse.json({ error: "Not connected. Please authenticate first." }, { status: 401 });
  }

  const tokens = {
    accessToken: tokenRecord.accessToken as string,
    refreshToken: tokenRecord.refreshToken as string | undefined,
    expiresAt: tokenRecord.expiresAt ? new Date(tokenRecord.expiresAt as string).getTime() : undefined,
  };

  // Refresh if expired
  let freshTokens = tokens;
  if (tokens.expiresAt && Date.now() > tokens.expiresAt) {
    try {
      if (id === "google-drive") {
        freshTokens = await googleProvider.refreshToken(tokens);
      } else if (id === "microsoft") {
        freshTokens = await microsoftProvider.refreshToken(tokens);
      }
      // Update stored token
      await prisma.oauthToken.update({
        where: { id: tokenRecord.id as string },
        data: {
          accessToken: freshTokens.accessToken,
          refreshToken: freshTokens.refreshToken,
          expiresAt: freshTokens.expiresAt ? new Date(freshTokens.expiresAt).toISOString() : undefined,
        },
      });
    } catch {
      return NextResponse.json({ error: "Token refresh failed. Please reconnect." }, { status: 401 });
    }
  }

  try {
    let files: Array<{ id: string; name: string; mimeType?: string; content?: string }> = [];

    if (id === "google-drive") {
      const driveFiles = await googleProvider.listFiles(freshTokens);
      files = await Promise.all(
        driveFiles.slice(0, 5).map(async (f) => {
          let content = "";
          try {
            content = await googleProvider.downloadFile(freshTokens, f.id);
          } catch {
            // Some files may not be downloadable
          }
          return { id: f.id, name: f.name, mimeType: f.mimeType, content };
        })
      );
    } else if (id === "microsoft") {
      const msFiles = await microsoftProvider.listFiles(freshTokens);
      files = await Promise.all(
        msFiles.slice(0, 5).map(async (f) => {
          let content = "";
          try {
            content = await microsoftProvider.downloadFile(freshTokens, f.id);
          } catch {
            // Some files may not be downloadable
          }
          return { id: f.id, name: f.name, content };
        })
      );
    } else if (id === "notion") {
      const pages = await notionProvider.listPages(freshTokens);
      files = await Promise.all(
        pages.slice(0, 5).map(async (p) => {
          const content = await notionProvider.getPageContent(freshTokens, p.id);
          return { id: p.id, name: p.name, content };
        })
      );
    }

    // Create file items and sources
    const results = [];
    for (const file of files) {
      if (!file.content) continue;

      const source = await prisma.source.create({
        data: {
          wikiId: "demo-wiki",
          name: file.name,
          url: `${id}://${file.id}`,
          type: id,
          status: "ready",
          rawText: file.content.slice(0, 10000),
          meta: JSON.stringify({ mimeType: file.mimeType, syncedAt: new Date().toISOString() }),
        },
      });

      await prisma.fileItem.create({
        data: {
          wikiId: "demo-wiki",
          name: file.name,
          path: `${id}://${file.id}`,
          extension: file.mimeType || "txt",
          mimeType: file.mimeType || "text/plain",
          sizeBytes: file.content.length,
          summary: file.content.slice(0, 200),
          sourceId: source.id as string,
        },
      });

      results.push({ name: file.name, size: file.content.length });
    }

    return NextResponse.json({
      success: true,
      synced: results.length,
      files: results,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
