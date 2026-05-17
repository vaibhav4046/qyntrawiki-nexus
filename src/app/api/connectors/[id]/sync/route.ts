import { NextRequest, NextResponse } from "next/server";
import { connectorStore, getConnectorImpl } from "@/lib/connectors";
import { prisma } from "@/lib/prisma";
import { SyncItem } from "@/lib/connectors/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const connector = connectorStore.findById(id);
    if (!connector) {
      return NextResponse.json(
        { error: "Connector not found" },
        { status: 404 }
      );
    }

    if (!connector.connected) {
      return NextResponse.json(
        {
          success: false,
          added: 0,
          message: "Connector is not connected",
        },
        { status: 400 }
      );
    }

    const impl = getConnectorImpl(connector.type);
    if (!impl) {
      return NextResponse.json(
        {
          success: false,
          added: 0,
          message: `No implementation found for connector type: ${connector.type}`,
        },
        { status: 400 }
      );
    }

    const items: SyncItem[] = await impl.sync(
      connector.config,
      connector.credentials
    );

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    let wikiId: string | undefined;
    if (typeof body.wikiId === "string" && body.wikiId.trim()) {
      wikiId = body.wikiId.trim();
    }

    if (!wikiId) {
      const url = new URL(req.url);
      const queryWikiId = url.searchParams.get("wikiId");
      if (queryWikiId) {
        wikiId = queryWikiId;
      }
    }

    if (!wikiId) {
      return NextResponse.json(
        {
          success: false,
          added: 0,
          message: "wikiId is required (provide in body or query param)",
        },
        { status: 400 }
      );
    }

    const wiki = prisma.wiki.findUnique({ where: { id: wikiId } });
    if (!wiki) {
      return NextResponse.json(
        { error: "Wiki not found" },
        { status: 404 }
      );
    }

    let added = 0;
    for (const item of items) {
      prisma.source.create({
        data: {
          wikiId: wiki.id as string,
          type: item.type || "text",
          title: item.title,
          rawText: item.rawText,
          url: item.url || "",
          status: "pending",
        },
      });
      added++;
    }

    return NextResponse.json(
      {
        success: true,
        added,
        message: `Synced ${added} items from ${connector.name}`,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("POST /api/connectors/[id]/sync error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, added: 0, message },
      { status: 500 }
    );
  }
}
