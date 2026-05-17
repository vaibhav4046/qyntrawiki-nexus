import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { googleProvider } from "@/lib/oauth/google";
import { microsoftProvider } from "@/lib/oauth/microsoft";
import { notionProvider } from "@/lib/oauth/notion";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/app/connect?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/app/connect?error=missing_code_or_state", request.url)
    );
  }

  const [providerId, redirectPath] = state.split("|");
  const redirect = redirectPath || "/app/connect";

  try {
    let tokens: { accessToken: string; refreshToken?: string; expiresAt?: number; tokenType?: string };
    let fileCount = 0;

    if (providerId === "google-drive") {
      tokens = await googleProvider.exchangeCode(code);
      const files = await googleProvider.listFiles(tokens);
      fileCount = files.length;

      // Store files as sources
      for (const file of files.slice(0, 10)) {
        await prisma.source.create({
          data: {
            wikiId: "demo-wiki",
            name: file.name,
            url: `gdrive://${file.id}`,
            type: "google_drive",
            status: "ready",
            meta: JSON.stringify({ mimeType: file.mimeType, size: file.size }),
          },
        });
      }
    } else if (providerId === "microsoft") {
      tokens = await microsoftProvider.exchangeCode(code);
      const files = await microsoftProvider.listFiles(tokens);
      fileCount = files.length;

      for (const file of files.slice(0, 10)) {
        await prisma.source.create({
          data: {
            wikiId: "demo-wiki",
            name: file.name,
            url: `onedrive://${file.id}`,
            type: "microsoft",
            status: "ready",
            meta: JSON.stringify({ size: file.size }),
          },
        });
      }
    } else if (providerId === "notion") {
      tokens = await notionProvider.exchangeCode(code);
      const pages = await notionProvider.listPages(tokens);
      fileCount = pages.length;

      for (const page of pages.slice(0, 10)) {
        await prisma.source.create({
          data: {
            wikiId: "demo-wiki",
            name: page.name || "Notion Page",
            url: page.url || `notion://${page.id}`,
            type: "notion",
            status: "ready",
          },
        });
      }
    } else {
      throw new Error("Unknown provider");
    }

    // Store OAuth tokens
    await prisma.oauthToken.upsert({
      where: { id: `token-${providerId}` },
      create: {
        id: `token-${providerId}`,
        provider: providerId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : undefined,
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : undefined,
      },
    });

    // Update connector status
    await prisma.connector.updateMany({
      where: { name: providerId },
      data: { status: "connected" },
    });

    return NextResponse.redirect(
      new URL(
        `${redirect}?success=${providerId}&files=${fileCount}`,
        request.url
      )
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "OAuth callback failed";
    return NextResponse.redirect(
      new URL(`/app/connect?error=${encodeURIComponent(msg)}`, request.url)
    );
  }
}
