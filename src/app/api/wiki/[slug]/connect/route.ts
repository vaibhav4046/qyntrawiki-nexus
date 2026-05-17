import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { connectorStore, getConnectorImpl } from "@/lib/connectors";
import { compileSource } from "@/lib/wiki-compiler";
import { SyncItem } from "@/lib/connectors/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const body = (await req.json()) as Record<string, unknown>;
    const connectorId =
      typeof body.connectorId === "string" ? body.connectorId : undefined;
    const autoCompile = body.autoCompile === true;

    if (!connectorId) {
      return NextResponse.json(
        { error: "connectorId is required" },
        { status: 400 }
      );
    }

    const wiki = prisma.wiki.findUnique({ where: { slug } });
    if (!wiki) {
      return NextResponse.json(
        { error: "Wiki not found" },
        { status: 404 }
      );
    }

    const connector = connectorStore.findById(connectorId);
    if (!connector) {
      return NextResponse.json(
        { error: "Connector not found" },
        { status: 404 }
      );
    }

    if (!connector.connected) {
      return NextResponse.json(
        { error: "Connector is not connected" },
        { status: 400 }
      );
    }

    const impl = getConnectorImpl(connector.type);
    if (!impl) {
      return NextResponse.json(
        {
          error: `No implementation found for connector type: ${connector.type}`,
        },
        { status: 400 }
      );
    }

    const items: SyncItem[] = await impl.sync(
      connector.config,
      connector.credentials
    );

    const createdSources: Array<Record<string, unknown>> = [];
    for (const item of items) {
      const source = prisma.source.create({
        data: {
          wikiId: wiki.id as string,
          type: item.type || "text",
          title: item.title,
          rawText: item.rawText,
          url: item.url || "",
          status: "pending",
        },
      });
      createdSources.push(source);
    }

    if (autoCompile) {
      for (const source of createdSources) {
        try {
          await compileSource(source.id as string);
        } catch (compileErr: unknown) {
          const msg =
            compileErr instanceof Error
              ? compileErr.message
              : "Compilation failed";
          console.error(`Auto-compile failed for source ${source.id}:`, msg);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        added: createdSources.length,
        sources: createdSources,
        compiled: autoCompile,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("POST /api/wiki/[slug]/connect error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
